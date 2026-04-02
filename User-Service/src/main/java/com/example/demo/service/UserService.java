package com.example.demo.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.demo.dto.UserDto;
import com.example.demo.entity.User;

@Service
public interface UserService {
	public User createUser(User user);

	public User updateUser(Long userId, UserDto userDto);

	public User findByUserName(String username);

	public void deleteUser(String username);

	public User updateStatus(String username, String status);

	public List<User> findAll();
}
