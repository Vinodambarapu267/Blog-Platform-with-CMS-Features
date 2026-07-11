package com.example.demo.dto;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;

import com.example.demo.utility.PostStatus;

import jakarta.persistence.Column;
import java.io.Serializable;

import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PostDto implements Serializable {

	private Long postId;
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
	private PostStatus status;
	@Column(nullable = false)
	private Long authorId;
	@Column(nullable = true)
	private Long categoryId;
	private Integer viewCount;
	private Integer likeCount;

	@Column(nullable = true)
	private LocalDateTime publishedAt;

	@Column(nullable = false)
	private LocalDateTime createdAt;

	@Column(nullable = false)
	private LocalDateTime updatedAt;
}
