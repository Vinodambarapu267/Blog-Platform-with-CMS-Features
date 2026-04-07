package com.example.demo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.CommentDto;
import com.example.demo.entity.Comment;
import com.example.demo.service.CommentService;

@RestController
@RequestMapping("/api/v1/comments")
public class CommentController {
	@Autowired
	private CommentService commentService;

	@PostMapping("/posts/{postId}/comments")
	public ResponseEntity<?> addComment(@PathVariable Long postId, @RequestBody CommentDto commentDto) {
		Comment comment = commentService.addComment(postId, commentDto);
		return ResponseEntity.ok(comment);
	}

	@GetMapping("/posts/{postId}/comments")
	public ResponseEntity<?> readComments(@PathVariable Long postId) {
		Comment comment = commentService.readComment(postId);
		return ResponseEntity.ok(comment);
	}

	@PutMapping("/{id}")
	public ResponseEntity<?> updateComment(@PathVariable Long id, @RequestBody CommentDto commentDto) {
		Comment updateComment = commentService.updateComment(id, commentDto);
		return ResponseEntity.ok(updateComment);
	}

	@DeleteMapping("/{id}")
	public String deleteComment(@PathVariable Long id) {
		String deleteComment = commentService.deleteComment(id);
		return deleteComment;
	}



	@PatchMapping("/{id}/status")
	public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestParam String status) {
		Comment updateStatus = commentService.updateStatus(id, status);
		return ResponseEntity.ok(updateStatus);
	}
}
