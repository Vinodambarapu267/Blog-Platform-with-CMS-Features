package com.example.demo.dto;

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
public class UserDto {
	private String username;
	private String displayName;
	private String bio;

	private Map<String, String> socialLinks;
	@Enumerated(EnumType.STRING)
	private UserStatus isActive = UserStatus.ACTIVE;

	private LocalDateTime createdAt;

	private LocalDateTime updatedAt;
	 @Transient
	private List<Post> posts;
	public void addPost(Post post) {
		posts.add(post);
	}

	public void removePost(Post post) {
		posts.remove(post);
	}	
}
