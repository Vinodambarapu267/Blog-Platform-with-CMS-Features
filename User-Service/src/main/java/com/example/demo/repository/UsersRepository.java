package com.example.demo.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.entity.User;
import java.util.List;
import java.time.LocalDateTime;
import com.example.demo.utility.UserStatus;

public interface UsersRepository extends JpaRepository<User, Long> {
	Optional<User> findByUsername(String username);

	List<User> findByCreatedAt(LocalDateTime createdAt);

	List<User> findByStatus(UserStatus status);
}
