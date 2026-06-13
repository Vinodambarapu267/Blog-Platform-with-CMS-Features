package com.example.demo.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Service;

import com.example.demo.dto.UserDto;
import com.example.demo.dto.UserResponseDto;
import com.example.demo.entity.User;
import com.example.demo.excepetion.UserAlreadyExistException;
import com.example.demo.excepetion.UserNotFoundException;
import com.example.demo.kafka.KafkaUserProducer;
import com.example.demo.kafka.PostEvent;
import com.example.demo.kafka.UserEvent;
import com.example.demo.repository.UserRepository;
import com.example.demo.utility.KafkaUserEvent;
import com.example.demo.utility.UserStatus;

import jakarta.transaction.Transactional;

@Service
public class UserServiceImpl implements UserService {

	@Autowired
	private UserRepository repository;
	@Autowired
	private KafkaUserProducer kafkaUserProducer;

	@Override
	@Modifying

	public UserResponseDto createUser(User user) {
		Optional<User> existingUser = repository.findByUsername(user.getUsername());
		if (existingUser.isPresent()) {
			throw new UserAlreadyExistException("User already Existed");
		}
		User newUser = new User();
		newUser.setBio(user.getBio());
		newUser.setDisplayName(user.getDisplayName());
		newUser.setUsername(user.getUsername());
		newUser.setPostIds(user.getPostIds());
		Map<String, String> links = new HashMap<>();
		if (user.getSocialLinks() != null) {
			user.getSocialLinks().forEach((key, value) -> {
				if (value.startsWith("https://")) {
					links.put(key, value);
				}
			});

		}
		newUser.setEmail(user.getEmail());
		newUser.setSocialLinks(links);
		User savedUser  = repository.save(newUser);
		UserEvent event = new UserEvent();
		event.setUserId(savedUser .getUserId());
		event.setBio(savedUser .getBio());
		event.setUsername(savedUser .getUsername());
		event.setDisplayName(savedUser .getDisplayName());
		event.setSocialLinks(savedUser .getSocialLinks());
		event.setEventType("user.registered");
		event.setCreatedAt(LocalDateTime.now());
		event.setUpdatedAt(savedUser .getUpdatedAt());
		event.setStatus(savedUser .getStatus());
		event.setRole(savedUser .getRole());
		event.setEmail(savedUser .getEmail());
		event.setEventType(KafkaUserEvent.REGISTERED.name());
		kafkaUserProducer.publishUserRegisteredEvent(event);
		return new UserResponseDto(savedUser .getUserId(), savedUser .getUsername(), savedUser .getDisplayName(), savedUser .getBio(),
				savedUser .getSocialLinks(), savedUser .getStatus(), savedUser .getEmail(), savedUser .getCreatedAt(), savedUser .getRole(),
				savedUser .getPostIds());
	}

	@CachePut(value = "updateUser", key = "#userId")
	@Override
	@Modifying
	public UserResponseDto updateUser(Long userId, UserDto userDto) {
		User existedUser = repository.findById(userId)
				.orElseThrow(() -> new UserNotFoundException("User not found :" + userId));

		existedUser.setUsername(userDto.getUsername());
		existedUser.setDisplayName(userDto.getDisplayName());
		existedUser.setBio(userDto.getBio());
		existedUser.setSocialLinks(userDto.getSocialLinks());
		existedUser.setEmail(userDto.getEmail());
		if (existedUser.getSocialLinks() == null) {
			existedUser.setSocialLinks(new HashMap<>());
		}
		if (existedUser.getSocialLinks() == null) {
			existedUser.setSocialLinks(new HashMap<>());
		}

		if (userDto.getSocialLinks() != null) {
			existedUser.getSocialLinks().putAll(userDto.getSocialLinks());
		}
		User updatedUser = repository.save(existedUser);
		UserEvent event = new UserEvent();
		event.setUserId(updatedUser.getUserId());
		event.setUsername(updatedUser.getUsername());
		event.setDisplayName(updatedUser.getDisplayName());
		event.setBio(updatedUser.getBio());
		event.setEmail(existedUser.getEmail());
		event.setSocialLinks(updatedUser.getSocialLinks());
		event.setEventType(KafkaUserEvent.UPDATED.name());
		kafkaUserProducer.publishUserUpdatedEvent(event);
		return new UserResponseDto(updatedUser.getUserId(), updatedUser.getUsername(), updatedUser.getDisplayName(), updatedUser.getBio(),
				updatedUser.getSocialLinks(), updatedUser.getStatus(), updatedUser.getEmail(), updatedUser.getCreatedAt(), updatedUser.getRole(),
				updatedUser.getPostIds());
	}

