package com.example.demo.controller;

import java.net.HttpURLConnection;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
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
	@PreAuthorize("hasAuthority('COMMENT_CREATE')")
	public ResponseEntity<?> addComment(@PathVariable Long postId, @RequestBody CommentDto commentDto,
			Authentication authentication) {
		Comment comment = commentService.addComment(postId, commentDto, authentication.getName());
		if (comment == null) {
			return ResponseEntity.ok(new ResponseMessage(HttpURLConnection.HTTP_NOT_ACCEPTABLE,
					ResponseStatus.FAILURE.name(), "commenting failed"));
		}
		return ResponseEntity.ok(new ResponseMessage(HttpURLConnection.HTTP_CREATED, ResponseStatus.SUCCESS.name(),
				"commented successfully", comment));
	}

	@PutMapping("/posts/{id}/comments")
	@RateLimiter(name = "myRateLimiter")
	@PreAuthorize("hasAuthority('COMMENT_UPDATE_ANY')or hasAuthority('COMMENT_UPDATE_OWN')")
	public ResponseEntity<?> updateComment(@PathVariable Long id, @RequestBody CommentDto commentDto,
			Authentication authentication) {
		Comment updateComment = commentService.updateComment(id, commentDto, authentication);
		if (updateComment == null) {
			return ResponseEntity.ok(new ResponseMessage(HttpURLConnection.HTTP_NOT_ACCEPTABLE,
					ResponseStatus.FAILURE.name(), "comment updating failed"));
		}
		return ResponseEntity.ok(new ResponseMessage(HttpURLConnection.HTTP_CREATED, ResponseStatus.SUCCESS.name(),
				"comment updated successfully", updateComment));
	}

	@DeleteMapping("/{id}")
	@RateLimiter(name = "myRateLimiter")
	@PreAuthorize("hasAuthority('COMMENT_DELETE_ANY') or hasAuthority('COMMENT_DELETE_OWN')")
	public String deleteComment(@PathVariable Long id, Authentication authentication) {
		return commentService.deleteComment(id, authentication);
	}

	@GetMapping("/posts/{postId}/comments")
	public ResponseEntity<?> readComment(@PathVariable Long postId) {
		List<Comment> comments = commentService.readComments(postId);
		if (comments == null) {
			return ResponseEntity.ok(new ResponseMessage(HttpURLConnection.HTTP_NOT_ACCEPTABLE,
					ResponseStatus.FAILURE.name(), "comments retrived failed.. "));
		}
		return ResponseEntity.ok(new ResponseMessage(HttpURLConnection.HTTP_CREATED, ResponseStatus.SUCCESS.name(),
				"All comments Retrived successfully", comments));
	}

	@PatchMapping("/{id}/status")
	@RateLimiter(name = "myRateLimiter")
	@PreAuthorize("hasAuthority('COMMENT_MODERATE')")
	public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestParam String status,
			Authentication authentication) {
		Comment updateStatus = commentService.updateStatus(id, status, authentication);
		return ResponseEntity.ok(updateStatus);
	}

	@GetMapping
	@PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN')")
	public ResponseEntity<?> findAllComments() {
		List<Comment> comments = commentService.findAllComments();
		if (comments == null) {
			return ResponseEntity.ok(new ResponseMessage(HttpURLConnection.HTTP_NOT_ACCEPTABLE,
					ResponseStatus.FAILURE.name(), "comments retrived failed.. "));
		}
		return ResponseEntity.ok(new ResponseMessage(HttpURLConnection.HTTP_CREATED, ResponseStatus.SUCCESS.name(),
				"All comments Retrived successfully", comments));
	}
}
