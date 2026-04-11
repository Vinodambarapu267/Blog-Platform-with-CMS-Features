package com.example.demo.dto;

import com.example.demo.entity.Comment;

import jakarta.persistence.Column;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CommentDto {
	
	

	private Long authorId;
	@Column(unique = true)
	private Long parentId;
	private Comment parent;
	@Column(nullable = false, columnDefinition = "TEXT")
	private String content;

}
