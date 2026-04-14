package com.example.demo.service;

import java.util.List;
import java.util.Optional;

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
import com.example.demo.kafka.KafkaEventProducer;
import com.example.demo.kafka.PostEvent;
import com.example.demo.repository.PostLikeRepository;
import com.example.demo.repository.PostRepostiory;
import com.example.demo.utility.KafkaEvent;
import com.example.demo.utility.PostStatus;

@Service
public class PostServiceImpl implements PostService {
	@Autowired
	private PostRepostiory postRepostiory;
	@Autowired
	private PostLikeRepository likeRepository;
	@Autowired
	private KafkaEventProducer eventProducer;

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
		newPost.setViewCount(0);
		newPost.setLikeCount(0);
		Post save = postRepostiory.save(newPost);
		// sending the data to kafka producer
		PostEvent event = new PostEvent();
		event.setPostId(save.getPostId());
		event.setTitle(save.getTitle());
		event.setSlug(save.getSlug());
		event.setContent(save.getContent());
		event.setExcerpt(save.getExcerpt());
		event.setStatus(save.getStatus());
		event.setAuthorId(save.getAuthorId());
		event.setCategoryId(save.getCategoryId());
		event.setViewCount(save.getViewCount());
		event.setLikeCount(save.getLikeCount());
		event.setPulishedAt(save.getPublishedAt());
		event.setCreatedAt(save.getCreatedAt());
		event.setUpdatedAt(save.getUpdatedAt());
		event.setEventType(KafkaEvent.PUBLISHED.name());
		eventProducer.postPublishedEvent(event);
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
		// sending the data to kafka producer
		PostEvent event = new PostEvent();
		event.setPostId(updatePost.getPostId());
		event.setTitle(updatePost.getTitle());
		event.setSlug(updatePost.getSlug());
		event.setContent(updatePost.getContent());
		event.setExcerpt(updatePost.getExcerpt());
		event.setStatus(updatePost.getStatus());
		event.setAuthorId(updatePost.getAuthorId());
		event.setCategoryId(updatePost.getCategoryId());
		event.setViewCount(updatePost.getViewCount());
		event.setLikeCount(updatePost.getLikeCount());
		event.setPulishedAt(updatePost.getPublishedAt());
		event.setCreatedAt(updatePost.getCreatedAt());
		event.setEventType(KafkaEvent.UPDATED.name());
		event.setUpdatedAt(updatePost.getUpdatedAt());
		eventProducer.postUpdatedEvent(event);
		return updatePost;
	}

	@Override
	@Transactional
	@CacheEvict(value = "deletePost", key = "#postId")
	public String deletePost(Long postId) {
		Post existedPost = postRepostiory.findById(postId)
				.orElseThrow(() -> new PostNotFoundException("post not found by this post ID : " + postId));
		likeRepository.deleteByPostId(postId);
		postRepostiory.delete(existedPost);

		// sending the data to kafka producer
		PostEvent event = new PostEvent();
		event.setPostId(existedPost.getPostId());
		event.setTitle(existedPost.getTitle());
		event.setSlug(existedPost.getSlug());
		event.setContent(existedPost.getContent());
		event.setExcerpt(existedPost.getExcerpt());
		event.setStatus(existedPost.getStatus());
		event.setAuthorId(existedPost.getAuthorId());
		event.setCategoryId(existedPost.getCategoryId());
		event.setViewCount(existedPost.getViewCount());
		event.setLikeCount(existedPost.getLikeCount());
		event.setPulishedAt(existedPost.getPublishedAt());
		event.setCreatedAt(existedPost.getCreatedAt());
		event.setEventType(KafkaEvent.DELETED.name());
		event.setUpdatedAt(existedPost.getUpdatedAt());
		eventProducer.postDeletedEvent(event);
		return "deleted successfully";
	}

	@Override
	@CachePut(value = "updatePostStatus", key = "#postId+'-'+#status")
	public String updatePostStatus(Long postId, String status) {
		Post post = postRepostiory.findById(postId)
				.orElseThrow(() -> new PostNotFoundException("post not found by this post ID : " + postId));
		post.setStatus(updatStatus(status.toUpperCase()));
		Post updated = postRepostiory.save(post);
		// sending the data to kafka producer
		PostEvent event = new PostEvent();
		event.setPostId(updated.getPostId());
		event.setStatus(updated.getStatus());
		event.setEventType(KafkaEvent.UPDATED.name());
		eventProducer.postUpdatedEvent(event);
		return "Post updated to this status : " + status;
	}

	@Override
	@CachePut(value = "postLike", key = "#postId")
	public Post addLike(Long postId, PostLikes likes) {
		Post post = postRepostiory.findById(postId)
				.orElseThrow(() -> new PostNotFoundException("Post not found by this post ID : " + postId));
		Long userId = likes.getUserId();
		Optional<PostLikes> existingLikeOpt = likeRepository.findByPostAndUserId(post, userId);

		int currentLikes = post.getLikeCount() == null ? 0 : post.getLikeCount();
		if (existingLikeOpt.isPresent()) {
			PostLikes existingLike = existingLikeOpt.get();
			likeRepository.delete(existingLike);
			post.setLikeCount(Math.max(0, currentLikes - 1));
		} else {
			PostLikes postLike = new PostLikes();
			postLike.setPost(post);
			postLike.setUserId(userId);
			likeRepository.save(postLike);
			post.setLikeCount(currentLikes + 1);
		}
		Post updateLike = postRepostiory.save(post);
		// sending the data to kafka producer
		PostEvent event = new PostEvent();
		event.setPostId(updateLike.getPostId());
		event.setLikeCount(updateLike.getLikeCount());
		event.setEventType(KafkaEvent.UPDATED.name());
		eventProducer.postUpdatedEvent(event);
		return updateLike;
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
		Integer like_count = post.getLikeCount();
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
