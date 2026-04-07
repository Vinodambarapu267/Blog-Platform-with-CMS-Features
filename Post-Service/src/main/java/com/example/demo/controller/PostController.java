package com.example.demo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.PostDto;
import com.example.demo.entity.Post;
import com.example.demo.entity.PostLikes;
import com.example.demo.service.PostService;

@RestController
@RequestMapping("/api/v1/posts")
public class PostController {
	@Autowired
	private PostService postService;

	@PostMapping("/createpost")
	public ResponseEntity<?> addPost(@RequestBody Post post) {
		Post addPost = postService.createPost(post);
		return ResponseEntity.ok(addPost);
	}

	@PutMapping("/updatepost/{id}")
	public ResponseEntity<?> updatPost(@PathVariable("id") Long postId, @RequestBody PostDto postDto) {
		Post updatePost = postService.updatePost(postId, postDto);
		return ResponseEntity.ok(updatePost);
	}

	@DeleteMapping("/{id}")
	public String deletePost(@PathVariable("id")  Long postId) {
		String deletePost = postService.deletePost(postId);
		return deletePost;
	}

	@PutMapping("/updatestatus/{id}")
	public String updateStatus(@PathVariable("id")  Long postid, @RequestParam String status) {
		String updatePostStatus = postService.updatePostStatus(postid, status);
		return updatePostStatus;
	}

	@PostMapping("/{id}/like")
	public ResponseEntity<?> addLike(@PathVariable("id")  Long postId, @RequestBody PostLikes likes) {
		Post like = postService.addLike(postId, likes);
		return ResponseEntity.ok(like);
	}

	@GetMapping("/posts/{id}/likes")
	public Integer getTotalLikes(@PathVariable("id")  Long postId) {
		int totalLikes = postService.totalLikes(postId);
		return totalLikes;
	}

}
