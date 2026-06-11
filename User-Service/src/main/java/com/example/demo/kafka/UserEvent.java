package com.example.demo.kafka;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import com.example.demo.utility.UserRole;
import com.example.demo.utility.UserStatus;

import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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
	private Map<String, String> socialLinks = new HashMap<>();
	@Enumerated(EnumType.STRING)
	private UserStatus status = UserStatus.ACTIVE;
	private String email;
	private LocalDateTime createdAt;

	private LocalDateTime updatedAt;

	private UserRole role;
	private String eventType;
}
