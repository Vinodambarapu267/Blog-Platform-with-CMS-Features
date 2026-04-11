package com.example.demo.service;

import java.util.List;

import com.example.demo.dto.CommentDto;
import com.example.demo.entity.Comment;

public interface CommentService {
	public Comment addComment(Long postId, CommentDto comment);

	public List<Comment> readComments(Long postId);

	public Comment updateComment(Long id, CommentDto commentDto);

	public String deleteComment(Long id);

	public Comment updateStatus(Long id, String status);
}
