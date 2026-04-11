package com.example.demo.service;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.dto.CommentDto;
import com.example.demo.entity.Comment;
import com.example.demo.exception.CommentNotFoundException;
import com.example.demo.exception.PostNotFoundException;
import com.example.demo.repository.CommentRepository;
import com.example.demo.utility.CommentStatus;

@Service
public class CommentServiceImpl implements CommentService {
	@Autowired
	private CommentRepository commentRepository;

	@Override
	public Comment addComment(Long postId, CommentDto comment) {
		Comment addComment = commentRepository.findByPostId(postId)
				.orElseThrow(() -> new PostNotFoundException("Post not found :" + postId));
		Comment newComment = new Comment();
		newComment.setPostId(postId);
		newComment.setAuthorId(comment.getAuthorId());
		newComment.setParentId(comment.getParentId());
		newComment.setContent(comment.getContent());
		return commentRepository.save(newComment);
	}

	@Override
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
		return commentRepository.save(updateComment);

	}

	@Override
	public List<Comment> readComments(Long postId) {
		List<Comment> allComments = commentRepository.findAllByPostId(postId);
		if (allComments.isEmpty()) {
			throw new CommentNotFoundException("No Comments");

		}
		return allComments;
	}

	@Override
	public String deleteComment(Long id) {
		Comment comment = commentRepository.findById(id)
				.orElseThrow(() -> new CommentNotFoundException("comment Already deleted"));
		commentRepository.delete(comment);
		return "deleted successfully";
	}

	@Override
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
