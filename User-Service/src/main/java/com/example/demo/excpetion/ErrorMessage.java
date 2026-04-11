package com.example.demo.excpetion;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ErrorMessage {
	private LocalDateTime dateTime;
	private Integer statusCode;
	private String message;
	private String path;
}
