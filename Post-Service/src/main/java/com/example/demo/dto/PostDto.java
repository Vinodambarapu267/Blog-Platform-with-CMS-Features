package com.example.demo.dto;

import java.time.Instant;

import com.example.demo.utility.PostStatus;

import jakarta.persistence.Column;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PostDto {
	@Column(nullable = false)
	private String title;
	@Column(nullable = false, unique = true)
	private String slug;
	@Column(nullable = false)
	private String content;
	@Column(nullable = true)
	private String excerpt;
	@Column(nullable = false)
	@Enumerated(EnumType.STRING)
	private PostStatus status = PostStatus.PUBLISHED;
	@Column(nullable = false)
	private Long authorId;
	@Column(nullable = true)
	private Long categoryId;
	private Integer view_count;
	private Integer like_count;

	@Column(nullable = true)
	private Instant pulishedAt;

	@Column(nullable = false)
	private Instant createdAt;

	@Column(nullable = false)
	private Instant updatedAt;
}
