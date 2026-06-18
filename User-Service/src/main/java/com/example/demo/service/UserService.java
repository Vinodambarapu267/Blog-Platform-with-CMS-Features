package com.example.demo.service;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import com.example.demo.dto.UserCreateRequest;
import com.example.demo.dto.UserDto;
import com.example.demo.dto.UserResponseDto;
import com.example.demo.kafka.PostEvent;

@Service
public interface UserService {
	public UserResponseDto createUser(UserCreateRequest user);

	public UserResponseDto updateUser(UserDto userDto,Authentication authentication);

	public UserResponseDto findByUserName(String username);

	public void deleteUser(String username);

	public UserResponseDto updateStatus(String username, String status);

	public List<UserResponseDto> findAll();

	public UserDto findById(Long userId);

	public void addPost(Long authorId, PostEvent event);
}
