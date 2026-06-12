package com.example.demo.kafka;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import com.example.demo.service.UserService;
import com.example.demo.utility.KafkaPostEvent;

@Component
public class KafkaUserEventConsumer {
	@Autowired
	private UserService userService;

	@KafkaListener(topics = { "post-published", "post-updated", "post-deleted" }, groupId = "post-service-group")
	public void handlePostEvent(PostEvent event) {
		if (event.getEventType().equals(KafkaPostEvent.PUBLISHED.name())) {
			userService.addPost(event.getAuthorId(), event);
		}
	}
}
