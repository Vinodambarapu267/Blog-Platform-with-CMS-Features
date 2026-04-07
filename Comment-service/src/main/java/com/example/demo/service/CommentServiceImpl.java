package com.example.demo.service;

import java.time.Instant;
import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.dto.CommentDto;
import com.example.demo.entity.Comment;
import com.example.demo.repository.CommentRepository;
import com.example.demo.utility.CommentStatus;

@Service
public class CommentServiceImpl implements CommentService {
	@Autowired
	private CommentRepository commentRepository;

	@Override
	public Comment addComment(Long postId, CommentDto comment) {
		Comment addComment = commentRepository.findByPostId(postId)
				.orElseThrow(() -> new RuntimeException("Post not found"));
		Comment newComment = new Comment();
		newComment.setPostId(postId);
		newComment.setAuthorId(comment.getAuthorId());
		newComment.setParent(comment.getParent());
		newComment.setContent(comment.getContent());
		return commentRepository.save(newComment);
	}

	@Override
	public Comment updateComment(Long id, CommentDto commentDto) {
		Comment addComment = commentRepository.findById(id)
				.orElseThrow(() -> new RuntimeException("Comment not found "));
		Comment updateComment = new Comment();
		updateComment.setCommentId(id);
		updateComment.setCreatedAt(Instant.now());
		updateComment.setAuthorId(commentDto.getAuthorId());
		updateComment.setParent(commentDto.getParent());
		updateComment.setContent(commentDto.getContent());
		updateComment.setPostId(addComment.getPostId());
		return commentRepository.save(updateComment);

	}

	@Override
	public Comment readComment(Long postId) {
		Comment comment = commentRepository.findByPostId(postId)
				.orElseThrow(() -> new RuntimeException("Comment not found"));
		return comment;
	}

	@Override
	public String deleteComment(Long id) {
		Comment comment = commentRepository.findById(id)
				.orElseThrow(() -> new RuntimeException("comment Already deleted"));
		commentRepository.delete(comment);
		return "deleted successfully";
	}

	@Override
	public Comment updateStatus(Long id, String status) {
		Comment comment = commentRepository.findById(id).orElseThrow(() -> new RuntimeException("Comment not found"));
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
