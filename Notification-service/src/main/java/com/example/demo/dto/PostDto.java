package com.example.demo.dto;

import java.time.LocalDateTime;

import com.example.demo.utility.PostStatus;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PostDto {
	private Long postId;
	private String title;
	private String slug;
	private String content;
	private String excerpt;
	private PostStatus status = PostStatus.PUBLISHED;
	private Long authorId;
	private Long categoryId;
	private Integer viewCount;
	private Integer likeCount;
	private LocalDateTime pulishedAt;
	private LocalDateTime createdAt;
	private LocalDateTime updatedAt;
}
