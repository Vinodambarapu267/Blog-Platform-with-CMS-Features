package com.example.demo.controller;

import java.net.HttpURLConnection;

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
import com.example.demo.utility.ResponseMessage;
import com.example.demo.utility.ResponseStatus;

@RestController
@RequestMapping("/api/v1/posts")
public class PostController {
	@Autowired
	private PostService postService;

	@PostMapping("/createpost")
	public ResponseEntity<?> addPost(@RequestBody Post post) {
		Post addPost = postService.createPost(post);
		if (addPost == null) {
			return ResponseEntity.ok(new ResponseMessage(HttpURLConnection.HTTP_BAD_REQUEST,
					ResponseStatus.FAILURE.name(), "Creating of Post Failed"));
		}
		return ResponseEntity.ok(new ResponseMessage(HttpURLConnection.HTTP_CREATED, ResponseStatus.SUCCESS.name(),
				"Post created succcessfully", addPost));
	}

	@PutMapping("/updatepost/{id}")
	public ResponseEntity<?> updatPost(@PathVariable("id") Long postId, @RequestBody PostDto postDto) {
		Post updatePost = postService.updatePost(postId, postDto);
		if (updatePost == null) {
			return ResponseEntity.ok(new ResponseMessage(HttpURLConnection.HTTP_BAD_REQUEST,
					ResponseStatus.FAILURE.name(), "Updating of Post Failed"));
		}
		return ResponseEntity.ok(new ResponseMessage(HttpURLConnection.HTTP_CREATED, ResponseStatus.SUCCESS.name(),
				"Post updated succcessfully", updatePost));
	}

	@DeleteMapping("/{id}")
	public String deletePost(@PathVariable("id") Long postId) {
		String deletePost = postService.deletePost(postId);
		return deletePost;
	}

	@PutMapping("/updatestatus/{id}")
	public String updateStatus(@PathVariable("id") Long postid, @RequestParam String status) {
		String updatePostStatus = postService.updatePostStatus(postid, status);
		return updatePostStatus;
	}

	@PostMapping("/{id}/like")
	public ResponseEntity<?> addLike(@PathVariable("id") Long postId, @RequestBody PostLikes likes) {
		Post like = postService.addLike(postId, likes);
		if (like == null) {
			return ResponseEntity.ok(new ResponseMessage(HttpURLConnection.HTTP_BAD_REQUEST,
					ResponseStatus.FAILURE.name(), "liking of Post Failed"));
		}
		return ResponseEntity.ok(new ResponseMessage(HttpURLConnection.HTTP_CREATED, ResponseStatus.SUCCESS.name(),
				"Post liked succcessfully", like));
	}

	@GetMapping("/{id}/likes")
	public Integer getTotalLikes(@PathVariable("id") Long postId) {
		int totalLikes = postService.totalLikes(postId);
		return totalLikes;
	}

}
