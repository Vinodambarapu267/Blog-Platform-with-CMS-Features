package com.example.demo.service;

import java.time.Instant;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import com.example.demo.dto.CommentDto;
import com.example.demo.dto.UserDto;
import com.example.demo.entity.Comment;
import com.example.demo.exception.CommentNotFoundException;
import com.example.demo.exception.UserNotFoundException;
import com.example.demo.feignclients.UserFeignClient;
import com.example.demo.kafka.CommentEvent;
import com.example.demo.kafka.KafkaCommentProducer;
import com.example.demo.repository.CommentRepository;
import com.example.demo.utility.CommentStatus;
import com.example.demo.utility.KafkaEvent;

import jakarta.transaction.Transactional;

@Service
public class CommentServiceImpl implements CommentService {
	@Autowired
	private CommentRepository commentRepository;
	@Autowired
	private KafkaCommentProducer commentKafkaProducer;
	@Autowired
	private UserFeignClient client;

	private Set<String> authorities(Authentication authentication) {
		if (authentication == null)
			return Set.of();
		return authentication.getAuthorities().stream().map(a -> a.getAuthority()).collect(Collectors.toSet());
	}

	private boolean has(Set<String> authorities, String permission) {
		return authorities.contains(permission);
	}

	private void requirePermission(Set<String> authorities, String permission) {
		if (!has(authorities, permission)) {
			throw new AccessDeniedException("Missing permission: " + permission);
		}
	}

	private Long resolveUserId(String username) {
		UserDto user = client.findByUsername(username);
		if (user == null || user.getUserId() == null) {
			throw new UserNotFoundException("User Not found by username: " + username);
		}
		return user.getUserId();
	}

	private boolean isOwner(Comment comment, Authentication authentication) {
		if (authentication == null || authentication.getName() == null)
			return false;
		Long callerUserId = resolveUserId(authentication.getName());
		return comment.getAuthorId() != null && comment.getAuthorId().equals(callerUserId);
	}

	@Override
	public Comment addComment(Long postId, CommentDto comment, String username) {
		Long userId = resolveUserId(username);
		Comment newComment = new Comment();
		newComment.setPostId(postId);
		newComment.setAuthorId(userId);
		newComment.setParentId(comment.getParentId());
		newComment.setContent(comment.getContent());
		Comment save = commentRepository.save(newComment);
		CommentEvent event = new CommentEvent();
		event.setCommentId(save.getCommentId());
		event.setPostId(save.getPostId());
		event.setAuthorId(userId);
		event.setContent(save.getContent());
		event.setParentId(save.getParentId());
		event.setEventType(KafkaEvent.CREATED.name());
		commentKafkaProducer.commentCreated(event);
		return save;
	}

	@Override
	@CachePut(value = "updateComment", key = "#id")
	public Comment updateComment(Long id, CommentDto commentDto, Authentication authentication) {
		Comment existing = commentRepository.findById(id)
				.orElseThrow(() -> new CommentNotFoundException("Comment not found : " + id));

		Set<String> authorities = authorities(authentication);

		// ownership check — only the comment's author can edit it
		if (!isOwner(existing, authentication)) {
			throw new AccessDeniedException("You can only edit your own comments");
		}

		// 15-minute edit window
		Instant createdAt = existing.getCreatedAt();
		if (createdAt != null && Instant.now().isAfter(createdAt.plusSeconds(15 * 60))) {
			throw new AccessDeniedException("Edit window has expired (15 minutes)");
		}
		Comment updateComment = new Comment();
		updateComment.setCommentId(id);
		updateComment.setCreatedAt(Instant.now());
		updateComment.setParentId(commentDto.getParentId());
		updateComment.setAuthorId(commentDto.getAuthorId());
		updateComment.setContent(commentDto.getContent());
		updateComment.setPostId(existing.getPostId());

		Comment save = commentRepository.save(updateComment);
		CommentEvent event = new CommentEvent();
		event.setCommentId(save.getCommentId());
		event.setPostId(save.getPostId());
		event.setAuthorId(save.getAuthorId());
		event.setContent(save.getContent());
		event.setParentId(save.getParentId());
		event.setEventType(KafkaEvent.UPDATED.name());
		commentKafkaProducer.commentModerated(event);
		return save;
	}

	@Override
	@Cacheable(value = "allComments", key = "#postId")
	public List<Comment> readComments(Long postId) {
		List<Comment> allComments = commentRepository.findAllByPostId(postId);
		if (allComments.isEmpty()) {
			throw new CommentNotFoundException("No Comments");

		}
		return allComments;
	}

	@Override
	@CacheEvict(value = "deleteComment", key = "#id")
	public String deleteComment(Long id, Authentication authentication) {
		Comment comment = commentRepository.findById(id)
				.orElseThrow(() -> new CommentNotFoundException("comment Already deleted"));
		Set<String> authorities = authorities(authentication);

		boolean canDeleteAny = has(authorities, "COMMENT_DELETE_ANY");
		boolean isOwner = isOwner(comment, authentication);

		if (!canDeleteAny && !isOwner) {
			throw new AccessDeniedException("You can only delete your own comments");
		}

		commentRepository.delete(comment);
		return "deleted successfully";
	}

	@Override
	@Transactional
	@CacheEvict(value = "deleteCommentByPostId", key = "#postId")
	public void deleteAllCommentWhenThePostDeleted(Long postId) {
		commentRepository.deleteByPostId(postId);
	}

	@Override
	@CacheEvict(value = "allComments", key = "#id")
	@CachePut(value = "updateCommentStatus", key = "#id")
	public Comment updateStatus(Long id, String status, Authentication authentication) {
		Comment comment = commentRepository.findById(id)
				.orElseThrow(() -> new CommentNotFoundException("Comment not found"));
		comment.setStatus(updateCommentStatus(status.toUpperCase()));
		Comment saved = commentRepository.save(comment);

		CommentEvent event = new CommentEvent();
		event.setCommentId(saved.getCommentId());
		event.setPostId(saved.getPostId());
		event.setAuthorId(saved.getAuthorId());
		event.setStatus(updateCommentStatus(saved.getStatus().name()));
		event.setEventType(KafkaEvent.UPDATED.name());
		commentKafkaProducer.commentModerated(event);
		return saved;
	}

	@Override
	@Cacheable(value = "AllComments", key = "'all'")
	public List<Comment> findAllComments() {
		List<Comment> comments = commentRepository.findAll();
		if (comments == null) {
			throw new CommentNotFoundException("No comment ");
		}
		return comments;
	}

	private CommentStatus updateCommentStatus(String status) {
		return switch (status) {
		case "APPROVED" -> CommentStatus.APPROVED;
		case "PENDING" -> CommentStatus.PENDING;
		case "REJECTED" -> CommentStatus.REJECTED;
		case "DELETED" -> CommentStatus.DELETED;
		default -> throw new IllegalArgumentException("enter correct status");
		};
	}

}
