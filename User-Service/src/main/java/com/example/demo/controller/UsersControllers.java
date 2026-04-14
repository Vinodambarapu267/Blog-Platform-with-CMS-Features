package com.example.demo.controller;

import java.net.HttpURLConnection;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.UserDto;
import com.example.demo.dto.UserResponseDto;
import com.example.demo.entity.User;
import com.example.demo.service.UserService;
import com.example.demo.utility.ResponseMessage;
import com.example.demo.utility.ResponseStatus;

import io.github.resilience4j.ratelimiter.annotation.RateLimiter;

@RestController
@RequestMapping("/api/v1/users")
public class UsersControllers {
	@Autowired
	private UserService userService;

	@PostMapping("/createuser")
	@RateLimiter(name = "myRateLimiter")
	public ResponseEntity<?> createUser(@RequestBody User user) {
		UserResponseDto save = userService.createUser(user);
		if (user == null) {
			return ResponseEntity.ok(new ResponseMessage(HttpURLConnection.HTTP_BAD_REQUEST,
					ResponseStatus.FAILURE.name(), "User creating failed"));
		}
		return ResponseEntity.ok(new ResponseMessage(HttpURLConnection.HTTP_CREATED, ResponseStatus.SUCCESS.name(),
				"User created successfully", save));
	}

	@PutMapping("/updateuser/{userId}")
	@RateLimiter(name = "myRateLimiter")
	public ResponseEntity<?> updateUser(@PathVariable Long userId, @RequestBody UserDto userDto) {
		UserResponseDto updateUser = userService.updateUser(userId, userDto);
		if (updateUser == null) {
			return ResponseEntity.ok(new ResponseMessage(HttpURLConnection.HTTP_BAD_REQUEST,
					ResponseStatus.FAILURE.name(), "User updating failed"));
		}
		return ResponseEntity.ok(new ResponseMessage(HttpURLConnection.HTTP_CREATED, ResponseStatus.SUCCESS.name(),
				"User updated successfully", updateUser));
	}

	@GetMapping("/findbyname/{username}")
	@RateLimiter(name = "myRateLimiter")
	public ResponseEntity<?> findByUsername(@PathVariable String username) {
		UserResponseDto user = userService.findByUserName(username);
		if (user == null) {
			return ResponseEntity.ok(new ResponseMessage(HttpURLConnection.HTTP_BAD_REQUEST,
					ResponseStatus.FAILURE.name(), "User retriving failed"));
		}
		return ResponseEntity.ok(new ResponseMessage(HttpURLConnection.HTTP_CREATED, ResponseStatus.SUCCESS.name(),
				"User found successfully", user));
	}

	@DeleteMapping("/deleteuser/{username}")
	public String deleteUser(@PathVariable String username) {
		userService.deleteUser(username);
		return "user deleted successfully";
	}

	@PutMapping("/updateStatus")
	@RateLimiter(name = "myRateLimiter")
	public ResponseEntity<?> updateStatus(@RequestParam String username, @RequestParam String status) {
		UserResponseDto updateStatus = userService.updateStatus(username, status);
		return ResponseEntity.ok(updateStatus);
	}

	@GetMapping
	@RateLimiter(name = "myRateLimiter")
	public ResponseEntity<?> findAll() {
		List<User> allUsers = userService.findAll();
		if (allUsers == null) {
			return ResponseEntity.ok(new ResponseMessage(HttpURLConnection.HTTP_BAD_REQUEST,
					ResponseStatus.FAILURE.name(), "Users retiving failed"));
		}
		return ResponseEntity.ok(new ResponseMessage(HttpURLConnection.HTTP_CREATED, ResponseStatus.SUCCESS.name(),
				"All Users retrivied successfully", allUsers));
	}

}
