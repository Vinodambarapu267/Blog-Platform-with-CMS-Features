package com.example.demo.kafka;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserEvent {
	private Long userId;
	private String username;
	private String displayName;
	private String eventType;
}
