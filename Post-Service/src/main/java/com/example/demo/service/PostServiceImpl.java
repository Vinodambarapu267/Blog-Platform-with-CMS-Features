package com.example.demo.service;

import java.util.List;
import java.util.Optional;

import org.hibernate.annotations.Cache;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.dto.PostDto;
import com.example.demo.entity.Post;
import com.example.demo.entity.PostLikes;
import com.example.demo.exception.PostAlreadyExistException;
import com.example.demo.exception.PostNotFoundException;
import com.example.demo.repository.PostLikeRepository;
import com.example.demo.repository.PostRepostiory;
import com.example.demo.utility.PostStatus;

@Service
public class PostServiceImpl implements PostService {
	@Autowired
	private PostRepostiory postRepostiory;
	@Autowired
	private PostLikeRepository likeRepository;

	@Override
	public Post createPost(Post post) {
		Optional<Post> bySlug = postRepostiory.findBySlug(post.getSlug());
		if (bySlug.isPresent()) {
			throw new PostAlreadyExistException("Post already exist ");
		}
		Post newPost = new Post();
		newPost.setTitle(post.getTitle());
		newPost.setSlug(post.getSlug());
		newPost.setContent(post.getContent());
		newPost.setExcerpt(post.getExcerpt());
		newPost.setAuthorId(post.getAuthorId());
		newPost.setCategoryId(post.getCategoryId());
		newPost.setView_count(0);
		newPost.setLike_count(0);
		Post save = postRepostiory.save(newPost);
		return save;
	}

	@Override
	@Cacheable(value = "post", key = "#slug")
	public Post findBySlug(String slug) {
		Post post = postRepostiory.findBySlug(slug)
				.orElseThrow(() -> new PostNotFoundException("post not found by this slug {}" + slug));

		return post;
	}

	@Override
	@CachePut(value = "updatePost", key = "#postId")
	public Post updatePost(Long postId, PostDto postDto) {
		Post existedPost = postRepostiory.findById(postId)
				.orElseThrow(() -> new PostNotFoundException("post not found by this post ID : " + postId));
		existedPost.setTitle(postDto.getTitle());
		existedPost.setSlug(postDto.getSlug());
		existedPost.setContent(postDto.getContent());
		existedPost.setExcerpt(postDto.getExcerpt());
		existedPost.setAuthorId(postDto.getAuthorId());
		existedPost.setCategoryId(postDto.getCategoryId());
		existedPost.setStatus(updatStatus(postDto.getStatus().name().toUpperCase()));
		Post updatePost = postRepostiory.save(existedPost);
		return updatePost;
	}

	@Override
	@Transactional
	@CacheEvict(value = "deletePost", key = "#postId")
	public String deletePost(Long postId) {
		Post existedPost = postRepostiory.findById(postId)
				.orElseThrow(() -> new PostNotFoundException("post not found by this post ID : " + postId));

		postRepostiory.delete(existedPost);
		likeRepository.deleteByPostId(postId);
		return "deleted successfully";
	}

	@Override
	@CachePut(value = "updatePostStatus", key = "#postId+'-'+#status")
	public String updatePostStatus(Long postId, String status) {
		Post post = postRepostiory.findById(postId)
				.orElseThrow(() -> new PostNotFoundException("post not found by this post ID : " + postId));
		post.setStatus(updatStatus(status.toUpperCase()));
		return "Post updated to this status : " + status;
	}

	@Override
	@CachePut(value = "postLike", key = "#postId")
	public Post addLike(Long postId, PostLikes likes) {
		Post post = postRepostiory.findById(postId)
				.orElseThrow(() -> new PostNotFoundException("Post not found by this post ID : " + postId));

		Long userId = likes.getUserId();

		Optional<PostLikes> existingLikeOpt = likeRepository.findByPostAndUserId(post, userId);

		int currentLikes = post.getLike_count() == null ? 0 : post.getLike_count();
		if (existingLikeOpt.isPresent()) {
			PostLikes existingLike = existingLikeOpt.get();
			likeRepository.delete(existingLike);
			post.setLike_count(Math.max(0, currentLikes - 1));
		} else {
			PostLikes postLike = new PostLikes();
			postLike.setPost(post);
			postLike.setUserId(userId);
			likeRepository.save(postLike);

			post.setLike_count(currentLikes + 1);
		}

		return postRepostiory.save(post);
	}

	@Override
	@Cacheable(value = "allPosts", key = "'all'")
	public List<Post> findAllPost() {
		List<Post> all = postRepostiory.findAll();
		if (all.isEmpty()) {
			throw new PostNotFoundException("no posts available");
		}

		return all;
	}

	@Override
	@Cacheable(value = "postLikes", key = "#postId")
	public int totalLikes(Long postId) {
		Post post = postRepostiory.findById(postId)
				.orElseThrow(() -> new PostNotFoundException("post not found by this post ID : " + postId));
		Integer like_count = post.getLike_count();
		return like_count;
	}

	private static PostStatus updatStatus(String status) {
		return switch (status) {
		case "ARCHIVED" -> PostStatus.ARCHIVED;
		case "DELETED" -> PostStatus.DELETED;
		case "DRAFT" -> PostStatus.DRAFT;
		case "PUBLISHED" -> PostStatus.PUBLISHED;
		case "REVIEW" -> PostStatus.REVIEW;
		default -> throw new IllegalArgumentException("Enter valid status");
		};
	}

}
