package com.example.demo.exception;

import java.net.HttpURLConnection;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;

import com.example.demo.utility.ResponseMessage;

import io.github.resilience4j.ratelimiter.RequestNotPermitted;

@ControllerAdvice
public class GlobalExceptionHandler {
	@ExceptionHandler(SlugAlreadyExistException.class)
	public ResponseEntity<?> handleSlugAlreadyExist(SlugAlreadyExistException e, WebRequest request) {
		ErrorMessage errorMessage = new ErrorMessage(LocalDateTime.now(), HttpURLConnection.HTTP_BAD_REQUEST,
				e.getMessage(), request.getDescription(false));
		return ResponseEntity.ok(errorMessage);
	}

	@ExceptionHandler(SlugNotFoundException.class)
	public ResponseEntity<?> handleSlugNotFound(SlugNotFoundException e, WebRequest request) {
		ErrorMessage errorMessage = new ErrorMessage(LocalDateTime.now(), HttpURLConnection.HTTP_BAD_REQUEST,
				e.getMessage(), request.getDescription(false));
		return ResponseEntity.ok(errorMessage);
	}

	@ExceptionHandler(CategoryNotFoundException.class)
	public ResponseEntity<?> handleCateogryNotFound(CategoryNotFoundException e, WebRequest request) {
		ErrorMessage errorMessage = new ErrorMessage(LocalDateTime.now(), HttpURLConnection.HTTP_BAD_REQUEST,
				e.getMessage(), request.getDescription(false));
		return ResponseEntity.ok(errorMessage);
	}

	@ExceptionHandler(TagNotFoundException.class)
	public ResponseEntity<?> handleTagNotFoundException(TagNotFoundException e, WebRequest request) {
		ErrorMessage errorMessage = new ErrorMessage(LocalDateTime.now(), HttpURLConnection.HTTP_BAD_REQUEST,
				e.getMessage(), request.getDescription(false));
		return ResponseEntity.ok(errorMessage);
	}

	@ExceptionHandler(UserNotFoundException.class)
	public ResponseEntity<?> handleUserNotException(UserNotFoundException exception, WebRequest request) {
		ErrorMessage errorMessage = new ErrorMessage(LocalDateTime.now(), HttpURLConnection.HTTP_BAD_REQUEST,
				exception.getMessage(), request.getDescription(false));
		return ResponseEntity.ok(errorMessage);
	}

	@ExceptionHandler(org.springframework.security.access.AccessDeniedException.class)
	public ResponseEntity<?> handleAccessDenied(org.springframework.security.access.AccessDeniedException ex,
			WebRequest request) {
		ErrorMessage errorMessage = new ErrorMessage(LocalDateTime.now(), HttpStatus.FORBIDDEN.value(), ex.getMessage(),
				request.getDescription(false));
		return ResponseEntity.status(HttpStatus.FORBIDDEN).body(errorMessage);
	}

	@ExceptionHandler(Exception.class)
	public ResponseEntity<Map<String, Object>> handleException(Exception ex, ServerHttpRequest request) {

		Map<String, Object> body = new HashMap<>();
		body.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
		body.put("error", "Internal Server Error");
		body.put("message", ex.getMessage());
		body.put("path", request.getURI().getPath());

		return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
	}

	@ExceptionHandler(RuntimeException.class)
	public ResponseEntity<Map<String, Object>> handleRuntimeException(RuntimeException ex, ServerHttpRequest request) {

		Map<String, Object> body = new HashMap<>();
		body.put("status", HttpStatus.BAD_REQUEST.value());
		body.put("error", "Bad Request");
		body.put("message", ex.getMessage());
		body.put("path", request.getURI().getPath());

		return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
	}
}
