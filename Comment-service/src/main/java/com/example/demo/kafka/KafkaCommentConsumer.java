package com.example.demo.kafka;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import com.example.demo.service.CommentService;
import com.example.demo.utility.KafkaEvent;

@Component
public class KafkaCommentConsumer {
	@Autowired
	private CommentService commentService;

	@KafkaListener(topics = { "post-deleted" }, groupId = "comment-service-group")
	public void handlePostEvent(PostEvent event) {
		if (event.getEventType().equals(KafkaEvent.DELETED.name())) {
			commentService.deleteAllCommentWhenThePostDeleted(event.getPostId());
		}
	}
}