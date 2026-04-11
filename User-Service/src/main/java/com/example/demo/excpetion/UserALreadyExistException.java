package com.example.demo.excpetion;

public class UserALreadyExistException extends RuntimeException {

	public UserALreadyExistException(String message) {
		super(message);
	}

}
