package com.example.demo.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Service;

import com.example.demo.dto.Post;
import com.example.demo.dto.UserDto;
import com.example.demo.dto.UserResponseDto;
import com.example.demo.entity.User;
import com.example.demo.excpetion.UserALreadyExistException;
import com.example.demo.excpetion.UserNotFoundException;
import com.example.demo.kafka.PostEvent;
import com.example.demo.kafka.UserRegisterEvent;
import com.example.demo.repository.UsersRepository;
import com.example.demo.utility.UserStatus;

import jakarta.transaction.Transactional;

@Service
public class UserServiceImpl implements UserService {

	@Autowired
	private UsersRepository repository;

	@Override
	@Modifying
	public UserResponseDto createUser(User user) {
		Optional<User> existingUser = repository.findByUsername(user.getUsername());
		if (existingUser.isPresent()) {
			throw new UserALreadyExistException("User already Existed");
		}
		User newUser = new User();
		newUser.setBio(user.getBio());
		newUser.setDisplayName(user.getDisplayName());
		newUser.setUsername(user.getUsername());
		Map<String, String> links = new HashMap<>();
		if (user.getSocialLinks() != null) {
			user.getSocialLinks().forEach((key, value) -> {
				if (value.startsWith("https://")) {
					links.put(key, value);
				}
			});
		}

		newUser.setSocialLinks(links);
		User save = repository.save(newUser);
		UserRegisterEvent event = new UserRegisterEvent();
		event.setUserId(save.getUserId());
		event.setBio(save.getBio());
		event.setUsername(save.getUsername());
		event.setDisplayName(save.getDisplayName());
		event.setSocialLinks(save.getSocialLinks());
		event.setEventType("user.registered");
		event.setCreatedAt(LocalDateTime.now());
		event.setUpdatedAt(save.getUpdatedAt());
		event.setStatus(save.getStatus());
		event.setRole(save.getRole());
		return new UserResponseDto(save.getUserId(), save.getUsername(), save.getDisplayName(), save.getBio(),
				save.getSocialLinks(), save.getStatus(), save.getCreatedAt(), save.getUpdatedAt(), save.getRole(),
				save.getPosts());
	}

	@CachePut(value = "updateUser", key = "#userId")
	@Override
	public UserResponseDto updateUser(Long userId, UserDto userDto) {
		User existedUser = repository.findById(userId)
				.orElseThrow(() -> new UserNotFoundException("User not found :" + userId));

		existedUser.setUsername(userDto.getUsername());
		existedUser.setDisplayName(userDto.getDisplayName());
		existedUser.setBio(userDto.getBio());
		existedUser.setSocialLinks(userDto.getSocialLinks());

		if (existedUser.getSocialLinks() == null) {
			existedUser.setSocialLinks(new HashMap<>());
		}
		if (existedUser.getSocialLinks() == null) {
			existedUser.setSocialLinks(new HashMap<>());
		}

		if (userDto.getSocialLinks() != null) {
			existedUser.getSocialLinks().putAll(userDto.getSocialLinks());
		}
		User update = repository.save(existedUser);
		return new UserResponseDto(update.getUserId(), update.getUsername(), update.getDisplayName(), update.getBio(),
				update.getSocialLinks(), update.getStatus(), update.getCreatedAt(), update.getUpdatedAt(),
				update.getRole(), update.getPosts());
	}

	@Cacheable(value = "user", key = "#username")
	@Override
	public UserResponseDto findByUserName(String username) {
		User user = repository.findByUsername(username)
				.orElseThrow(() -> new UserNotFoundException("User not Found with this name : " + username));
		return new UserResponseDto(user.getUserId(), user.getUsername(), user.getDisplayName(), user.getBio(),
				user.getSocialLinks(), user.getStatus(), user.getCreatedAt(), user.getUpdatedAt(), user.getRole(),
				user.getPosts());
	}

	@Override
	@CacheEvict(value = "username", key = "#username")
	public void deleteUser(String username) {
		User user = repository.findByUsername(username)
				.orElseThrow(() -> new UserNotFoundException("User not Found with this name : " + username));

		repository.delete(user);
	}

	@Override
	@Modifying
	@Transactional
	@CachePut(value = "updateStatus", key = "#username + '-' + #status")
	public UserResponseDto updateStatus(String username, String status) {
		User user = repository.findByUsername(username)
				.orElseThrow(() -> new UserNotFoundException("User not Found with this name : " + username));
		user.setStatus(updateStatus(status));
		User save = repository.save(user);
		return new UserResponseDto(save.getUserId(),
				save.getUsername(), 
				save.getDisplayName(), 
				save.getBio(),
				save.getSocialLinks(),
				save.getStatus(), save.getCreatedAt(),
				save.getUpdatedAt(), save.getRole(),
				save.getPosts());
	}

	@Override
	@Cacheable(value = "allUsers", key = "'all'")
	public List<User> findAll() {
		List<User> allUsers = repository.findAll();
		if (allUsers.isEmpty()) {
			throw new UserNotFoundException("no Users in database");
		}
		return allUsers;
	}

	private UserStatus updateStatus(String status) {

		return switch (status.toUpperCase()) {
		case "ACTIVE" -> UserStatus.ACTIVE;
		case "INACTIVE" -> UserStatus.INACTIVE;
		case "SUSPENDED" -> UserStatus.SUSPENDED;
		case "BLOCKED" -> UserStatus.BLOCKED;
		default -> throw new IllegalArgumentException("Unexpected value: " + status);
		};
	}

	@Override
	@Transactional
	public void addPost(Long authorId, PostEvent event) {
		User user = repository.findById(authorId)
				.orElseThrow(() -> new UserNotFoundException("User not Found with this ID : " + authorId));
		boolean exists = (user.getPosts() == null || user.getPosts().isEmpty()) 
			    ? false 
			    : user.getPosts().stream().anyMatch(p -> p.getPostId().equals(event.getPostId()));
		if (!exists) {
			if (user.getPosts() == null) {
				user.setPosts(new ArrayList<>());
			}
			Post post = new Post();
			post.setPostId(event.getPostId());
			post.setTitle(event.getTitle());
			post.setSlug(event.getSlug());
			post.setContent(event.getContent());
			post.setExcerpt(event.getExcerpt());
			post.setStatus(event.getStatus());
			post.setAuthorId(authorId);
			post.setCategoryId(event.getCategoryId());
			post.setViewCount(event.getViewCount());
			post.setLikeCount(event.getLikeCount());
			post.setCreatedAt(event.getCreatedAt());
			post.setPublishedAt(event.getPublishedAt());
			post.setUpdatedAt(event.getUpdatedAt());
			user.getPosts().add(post);
			System.out.println(post);
		}
		User save = repository.save(user);
		System.out.println(save);
	}

}
