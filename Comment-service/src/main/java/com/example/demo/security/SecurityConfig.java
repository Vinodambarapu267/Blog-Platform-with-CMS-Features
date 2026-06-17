package com.example.demo.security;

import java.io.IOException; // ← CORRECT

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.servlet.http.HttpServletResponse;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

	private final JwtAuthenticationFilter jwtAuthenticationFilter;
	private final ObjectMapper objectMapper = new ObjectMapper();

	public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
		this.jwtAuthenticationFilter = jwtAuthenticationFilter;
	}

	@Bean
	public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
		http.csrf(csrf -> csrf.disable())
				.sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
				.authorizeHttpRequests(auth -> auth.requestMatchers("/actuator/**").permitAll()

			            .requestMatchers(HttpMethod.GET, "/api/v1/comments/posts/{postId}/comments").permitAll()
			            .requestMatchers("/api/v1/comments/**") .authenticated().anyRequest().authenticated())
				.exceptionHandling(ex -> ex.authenticationEntryPoint(
						(req, res, e) -> writeJsonError(res, HttpStatus.UNAUTHORIZED, "Missing or invalid token"))
						.accessDeniedHandler((req, res, e) -> writeJsonError(res, HttpStatus.FORBIDDEN,
								"You do not have permission to perform this action")))
				.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
System.err.println();
		return http.build();
	}

	private void writeJsonError(HttpServletResponse response, HttpStatus status, String message) throws IOException {
		response.setStatus(status.value());
		response.setContentType(MediaType.APPLICATION_JSON_VALUE);
		response.getWriter().write(objectMapper.writeValueAsString(
				java.util.Map.of("statusCode", status.value(), "status", "FAILURE", "message", message)));
	}
}