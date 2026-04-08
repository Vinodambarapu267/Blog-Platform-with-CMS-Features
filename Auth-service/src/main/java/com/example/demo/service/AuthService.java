package com.example.demo.service;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.demo.entity.UserCredential;
import com.example.demo.repository.UserCredentialRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@EnableMethodSecurity
public class AuthService {

	private final UserCredentialRepository repository;
	private final BCryptPasswordEncoder passwordEncoder;
	private final JwtUtil jwtUtil;

	@PreAuthorize("hasRole('SUPER_ADMIN','ADMIN')")
	public String saveUser(UserCredential credential) {
		System.out.println("Raw password before encode: " + credential.getPassword());
		credential.setPassword(passwordEncoder.encode(credential.getPassword()));
		System.out.println("Stored hash: " + credential.getPassword());
		repository.save(credential);
		return "User added successfully";
	}

	@PreAuthorize("permitAll()")
	public String generateToken(String username) {

		return jwtUtil.generateToken(username);
	}

	@PreAuthorize("isAuthenticated()")
	public void validateToken(String token) {
		if (!jwtUtil.validateToken(token)) {
			throw new RuntimeException("Token is invalid or expired");
		}
	}

	@PreAuthorize("permitAll()")
	public String login(String email, String password) {
		UserCredential user = repository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
		if (!passwordEncoder.matches(password, user.getPassword())) {
			throw new RuntimeException("Invalid password");
		}
		String token = jwtUtil.generateToken(user.getUsername());

		return token;
	}
}