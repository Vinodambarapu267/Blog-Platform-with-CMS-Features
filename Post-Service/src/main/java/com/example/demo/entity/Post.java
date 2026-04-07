package com.example.demo.entity;

import java.time.Instant;

import org.hibernate.annotations.CreationTimestamp;

import com.example.demo.utility.PostStatus;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "posts")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Post {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
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
	private PostStatus status = PostStatus.PUBLISHED;
	@Column(nullable = false)
	private Long authorId;
	@Column(nullable = true)
	private Long categoryId;
	private Integer view_count;
	private Integer like_count;
	@CreationTimestamp
	@Column(nullable = true)
	private Instant pulishedAt;
	@CreationTimestamp
	@Column(nullable = false)
	private Instant createdAt;
	@CreationTimestamp
	@Column(nullable = false)
	private Instant updatedAt;
}
