package com.example.demo.excpetion;

import java.net.HttpURLConnection;
import java.time.LocalDateTime;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

@RestControllerAdvice
public class GlobalExceptionHandler {
	@ExceptionHandler(UserALreadyExistException.class)
	@ResponseStatus(code = HttpStatus.ALREADY_REPORTED)
	public ResponseEntity<?> handleUserAlreadyExistException(UserALreadyExistException exception, WebRequest request) {
		ErrorMessage errorMessage = new ErrorMessage(LocalDateTime.now(), HttpURLConnection.HTTP_MULT_CHOICE,
				exception.getMessage(), request.getDescription(false));
		return ResponseEntity.ok(errorMessage);
	}

	@ExceptionHandler(UserNotFoundException.class)
	@ResponseStatus(code = HttpStatus.NOT_FOUND)
	public ResponseEntity<?> handleUserNotFoundException(UserNotFoundException exception, WebRequest request) {
		ErrorMessage errorMessage = new ErrorMessage(LocalDateTime.now(), HttpURLConnection.HTTP_NOT_FOUND,
				exception.getMessage(), request.getDescription(false));
		return ResponseEntity.ok(errorMessage);
	}

}
