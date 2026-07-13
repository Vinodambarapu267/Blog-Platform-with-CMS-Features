package com.example.demo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
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
	public ResponseEntity<String> getToken(@RequestBody AuthRequest authRequest) {
	    Authentication authentication = authenticationManager.authenticate(
	            new UsernamePasswordAuthenticationToken(authRequest.getUsername(), authRequest.getPassword()));
	    
	    UserCredential user = repository.findByUsername(authentication.getName())
	            .orElseThrow(() -> new UserNotFoundException("User not found"));
	    
	    String token = service.generateToken(authentication.getName(), user.getRole());
	    return ResponseEntity.ok(token);
	}

	@GetMapping("/validate")
	public ResponseEntity<?> validateToken(@RequestParam("token") String token) {
		try {
            service.validateToken(token);
            return ResponseEntity.ok("Token is valid");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid token: " + e.getMessage());
        }
	}

	 @PostMapping("/login")
	    public ResponseEntity<?> login(@RequestBody LoginDto dto) {
	        try {
	            String response = service.login(dto.getEmail(), dto.getPassword());
	            return ResponseEntity.ok(response);
	        } catch (BadCredentialsException e) {
	            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
	                    .body("Invalid email or password");
	        } catch (UserNotFoundException e) {
	            return ResponseEntity.status(HttpStatus.NOT_FOUND)
	                    .body("User not found");
	        } catch (Exception e) {
	            e.printStackTrace();
	            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
	                    .body("An error occurred during login");
	        }
	    }
}