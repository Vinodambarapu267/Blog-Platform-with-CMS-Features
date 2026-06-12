package com.example.demo.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.example.demo.entity.User;
import com.example.demo.utility.UserStatus;

public interface UserRepository extends JpaRepository<User, Long> {

	@EntityGraph(attributePaths = { "postIds", "socialLinks" })
	Optional<User> findByUsername(String username);

	List<User> findByCreatedAt(LocalDateTime createdAt);

	@EntityGraph(attributePaths = { "socialLinks", "postIds" })
	@Query("select u from User u")
	List<User> findAllWithDetails();

	List<User> findByStatus(UserStatus status);
}
