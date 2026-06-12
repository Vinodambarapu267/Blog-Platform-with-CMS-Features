package com.example.demo.kafka;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CommentEvent {
	private Long commentId;
	private Long authorId;
	private Long parentId;
	private Long postId;
	private String content;
	private String eventType;
}
