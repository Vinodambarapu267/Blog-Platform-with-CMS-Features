package com.example.demo.kafka;

import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class KafkaUserProducer {
	private final KafkaTemplate<String, UserEvent> kafkaTemplate;

	public void publishedRegisterPublishedEvent(UserEvent event) {
		kafkaTemplate.send("user-registered", event.getUserId().toString(), event);
	}

	public void deleteUserEvent(UserEvent event) {
		kafkaTemplate.send("user-deleted", event.getUserId().toString(), event);
	}
}
