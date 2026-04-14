package com.example.demo.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

@Configuration
public class KafkaConfig {
	@Bean
	public NewTopic postPublishedTopic() {
		return TopicBuilder.name("post-published").partitions(3) // number of partitions
				.replicas(2) // replication factor
				.build();
	}	@Bean
	public NewTopic postUpdatedTopic() {
		return TopicBuilder.name("post-updated").partitions(3) // number of partitions
				.replicas(2) // replication factor
				.build();
	}
}
