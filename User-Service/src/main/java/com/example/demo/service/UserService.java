package com.example.demo.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.demo.dto.UserDto;
import com.example.demo.dto.UserResponseDto;
import com.example.demo.entity.User;
import com.example.demo.kafka.PostEvent;
import com.example.demo.kafka.UserEventConsumer;

@Service
public interface UserService {
	public UserResponseDto createUser(User user);

	public UserResponseDto updateUser(Long userId, UserDto userDto);

	public UserResponseDto findByUserName(String username);

	public void deleteUser(String username);

	public UserResponseDto updateStatus(String username, String status);

	public List<User> findAll();

	public void addPost(Long authorId, PostEvent event);
}
