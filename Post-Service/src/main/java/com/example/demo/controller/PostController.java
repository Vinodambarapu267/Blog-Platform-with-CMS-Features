package com.example.demo.controller;

import java.net.HttpURLConnection;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
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
import com.example.demo.entity.PostLike;
import com.example.demo.service.PostService;
import com.example.demo.utility.ResponseMessage;
import com.example.demo.utility.ResponseStatus;

import io.github.resilience4j.ratelimiter.annotation.RateLimiter;

@RestController
@RequestMapping("/api/v1/posts")
public class PostController {
	@Autowired
	private PostService postService;

	@PostMapping("/createpost")
	@PreAuthorize("hasAuthority('POST_CREATE')")
	public ResponseEntity<?> addPost(@RequestBody Post post, Authentication authentication) {
		Post addPost = postService.createPost(post, authentication.getName());
		if (addPost == null) {
			return ResponseEntity.ok(new ResponseMessage(HttpURLConnection.HTTP_BAD_REQUEST,
					ResponseStatus.FAILURE.name(), "Creating of Post Failed"));
		}
		return ResponseEntity.ok(new ResponseMessage(HttpURLConnection.HTTP_CREATED, ResponseStatus.SUCCESS.name(),
				"Post created succcessfully", addPost));
	}

	@RateLimiter(name = "myRateLimiter")
	@PreAuthorize("hasAuthority('POST_UPDATE_OWN')")
	@PutMapping("/updatepost/{id}")
	public ResponseEntity<?> updatPost(@PathVariable("id") Long postId, @RequestBody PostDto postDto,
			Authentication authentication) {
		Post updatePost = postService.updatePost(postId, postDto, authentication);
		if (updatePost == null) {
			return ResponseEntity.ok(new ResponseMessage(HttpURLConnection.HTTP_BAD_REQUEST,
					ResponseStatus.FAILURE.name(), "Updating of Post Failed"));
		}
		return ResponseEntity.ok(new ResponseMessage(HttpURLConnection.HTTP_CREATED, ResponseStatus.SUCCESS.name(),
				"Post updated succcessfully", updatePost));
	}

	@DeleteMapping("/{id}")
	@PreAuthorize("hasAuthority('POST_DELETE_ANY') or hasAuthority('POST_DELETE_OWN')")
	public String deletePost(@PathVariable("id") Long postId, Authentication authentication) {
		return postService.deletePost(postId, authentication);
	}

	@PutMapping("/updatestatus/{id}")
	@RateLimiter(name = "myRateLimiter")
	@PreAuthorize("isAuthenticated()") // fine-grained check happens in service, see Step 6
	public String updateStatus(@PathVariable("id") Long postId, @RequestParam String status,
			Authentication authentication) {
		return postService.updatePostStatus(postId, status, authentication);
	}

	@GetMapping("/findpostsbyuserid/{userId}")
	public ResponseEntity<?> findAllByAuthorId(@PathVariable Long userId) {
		List<Post> posts = postService.findAllByAuthorId(userId);
		if (posts == null) {
			return ResponseEntity.ok(new ResponseMessage(HttpURLConnection.HTTP_BAD_REQUEST,
					ResponseStatus.FAILURE.name(), "liking of Post Failed"));
		}
		return ResponseEntity.ok(new ResponseMessage(HttpURLConnection.HTTP_CREATED, ResponseStatus.SUCCESS.name(),
				"Post liked succcessfully", posts));
	}

	@PostMapping("/{id}/like")
	@RateLimiter(name = "myRateLimiter")
	@PreAuthorize("hasAuthority('POST_LIKE')")
	public ResponseEntity<?> addLike(@PathVariable("id") Long postId, @RequestBody PostLike likes,
			Authentication authentication) {
		Post like = postService.addLike(postId, likes, authentication);
		if (like == null) {
			return ResponseEntity.ok(new ResponseMessage(HttpURLConnection.HTTP_BAD_REQUEST,
					ResponseStatus.FAILURE.name(), "liking of Post Failed"));
		}
		return ResponseEntity.ok(new ResponseMessage(HttpURLConnection.HTTP_CREATED, ResponseStatus.SUCCESS.name(),
				"Post liked succcessfully", like));
	}

	@GetMapping("/{postId}")
	public PostDto findByPostId(@PathVariable Long postId) {
		PostDto post = postService.findById(postId);
		return post;
	}

	@GetMapping("/{id}/likes")
	@RateLimiter(name = "myRateLimiter")
	@PreAuthorize("hasAuthority('POST_LIKES')")
	public Integer getTotalLikes(@PathVariable("id") Long postId) {
		int totalLikes = postService.totalLikes(postId);
		return totalLikes;
	}

}