	@Override
	@Transactional
	public UserResponseDto findByUserName(String username) {
		User user = repository.findByUsername(username).orElseThrow(() -> new UserNotFoundException("User not found"));
		UserResponseDto dto = new UserResponseDto();
		dto.setUserId(user.getUserId());
		dto.setUsername(user.getUsername());
		dto.setDisplayName(user.getDisplayName());
		dto.setBio(user.getBio());
		dto.setStatus(user.getStatus());
		dto.setRole(user.getRole());
		dto.setSocialLinks(new HashMap<>(user.getSocialLinks()));
		dto.setPostIds(user.getPostIds().stream().distinct().collect(Collectors.toList()));
		System.err.println(dto);
		return dto;
	}

	@Override
	@CacheEvict(value = "username", key = "#username")
	public void deleteUser(String username) {
		User user = repository.findByUsername(username)
				.orElseThrow(() -> new UserNotFoundException("User not Found with this name : " + username));
		UserEvent event = new UserEvent();
		event.setUserId(user.getUserId());
		event.setEventType(KafkaUserEvent.DELETED.name());
		kafkaUserProducer.publishUserDeletedEvent(event);
		repository.delete(user);
	}

	@Override
	@Modifying
	@Transactional
	@CachePut(value = "updateStatus", key = "#username + '-' + #status")
	public UserResponseDto updateStatus(String username, String status) {
		User user = repository.findByUsername(username)
				.orElseThrow(() -> new UserNotFoundException("User not Found with this name : " + username));
		user.setStatus(parseUserStatus(status));
		User save = repository.save(user);
		return new UserResponseDto(save.getUserId(), save.getUsername(), save.getDisplayName(), save.getBio(),
				save.getSocialLinks(), save.getStatus(), save.getEmail(), save.getUpdatedAt(), save.getRole(),
				save.getPostIds());
	}

	@Override

	@Transactional
	public List<UserResponseDto> findAll() {
		List<User> allWithDetails = repository.findAllWithDetails();
		if (allWithDetails.isEmpty()) {
			throw new UserNotFoundException("no Users in database");
		}

		return allWithDetails.stream()
				.map(user -> new UserResponseDto(user.getUserId(), user.getUsername(), user.getDisplayName(),
						user.getBio(), new HashMap<>(user.getSocialLinks()), user.getStatus(), user.getEmail(),
						user.getCreatedAt(), user.getRole(), new ArrayList<>(user.getPostIds())))
				.toList();
	}

	private UserStatus parseUserStatus(String status) {

		return switch (status.toUpperCase()) {
		case "ACTIVE" -> UserStatus.ACTIVE;
		case "INACTIVE" -> UserStatus.INACTIVE;
		case "SUSPENDED" -> UserStatus.SUSPENDED;
		case "BLOCKED" -> UserStatus.BLOCKED;
		default -> throw new IllegalArgumentException("Unexpected value: " + status);
		};
	}

	@Override
	public UserDto findById(Long userId) {
		User user = repository.findById(userId)
				.orElseThrow(() -> new UserNotFoundException("User Not Found Exception"));
		UserDto result = new UserDto();
		result.setUserId(user.getUserId());
		result.setBio(user.getBio());
		result.setCreatedAt(user.getCreatedAt());
		result.setDisplayName(user.getDisplayName());
		result.setStatus(user.getStatus());
		result.setUpdatedAt(user.getUpdatedAt());
		result.setPostIds(user.getPostIds());
		result.setSocialLinks(user.getSocialLinks());
		result.setUsername(user.getUsername());
		result.setEmail(user.getEmail());
		return result;
	}

	@Override
	@Transactional

	public void addPost(Long authorId, PostEvent event) {
		User user = repository.findById(authorId)
				.orElseThrow(() -> new UserNotFoundException("User not Found with this ID : " + authorId));

		if (!Objects.equals(authorId, event.getAuthorId())) {
			throw new RuntimeException("user id does not match with author id in the post");
		}

		if (user.getPostIds() == null) {
			user.setPostIds(new ArrayList<>());
		}

		user.getPostIds().add(event.getPostId());
		User savedUser = repository.save(user);
		UserEvent userEvent = new UserEvent();

		userEvent.setUserId(savedUser.getUserId());
		userEvent.setUsername(savedUser.getUsername());
		userEvent.setDisplayName(savedUser.getDisplayName());
		userEvent.setBio(savedUser.getBio());
		userEvent.setEmail(savedUser.getEmail());
		userEvent.setSocialLinks(savedUser.getSocialLinks());
		userEvent.setEventType(KafkaUserEvent.UPDATED.name());
		System.err.println(userEvent.getEmail());
		kafkaUserProducer.publishUserUpdatedEvent(userEvent);

	}

}
