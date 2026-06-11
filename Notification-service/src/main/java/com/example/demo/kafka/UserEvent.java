package com.example.demo.kafka;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserEvent {
	private Long userId;
	private String username;
	private String displayName;
	private String bio;
	private String isActive;
	private String email;
	private String eventType;
}
