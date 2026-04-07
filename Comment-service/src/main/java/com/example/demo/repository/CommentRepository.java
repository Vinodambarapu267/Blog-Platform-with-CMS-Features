package com.example.demo.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.entity.Comment;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    Optional<Comment> findByPostId(Long postId); 
}
