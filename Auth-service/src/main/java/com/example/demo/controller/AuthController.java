package com.example.demo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.AuthRequest;
import com.example.demo.dto.LoginDto;
import com.example.demo.entity.UserCredential;
import com.example.demo.exception.UserNotFoundException;
import com.example.demo.repository.UserCredentialRepository;
import com.example.demo.service.AuthService;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {
	@Autowired
	private AuthService service;
	@Autowired
	private AuthenticationManager authenticationManager;
	@Autowired
	private UserCredentialRepository repository;

	@PostMapping("/token")
	public String getToken(@RequestBody AuthRequest authRequest) {
		try {
			Authentication authentication = authenticationManager.authenticate(
					new UsernamePasswordAuthenticationToken(authRequest.getUsername(), authRequest.getPassword()));

			UserCredential user = repository.findByUsername(authentication.getName())
					.orElseThrow(() -> new UserNotFoundException("User not found"));

			return service.generateToken(authentication.getName(), user.getRole());

		} catch (Exception e) {
			e.printStackTrace();
			throw e;
		}
	}

	@GetMapping("/validate")
	public String validateToken(@RequestParam("token") String token) {
		service.validateToken(token);
		return "Token is valid";
	}

	@PostMapping("/login")
	public ResponseEntity<String> login(@RequestBody LoginDto dto) {
		String response = service.login(dto.getEmail(), dto.getPassword());
		return ResponseEntity.ok(response);
	}
}