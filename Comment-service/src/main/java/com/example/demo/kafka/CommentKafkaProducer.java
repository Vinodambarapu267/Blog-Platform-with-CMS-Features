package com.example.demo.kafka;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
public class CommentKafkaProducer {

	@Autowired
	private KafkaTemplate<String, CommentEvent> kafkaTemplate;

	public void commentCreated(CommentEvent event) {
		kafkaTemplate.send("comment-created", event.getAuthorId().toString(), event);

	}

	public void commentModerated(CommentEvent event) {
		kafkaTemplate.send("comment-moderated", event.getAuthorId().toString(), event);
	}
}
