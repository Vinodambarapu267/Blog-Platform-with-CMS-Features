package com.example.demo.service;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import com.example.demo.dto.CommentDto;
import com.example.demo.entity.Comment;
import com.example.demo.exception.CommentNotFoundException;
import com.example.demo.exception.PostNotFoundException;
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

	@Override
	public Comment addComment(Long postId, CommentDto comment) {
		Comment newComment = new Comment();
		newComment.setPostId(postId);
		newComment.setAuthorId(comment.getAuthorId());
		newComment.setParentId(comment.getParentId());
		newComment.setContent(comment.getContent());
		Comment save = commentRepository.save(newComment);
		CommentEvent event = new CommentEvent();
		event.setCommentId(save.getCommentId());
		event.setPostId(save.getPostId());
		event.setAuthorId(save.getAuthorId());
		event.setContent(save.getContent());
		event.setParentId(save.getParentId());
		event.setEventType(KafkaEvent.CREATED.name());
		commentKafkaProducer.commentCreated(event);
		return save;
	}

	@Override
	@CachePut(value = "comment", key = "#id")
	public Comment updateComment(Long id, CommentDto commentDto) {
		Comment addComment = commentRepository.findById(id)
				.orElseThrow(() -> new CommentNotFoundException("Comment not found : " + id));
		Comment updateComment = new Comment();
		updateComment.setCommentId(id);
		updateComment.setCreatedAt(Instant.now());
		updateComment.setParentId(commentDto.getParentId());
		updateComment.setAuthorId(commentDto.getAuthorId());
		updateComment.setContent(commentDto.getContent());
		updateComment.setPostId(addComment.getPostId());

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
	@Cacheable(value = "comments", key = "#postId")
	public List<Comment> readComments(Long postId) {
		List<Comment> allComments = commentRepository.findAllByPostId(postId);
		if (allComments.isEmpty()) {
			throw new CommentNotFoundException("No Comments");

		}
		return allComments;
	}

	@Override
	@CacheEvict(value = "comment", key = "#id")
	public String deleteComment(Long id) {
		Comment comment = commentRepository.findById(id)
				.orElseThrow(() -> new CommentNotFoundException("comment Already deleted"));
		commentRepository.delete(comment);
		return "deleted successfully";
	}

	@Override
	@Transactional
	public void deleteAllCommentWhenThePostDeleted(Long postId) {
		commentRepository.deleteByPostId(postId);
	}

	@Override
	@CachePut(value = "comment", key = "#id")
	public Comment updateStatus(Long id, String status) {
		Comment comment = commentRepository.findById(id)
				.orElseThrow(() -> new CommentNotFoundException("Comment not found"));
		comment.setStatus(updateCommentStatus(status.toUpperCase()));
		return comment;
	}

	private CommentStatus updateCommentStatus(String status) {
		return switch (status) {
		case "APPROVED" -> CommentStatus.APPROVED;
		case "PENDING" -> CommentStatus.PENDING;
		case "REJECTED" -> CommentStatus.REJECTED;
		default -> throw new IllegalArgumentException("enter correct status");
		};
	}

}
