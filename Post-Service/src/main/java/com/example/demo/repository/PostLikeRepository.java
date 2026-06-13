package com.example.demo.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.demo.entity.Post;
import com.example.demo.entity.PostLike;

public interface PostLikeRepository extends JpaRepository<PostLike, Long> {
	Optional<PostLike> findByPostAndUserId(Post post, Long userId);

	@Modifying
	@Query("DELETE FROM PostLike pl WHERE pl.post.postId = :postId")
	void deleteByPostId(@Param("postId") Long postId);
}
