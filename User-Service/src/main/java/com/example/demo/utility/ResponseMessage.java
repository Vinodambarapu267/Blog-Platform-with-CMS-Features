package com.example.demo.utility;

import lombok.Data;

@Data
public class ResponseMessage<T> {
	private Integer statuscode;
	private String status;
	private String message;
	private T data;
	
	public ResponseMessage(Integer statuscode, String status, String message) {
		super();
		this.statuscode = statuscode;
		this.status = status;
		this.message = message;
	}

	public ResponseMessage(Integer statuscode, String status, String message, T data) {
		super();
		this.statuscode = statuscode;
		this.status = status;
		this.message = message;
		this.data = data;
	}

	

}
