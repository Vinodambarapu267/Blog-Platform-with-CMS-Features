package com.example.demo.kafka;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import com.example.demo.dto.PostDto;
import com.example.demo.dto.UserDto;
import com.example.demo.emailService.EmailService;
import com.example.demo.feignclients.PostFeignClient;
import com.example.demo.feignclients.UserFeignClient;
import com.example.demo.utility.KafkaEvent;

@Component
public class KafkaCommentConsumer {
	@Autowired
	private PostFeignClient postFeignClient;
	@Autowired
	private EmailService emailService;

	@Autowired
	private UserFeignClient userFeignClient;

	@KafkaListener(topics = { "comment-created", "comment-moderated" }, groupId = "notification-user-group")
	public void handleCommentEvent(CommentEvent event) {

		if (event == null || event.getPostId() == null) {

			return;
		}
		PostDto post = postFeignClient.findBypostId(event.getPostId());
		UserDto user = userFeignClient.findByUserId(post.getAuthorId());
		if (user.getEmail() == null) {
			System.err.println("User not found");
		}
		
		if (post == null || post.getAuthorId() == null) {

			return;
		}
		if (!post.getPostId().equals(event.getPostId())) {
			return;
		}
		if (!event.getEventType().equals(KafkaEvent.CREATED.name())) {
			return;
		}

		emailService.sendEmail(user.getEmail(),"New comment on your post",
				"You have a new comment.\n" + event.getContent() + "the comment posted by " + event.getAuthorId());
		System.out.println(emailService);
	}

}
