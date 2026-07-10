package com.example.demo.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.dto.PostDto;
import com.example.demo.entity.Post;

public interface PostRepository extends JpaRepository<Post, Long> {
	Optional<Post> findBySlug(String slug);

	void deleteAllByauthorId(Long userId);

	List<Post> findAllByAuthorId(Long authorId);
}
