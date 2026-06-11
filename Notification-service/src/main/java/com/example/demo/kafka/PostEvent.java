package com.example.demo.kafka;

import com.example.demo.utility.PostStatus;

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

	private PostStatus status;
	private Long authorId;
	private Long categoryId;
	private Integer viewCount;
	private Integer likeCount;

	private String eventType;
}
