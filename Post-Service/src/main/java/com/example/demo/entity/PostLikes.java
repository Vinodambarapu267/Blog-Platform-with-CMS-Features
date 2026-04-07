package com.example.demo.entity;

import java.time.Instant;

import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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
@Table(name = "post_likes")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PostLikes {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long likesId;
	@ManyToOne(cascade = CascadeType.ALL)
	@JoinColumn(name = "post_id")
	@Column(nullable = false)
	private Long postId;
	@Column(nullable = false)
	private Long userId;
	@CreationTimestamp
	@Column(nullable = false)
	private Instant createdAt;

}
