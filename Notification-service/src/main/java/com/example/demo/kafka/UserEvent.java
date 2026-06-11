package com.example.demo.kafka;

import java.io.Serializable;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserEvent implements Serializable{
	private Long userId;
	private String username;
	private String displayName;
	private String bio;
	private String isActive;
	private String email;
	private String eventType;
}
