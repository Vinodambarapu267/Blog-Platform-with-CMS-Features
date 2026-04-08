package com.example.demo.Exception;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ErrorMessage {
	private LocalDateTime dateTime;
	private Integer status;
	private String trace;
	private String path;
}
