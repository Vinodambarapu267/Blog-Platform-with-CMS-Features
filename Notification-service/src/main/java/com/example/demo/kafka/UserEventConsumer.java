package com.example.demo.kafka;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import com.example.demo.user_service.UserEmailService;
import com.example.demo.utility.KafkaEvent;

@Service
public class UserEventConsumer {
	private final UserEmailService emailService;

	UserEventConsumer(UserEmailService emailService) {
		this.emailService = emailService;
	}

	@KafkaListener(topics = { "user-deleted", "user-registered" }, groupId = "user-service-groups")
	public void handleUserEvents(UserEvent event) {
		if (event.getEventType().equals(KafkaEvent.REGISTERED.name())) {
			String email = event.getEmail();
			if (email != null && !email.isBlank()) {
				emailService.sendEmail(email, "REGISTRATION SUCCESSFULL",
						"Hello " + event.getUsername() + ", your account has been created successfully");
			}
			System.err.println(emailService);
		}
		
	}
}
