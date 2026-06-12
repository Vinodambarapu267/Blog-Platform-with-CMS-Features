package com.example.demo.kafka;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import com.example.demo.emailService.EmailService;
import com.example.demo.utility.KafkaEvent;

@Service
public class KafkaUserEventConsumer {
	private final EmailService emailService;

	KafkaUserEventConsumer(EmailService emailService) {
		this.emailService = emailService;
	}

	@KafkaListener(topics = { "user-deleted", "user-updated", "user-registered" }, groupId = "notification-user-group")
	public void handleUserEvents(UserEvent event) {
		String email = event.getEmail();
		if (event.getEventType().equals(KafkaEvent.REGISTERED.name())) {
			if (email != null && !email.isBlank()) {
				emailService.sendEmail(email, "REGISTRATION SUCCESSFULL",
						"Hello " + event.getUsername() + ", your account has been created successfully");
			}

		}
		if (event.getEventType().equals(KafkaEvent.UPDATED.name())) {
			if (email != null && !email.isBlank()) {
				emailService.sendEmail(email, "User Details are Updated",
						"Hi " + event.getUsername() + ",\n\n"
								+ "This is a confirmation that your account details were updated.\n\n"
								+ "Updated details: " + event.getEmail() + "\nDisplay name: " + event.getDisplayName()
								+ ",\nusername: " + event.getUsername() + ",\nBio: " + event.getBio() + "\n"
								+ "Best regards,\n" + "\tThe Support Team");
			}

		}

	}
}
