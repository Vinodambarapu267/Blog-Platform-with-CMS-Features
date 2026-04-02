package com.example.demo.dto;

import java.time.LocalDateTime;

import org.aspectj.weaver.ast.Var;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Post {

	private Long postId;
	private String title;
	private String slug;
	private Var content;
	private Var excerpt;
	private String status;
	private Long authorId;
	private Long categoryId;
	private Long viewCount;
	private Integer likeCount;
	private Integer readTimeMinutes;
	private LocalDateTime pubhlishedAt;
	private LocalDateTime scheduledAt;
	private LocalDateTime createdAt;
	private LocalDateTime updatedAt;

}
