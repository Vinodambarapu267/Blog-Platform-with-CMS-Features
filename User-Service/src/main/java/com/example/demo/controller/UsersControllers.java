package com.example.demo.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.UserDto;
import com.example.demo.entity.User;
import com.example.demo.service.UserService;
import com.example.demo.utility.UserStatus;

@RestController
@RequestMapping("/api/v1/users")

public class UsersControllers {
	@Autowired
	private UserService userService;

	@PostMapping("/createuser")
	public ResponseEntity<?> createUser(@RequestBody User user) {
		User save = userService.createUser(user);
		return ResponseEntity.ok(save);
	}

	@PutMapping("/updateuser/{userId}")
	public ResponseEntity<?> updateUser(@PathVariable Long userId, @RequestBody UserDto userDto) {
		User updateUser = userService.updateUser(userId, userDto);
		return ResponseEntity.ok(updateUser);
	}

	@GetMapping("/findbyname/{username}")
	public ResponseEntity<?> findByUsername(@PathVariable String username) {
		User user = userService.findByUserName(username);
		return ResponseEntity.ok(user);
	}

	@GetMapping("/deleteuser/{username}")
	public String deleteUser(String username) {
		userService.deleteUser(username);
		return "user deleted successfully";
	}

	@PutMapping("/updateStatus")
	public ResponseEntity<?> updateStatus(@RequestParam String username, String status) {
		User updateStatus = userService.updateStatus(username, status);
		
		return ResponseEntity.ok(updateStatus);
	}

	@GetMapping
	public ResponseEntity<?> findAll() {
		List<User> allUsers = userService.findAll();
		return ResponseEntity.ok(allUsers);
	}
	
}
