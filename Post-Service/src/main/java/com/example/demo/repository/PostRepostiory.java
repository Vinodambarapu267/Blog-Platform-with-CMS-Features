package com.example.demo.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.entity.Post;

public interface PostRepostiory extends JpaRepository<Post, Long> {
	Optional<Post> findBySlug(String slug);
}
