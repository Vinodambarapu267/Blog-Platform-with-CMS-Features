package com.example.demo.dto;

import jakarta.persistence.Column;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CategoryDto {
	private String categoryName;
	@Column(unique = true)
	private String categorySlug;
	private String Description;
	private Long  parentId;
}
