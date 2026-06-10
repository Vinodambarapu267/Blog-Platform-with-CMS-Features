package com.example.demo.kafka;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import com.example.demo.service.PostService;
import com.example.demo.utility.KafkaEvent;

@Component
public class KafkaEventConsumer {
	@Autowired
	private PostService postService;

	@KafkaListener(topicPattern = "user-deleted", groupId = "user-service-group")
	public void handleUserEvent(UserEvent event) {
		if (event.getEventType().equals(KafkaEvent.DELETED.name())) {
			postService.deleteAllPostByUserId(event.getUserId());
		}
	}
}
