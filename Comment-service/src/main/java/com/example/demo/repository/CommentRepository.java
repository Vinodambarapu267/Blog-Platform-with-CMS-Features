package com.example.demo.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import com.example.demo.entity.Comment;

import jakarta.transaction.Transactional;

public interface CommentRepository extends JpaRepository<Comment, Long> {
	List<Comment> findAllByPostId(Long postId);

	Optional<Comment> findByPostId(Long postId);
	@Modifying
	@Transactional
	@Query("DELETE FROM Comment c WHERE c.postId = :postId")
	void deleteByPostId(Long postId);
}
