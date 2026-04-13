package com.example.demo.controller;

import java.net.HttpURLConnection;
import java.util.List;

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
import com.example.demo.utility.ResponseMessage;
import com.example.demo.utility.ResponseStatus;

import io.github.resilience4j.ratelimiter.annotation.RateLimiter;

@RestController
@RequestMapping("/api/v1/comments")
public class CommentController {
	@Autowired
	private CommentService commentService;

	@PostMapping("/posts/{postId}/comments")
	
	public ResponseEntity<?> addComment(@PathVariable Long postId, @RequestBody CommentDto commentDto) {
		Comment comment = commentService.addComment(postId, commentDto);
		if (comment == null) {
			return ResponseEntity.ok(new ResponseMessage(HttpURLConnection.HTTP_NOT_ACCEPTABLE,
					ResponseStatus.FAILURE.name(), "commenting failed"));
		}
		return ResponseEntity.ok(new ResponseMessage(HttpURLConnection.HTTP_CREATED, ResponseStatus.SUCCESS.name(),
				"commented successfully", comment));
	}

	@GetMapping("/posts/{postId}/comments")
	@RateLimiter(name = "myRateLimiter")
	public ResponseEntity<?> readComments(@PathVariable Long postId) {
		List<Comment> comments = commentService.readComments(postId);
		if (comments.isEmpty()) {
			return ResponseEntity.ok(new ResponseMessage(HttpURLConnection.HTTP_NOT_ACCEPTABLE,
					ResponseStatus.FAILURE.name(), "No Comments"));
		}
		return ResponseEntity.ok(new ResponseMessage(HttpURLConnection.HTTP_CREATED, ResponseStatus.SUCCESS.name(),
				"All comments retrived successfully", comments));
	}

	@PutMapping("/{id}")
	@RateLimiter(name = "myRateLimiter")
	public ResponseEntity<?> updateComment(@PathVariable Long id, @RequestBody CommentDto commentDto) {
		Comment updateComment = commentService.updateComment(id, commentDto);
		if (updateComment == null) {
			return ResponseEntity.ok(new ResponseMessage(HttpURLConnection.HTTP_NOT_ACCEPTABLE,
					ResponseStatus.FAILURE.name(), "comment updating failed"));
		}
		return ResponseEntity.ok(new ResponseMessage(HttpURLConnection.HTTP_CREATED, ResponseStatus.SUCCESS.name(),
				"comment updated successfully", updateComment));
	}

	@DeleteMapping("/{id}")
	@RateLimiter(name = "myRateLimiter")
	public String deleteComment(@PathVariable Long id) {
		String deleteComment = commentService.deleteComment(id);
		return deleteComment;
	}

	@PatchMapping("/{id}/status")
	@RateLimiter(name = "myRateLimiter")
	public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestParam String status) {
		Comment updateStatus = commentService.updateStatus(id, status);
		return ResponseEntity.ok(updateStatus);
	}
}
