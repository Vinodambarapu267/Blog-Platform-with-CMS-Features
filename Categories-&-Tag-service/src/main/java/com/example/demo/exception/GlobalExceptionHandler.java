package com.example.demo.exception;

import java.net.HttpURLConnection;
import java.time.LocalDateTime;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;

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

}
