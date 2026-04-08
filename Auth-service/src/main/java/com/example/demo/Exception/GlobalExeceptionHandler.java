package com.example.demo.Exception;

import java.net.HttpURLConnection;
import java.time.LocalDateTime;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;

@ControllerAdvice
public class GlobalExeceptionHandler {

	@ExceptionHandler(UserCredentialInvalidExcpetion.class)
	public ResponseEntity<?> handleUserCredentialException(UserCredentialInvalidExcpetion exception,
			WebRequest request) {
		ErrorMessage errorMessage = new ErrorMessage(LocalDateTime.now(), HttpURLConnection.HTTP_FORBIDDEN,
				exception.getMessage(), request.getDescription(false));
		return ResponseEntity.ok(errorMessage);
	}

	@ExceptionHandler(TokenInvalidException.class)
	public ResponseEntity<?> handleUserInvalidTokenException(TokenInvalidException exception, WebRequest request) {
		ErrorMessage errorMessage = new ErrorMessage(LocalDateTime.now(), HttpURLConnection.HTTP_FORBIDDEN,
				exception.getMessage(), request.getDescription(false));
		return ResponseEntity.ok(errorMessage);
	}

	@ExceptionHandler(InvalidAccessException.class)
	public ResponseEntity<?> handleInvalidAccessException(InvalidAccessException exception, WebRequest request) {
		ErrorMessage errorMessage = new ErrorMessage(LocalDateTime.now(), HttpURLConnection.HTTP_FORBIDDEN,
				exception.getMessage(), request.getDescription(false));
		return ResponseEntity.ok(errorMessage);
	}

	@ExceptionHandler(UserNotFoundException.class)
	public ResponseEntity<?> handleUserNotFoundException(UserNotFoundException exception, WebRequest request) {
		ErrorMessage errorMessage = new ErrorMessage(LocalDateTime.now(), HttpURLConnection.HTTP_FORBIDDEN,
				exception.getMessage(), request.getDescription(false));
		return ResponseEntity.ok(errorMessage);
	}
}
