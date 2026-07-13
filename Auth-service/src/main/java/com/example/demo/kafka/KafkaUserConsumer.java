package com.example.demo.kafka;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.example.demo.entity.UserCredential;
import com.example.demo.exception.UserNotFoundException;
import com.example.demo.repository.UserCredentialRepository;

@Component
public class KafkaUserConsumer {

	private final UserCredentialRepository credentialRepository;

	public KafkaUserConsumer(UserCredentialRepository credentialRepository) {
		this.credentialRepository = credentialRepository;
	
	}

	@KafkaListener(topics = { "user-registered", "user-updated" }, groupId = "auth-service-group")
	public void handleUserConsumerEvent(UserEvent event) {
		if (event == null) {
			throw new IllegalArgumentException("UserEvent is null");
		}

		if (event.getEventType() == null) {
			throw new IllegalArgumentException("Event type is null");
		}

		if (KafkaEvents.REGISTERED.name().equals(event.getEventType())) {

			if (event.getPassword() == null || event.getPassword().isBlank()) {
				throw new IllegalArgumentException("Password is missing in Kafka event");
			}
			UserCredential credential = new UserCredential();
			credential.setUsername(event.getUsername());
			credential.setEmail(event.getEmail());
			credential.setPassword(event.getPassword());
			credential.setRole(event.getRole() != null ? event.getRole().name() : null);
			credential.setActive(true);
			credentialRepository.save(credential);
		}
		if (KafkaEvents.UPDATED.name().equals(event.getEventType())) {
			UserCredential updateUser = credentialRepository.findById(event.getUserId()).orElseThrow(
					() -> new UserNotFoundException("No credential found for the userId" + event.getUserId()));

			updateUser.setUsername(event.getUsername());
			updateUser.setEmail(event.getEmail());
			updateUser.setRole(event.getRole() != null ? event.getRole().name() : null);
			updateUser.setActive(true);
			credentialRepository.save(updateUser);
		}
	}
}
