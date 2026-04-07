package com.example.demo.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.demo.dto.PostDto;
import com.example.demo.entity.Post;
import com.example.demo.entity.PostLikes;

@Service
public interface PostService {
	public Post findBySlug(String slug);

	public Post createPost(Post post);

	public Post updatePost(Long postId, PostDto postDto);

	public String deletePost(Long postId);

	public String updatePostStatus(Long postId, String status);

	public Post addLike(Long postId, PostLikes likes);

	public List<Post> findAllPost();

	public int totalLikes(Long postId);
}
