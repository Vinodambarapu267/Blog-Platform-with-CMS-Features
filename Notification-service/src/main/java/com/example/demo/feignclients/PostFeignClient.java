package com.example.demo.feignclients;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import com.example.demo.dto.PostDto;
@FeignClient(name = "posts-service",url = "http://localhost:8083/api/v1/posts")
public interface PostFeignClient {
	@GetMapping("/{postId}")
	PostDto findBypostId(@PathVariable Long postId);
}
