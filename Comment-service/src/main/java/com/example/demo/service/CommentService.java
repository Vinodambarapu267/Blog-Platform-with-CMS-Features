package com.example.demo.service;

import java.util.List;

import org.springframework.security.core.Authentication;

import com.example.demo.dto.CommentDto;
import com.example.demo.entity.Comment;

public interface CommentService {
	public Comment addComment(Long postId, CommentDto comment, String username);

	public List<Comment> readComments(Long postId);

	public Comment updateComment(Long id, CommentDto commentDto, Authentication authentication);

	public String deleteComment(Long id, Authentication authentication);

	public Comment updateStatus(Long id, String status, Authentication authentication);

	public void deleteAllCommentWhenThePostDeleted(Long postId);
}
