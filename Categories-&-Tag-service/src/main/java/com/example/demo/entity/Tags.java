package com.example.demo.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "tags")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Tags {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)

	private Long tagId;
	@Column(unique = true)
	private String tagName;
	@Column(unique = true)
	private String tagSlug;
	@Column(nullable = false)
	private int postCount = 0;

	public Tags(String tagName) {
		this.tagName = tagName;
	}
}
