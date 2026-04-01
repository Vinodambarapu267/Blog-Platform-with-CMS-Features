package com.example.demo.service;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.demo.entity.UserCredential;
import com.example.demo.repository.UserCredentialRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {

	private final UserCredentialRepository repository;
	private final BCryptPasswordEncoder passwordEncoder;
	private final JwtService jwtService;

	public String saveUser(UserCredential credential) {
		System.out.println("Raw password before encode: " + credential.getPassword());
	    credential.setPassword(passwordEncoder.encode(credential.getPassword()));
	    System.out.println("Stored hash: " + credential.getPassword());
	    repository.save(credential);
		return "User added successfully";
	}

	public String generateToken(String username) {

		return jwtService.generateToken(username);
	}

	public void validateToken(String token) {
	    if (!jwtService.validateToken(token)) {
	        throw new RuntimeException("Token is invalid or expired");
	    }
	}
	public String login(String email, String password) {
	    UserCredential user = repository.findByEmail(email)
	            .orElseThrow(() -> new RuntimeException("User not found"));
	    if (!passwordEncoder.matches(password, user.getPassword())) {
	        throw new RuntimeException("Invalid password");
	    }
return "login successsfull";
	}
}