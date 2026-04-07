package com.example.demo.service;

import com.example.demo.dto.CommentDto;
import com.example.demo.entity.Comment;

public interface CommentService {
	public Comment addComment(Long postId, CommentDto comment);

	public Comment readComment(Long postId);

	public Comment updateComment(Long id, CommentDto commentDto);

	public String deleteComment(Long id);

	public Comment updateStatus(Long id, String status);
}
