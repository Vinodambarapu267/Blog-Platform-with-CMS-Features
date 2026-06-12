package com.example.demo.excepetion;

public class UserNotFoundException extends RuntimeException{

	public UserNotFoundException(String message) {
		super(message);
	}

}
