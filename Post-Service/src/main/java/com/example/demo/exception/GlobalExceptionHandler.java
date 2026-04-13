package com.example.demo.exception;

import java.net.HttpURLConnection;
import java.time.LocalDateTime;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

import com.example.demo.utility.ResponseMessage;

import io.github.resilience4j.ratelimiter.RequestNotPermitted;

@RestControllerAdvice
public class GlobalExceptionHandler {
	@ExceptionHandler(PostAlreadyExistException.class)
	public ResponseEntity<?> handlePostALreadyExistException(PostAlreadyExistException exception, WebRequest request) {
		ErrorMessage errorMessage = new ErrorMessage(LocalDateTime.now(), HttpURLConnection.HTTP_BAD_REQUEST,
				exception.getMessage(), request.getDescription(false));
		return ResponseEntity.ok(errorMessage);
	}

	@ExceptionHandler(PostNotFoundException.class)
	public ResponseEntity<?> handlePostNotException(PostNotFoundException exception, WebRequest request) {
		ErrorMessage errorMessage = new ErrorMessage(LocalDateTime.now(), HttpURLConnection.HTTP_BAD_REQUEST,
				exception.getMessage(), request.getDescription(false));
		return ResponseEntity.ok(errorMessage);
	}
	@ExceptionHandler(io.github.resilience4j.ratelimiter.RequestNotPermitted.class)
	public ResponseEntity<ResponseMessage> handleRateLimit(RequestNotPermitted ex) {
		return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body(new ResponseMessage(429,
				com.example.demo.utility.ResponseStatus.FAILURE.name(), "Too many requests - please try again later."));
	}
}
