package com.example.demo.kafka;

import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserEventProducer {
	private final KafkaTemplate<String, UserRegisterEvent> kafkaTemplate;

	public void publishedRegisterPublishedEvent(UserRegisterEvent event) {
		kafkaTemplate.send("user-registered", event.getUserId().toString(), event);
	}
}
