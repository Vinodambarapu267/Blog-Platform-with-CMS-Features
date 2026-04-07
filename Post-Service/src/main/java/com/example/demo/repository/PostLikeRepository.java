package com.example.demo.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.entity.Post;
import com.example.demo.entity.PostLikes;

public interface PostLikeRepository extends JpaRepository<PostLikes, Long> {
	Optional<PostLikes> findByPostAndUserId(Post post, Long userId);
}
