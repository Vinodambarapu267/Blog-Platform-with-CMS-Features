package com.example.demo.kafka;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
public class KafkaEventProducer {
	@Autowired
	private KafkaTemplate<String, PostEvent> kafkaTemplate;

	public void postPublishedEvent(PostEvent event) {
		kafkaTemplate.send("post-published", event.getPostId().toString(), event);
	}

	public void postUpdatedEvent(PostEvent event) {
		kafkaTemplate.send("post-updated", event.getPostId().toString(), event);
	}

	public void postDeletedEvent(PostEvent event) {
		kafkaTemplate.send("post-deleted", event.getPostId().toString(), event);
	}
}
