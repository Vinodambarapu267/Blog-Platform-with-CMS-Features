package com.example.demo.service;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import com.example.demo.dto.PostDto;
import com.example.demo.entity.Post;
import com.example.demo.entity.PostLike;

@Service
public interface PostService {
	
	public Post createPost(Post post, String username);

	public Post updatePost(Long postId, PostDto postDto, Authentication authentication);

	public String deletePost(Long postId, Authentication authentication);

	public String updatePostStatus(Long postId, String status, Authentication authentication);

	public Post addLike(Long postId, PostLike likes, Authentication authentication);

	public List<Post> findAllPost();

	public int totalLikes(Long postId);

	public void deleteAllPostByUserId(Long userId);

	public PostDto findById(Long postId);
}