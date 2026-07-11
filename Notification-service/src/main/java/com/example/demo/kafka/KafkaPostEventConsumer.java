package com.example.demo.kafka;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import com.example.demo.dto.UserDto;
import com.example.demo.emailService.EmailService;
import com.example.demo.feignclients.UserFeignClient;
import com.example.demo.utility.KafkaEvent;

@Component
public class KafkaPostEventConsumer {

	private final EmailService emailService;
	private final UserFeignClient userFeignClient;

	public KafkaPostEventConsumer(EmailService emailService, UserFeignClient userFeignClient) {
		this.emailService = emailService;
		this.userFeignClient = userFeignClient;
	}

	private final Map<Long, String> userEmailCache = new ConcurrentHashMap<>();

	@KafkaListener(topics = { "user-updated" }, groupId = "notification-user-group")
	public void handleUserUpdatedEvent(UserEvent userEvent) {
		if (userEvent == null || userEvent.getUserId() == null) {
			return;
		}

		String email = userEvent.getEmail();
		if (email != null && !email.isBlank()) {
			userEmailCache.put(userEvent.getUserId(), email);
		}
	}

	@KafkaListener(topics = { "post-published" }, groupId = "notification-post-group")
	public void handlePostEvent(PostEvent event) {
		if (event == null || event.getEventType() == null || event.getAuthorId() == null) {
			return;
		}

		if (!KafkaEvent.PUBLISHED.name().equals(event.getEventType())) {
			return;
		}
		Long authorId = event.getAuthorId();
		String email = userEmailCache.get(authorId);
		if (email == null || email.isBlank()) {
			try {
				UserDto user = userFeignClient.findByUserId(authorId);
				if (user != null && user.getEmail() != null && !user.getEmail().isBlank()) {
					email = user.getEmail();
					userEmailCache.put(authorId, email);
				}
			} catch (Exception ex) {
			
			}
		}

		if (email == null || email.isBlank()) {

			return;
		}

		emailService.sendPostPublishedMail(
				email,
				"Post Published successfully",
				"Hello, your post \"" + event.getTitle() + "\" (id: " + event.getPostId()
						+ ") was published successfully.");

	}
}