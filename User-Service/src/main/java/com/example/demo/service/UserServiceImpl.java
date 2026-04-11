package com.example.demo.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Service;

import com.example.demo.dto.UserDto;
import com.example.demo.entity.User;
import com.example.demo.excpetion.UserALreadyExistException;
import com.example.demo.excpetion.UserNotFoundException;
import com.example.demo.repository.UsersRepository;
import com.example.demo.utility.UserStatus;

import jakarta.transaction.Transactional;

@Service
public class UserServiceImpl implements UserService {

	@Autowired
	private UsersRepository repository;

	@Override
	public User createUser(User user) {
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

		return repository.save(newUser);
	}

	@Override
	public User updateUser(Long userId, UserDto userDto) {
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
		return repository.save(existedUser);

	}

	@Override
	public User findByUserName(String username) {
		User user = repository.findByUsername(username)
				.orElseThrow(() -> new UserNotFoundException("User not Found with this name : " + username));
		return user;
	}

	@Override
	public void deleteUser(String username) {
		User user = repository.findByUsername(username)
				.orElseThrow(() -> new UserNotFoundException("User not Found with this name : " + username));

		repository.delete(user);
	}

	@Override
	@Modifying
	@Transactional
	public User updateStatus(String username, String status) {
		User user = repository.findByUsername(username)
				.orElseThrow(() -> new UserNotFoundException("User not Found with this name : " + username));
		user.setStatus(updateStatus(status));
		return repository.save(user);
	}

	@Override
	public List<User> findAll() {
		List<User> allUsers = repository.findAll();
		if (allUsers.isEmpty()) {
			new UserNotFoundException("no Users in database");
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
}
