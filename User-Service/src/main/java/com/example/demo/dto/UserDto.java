package com.example.demo.dto;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import com.example.demo.utility.UserStatus;

import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Transient;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDto implements Serializable{
	private Long userId;
	private String username;
	private String displayName;
	private String bio;

	private Map<String, String> socialLinks;
	@Enumerated(EnumType.STRING)
	private UserStatus status = UserStatus.ACTIVE;
	private String email;
	private LocalDateTime createdAt;
	private LocalDateTime updatedAt;
	private List<Long> postIds;
}
