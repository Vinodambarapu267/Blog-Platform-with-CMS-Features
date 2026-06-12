package com.example.demo.excepetion;

public class UserAlreadyExistException extends RuntimeException {

	public UserAlreadyExistException(String message) {
		super(message);
	}

}
