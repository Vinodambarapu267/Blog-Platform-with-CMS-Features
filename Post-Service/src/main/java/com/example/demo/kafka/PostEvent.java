package com.example.demo.kafka;

import java.time.LocalDateTime;

import com.example.demo.utility.PostStatus;

import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PostEvent {

	private Long postId;
	private String title;
	private String slug;
	private String content;
	private String excerpt;
	@Enumerated(EnumType.STRING)
	private PostStatus status = PostStatus.PUBLISHED;
	private Long authorId;
	private Long categoryId;
	private Integer viewCount;
	private Integer likeCount;
	private LocalDateTime pulishedAt;
	private LocalDateTime createdAt;
	private LocalDateTime updatedAt;
	private String eventType;
}
