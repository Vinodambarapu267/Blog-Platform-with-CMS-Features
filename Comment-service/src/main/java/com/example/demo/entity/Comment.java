package com.example.demo.entity;

import java.io.Serializable;
import java.time.Instant;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.example.demo.utility.CommentStatus;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "comments")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Comment implements Serializable{
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long commentId;
	@Column(nullable = false)
	private Long postId;
	@Column(nullable = false)
	private Long authorId;
	@Column(nullable = false)
	private Long parentId;
	@Column(nullable = false)
	private String content;
	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private CommentStatus status = CommentStatus.PENDING;
	@CreationTimestamp
	@Column(name = "created_at", updatable = false, nullable = false)
	private Instant createdAt;
	@UpdateTimestamp
	@Column(name = "updated_at", nullable = false)
	private Instant updatedAt;

}
