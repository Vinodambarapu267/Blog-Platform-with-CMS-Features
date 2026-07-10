package com.example.demo.service;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.dto.PostDto;
import com.example.demo.dto.UserDto;
import com.example.demo.entity.Post;
import com.example.demo.entity.PostLike;
import com.example.demo.exception.PostAlreadyExistException;
import com.example.demo.exception.PostNotFoundException;
import com.example.demo.exception.UserNotFoundException;
import com.example.demo.feignclients.UserFeignClient;
import com.example.demo.kafka.KafkaPostEventProducer;
import com.example.demo.kafka.PostEvent;
import com.example.demo.repository.PostLikeRepository;
import com.example.demo.repository.PostRepository;
import com.example.demo.utility.KafkaEvent;
import com.example.demo.utility.PostStatus;

@Service
public class PostServiceImpl implements PostService {
	@Autowired
	private PostRepository postRepostiory;
	@Autowired
	private PostLikeRepository likeRepository;
	@Autowired
	private KafkaPostEventProducer eventProducer;
	@Autowired
	private UserFeignClient client;

	// ---------- security helpers ----------

	private Set<String> authorities(Authentication authentication) {
		if (authentication == null) {
			return Set.of();
		}
		return authentication.getAuthorities().stream().map(a -> a.getAuthority()).collect(Collectors.toSet());
	}

	private boolean has(Set<String> authorities, String permission) {
		return authorities.contains(permission);
	}

	private void requirePermission(Set<String> authorities, String permission) {
		if (!has(authorities, permission)) {
			throw new AccessDeniedException("Missing permission: " + permission);
		}
	}

	private Long resolveUserId(String username) {
		UserDto user = client.findByUsername(username);
		if (user == null || user.getUserId() == null) {
			throw new UserNotFoundException("User Not found by username: " + username);
		}
		return user.getUserId();
	}

	private boolean isOwner(Post post, Authentication authentication) {
		if (authentication == null || authentication.getName() == null) {
			return false;
		}
		Long callerUserId = resolveUserId(authentication.getName());
		return post.getAuthorId() != null && post.getAuthorId().equals(callerUserId);
	}

	@Override
	public Post createPost(Post post, String username) {
		Optional<Post> bySlug = postRepostiory.findBySlug(post.getSlug());
		if (bySlug.isPresent()) {
			throw new PostAlreadyExistException("Post already exist ");
		}

		Long callerUserId = resolveUserId(username);

		if (callerUserId == null || callerUserId == null) {
			throw new UserNotFoundException("User Not found by this ID: " + callerUserId);
		}

		Post newPost = new Post();
		newPost.setTitle(post.getTitle());
		newPost.setSlug(post.getSlug());
		newPost.setContent(post.getContent());
		newPost.setExcerpt(post.getExcerpt());
		newPost.setAuthorId(callerUserId);
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
		event.setPublishedAt(save.getPublishedAt());
		event.setCreatedAt(save.getCreatedAt());
		event.setUpdatedAt(save.getUpdatedAt());
		event.setEventType(KafkaEvent.PUBLISHED.name());
		eventProducer.postPublishedEvent(event);
		return save;
	}

	@Override
	@CachePut(value = "updatePost", key = "#postId")
	public Post updatePost(Long postId, PostDto postDto, Authentication authentication) {
		Post existedPost = postRepostiory.findById(postId)
				.orElseThrow(() -> new PostNotFoundException("post not found by this post ID : " + postId));

		Set<String> authorities = authorities(authentication);
		boolean canUpdateOwn = has(authorities, "POST_UPDATE_OWN") && isOwner(existedPost, authentication);
		Long callerUserId = resolveUserId(authentication.getName());
		if (!canUpdateOwn) {
			throw new AccessDeniedException("You do not have permission to update this post");
		}

		existedPost.setTitle(postDto.getTitle());
		existedPost.setSlug(postDto.getSlug());
		existedPost.setContent(postDto.getContent());
		existedPost.setExcerpt(postDto.getExcerpt());
		existedPost.setAuthorId(callerUserId);
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
		event.setPublishedAt(updatePost.getPublishedAt());
		event.setCreatedAt(updatePost.getCreatedAt());
		event.setEventType(KafkaEvent.UPDATED.name());
		event.setUpdatedAt(updatePost.getUpdatedAt());
		eventProducer.postUpdatedEvent(event);
		return updatePost;
	}

	@Override
	@Transactional
	@CacheEvict(value = "deletePost", key = "#postId")
	public String deletePost(Long postId, Authentication authentication) {
		Post existedPost = postRepostiory.findById(postId)
				.orElseThrow(() -> new PostNotFoundException("post not found by this post ID : " + postId));

		Set<String> authorities = authorities(authentication);
		boolean canDeleteAny = has(authorities, "POST_DELETE_ANY");
		boolean canDeleteOwn = has(authorities, "POST_DELETE_OWN") && isOwner(existedPost, authentication);

		if (!canDeleteAny && !canDeleteOwn) {
			throw new AccessDeniedException("You do not have permission to delete this post");
		}

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
		event.setPublishedAt(existedPost.getPublishedAt());
		event.setCreatedAt(existedPost.getCreatedAt());
		event.setEventType(KafkaEvent.DELETED.name());
		event.setUpdatedAt(existedPost.getUpdatedAt());
		eventProducer.postDeletedEvent(event);
		return "deleted successfully";
	}

	@Override
	@CachePut(value = "updatePostStatus", key = "#postId+'-'+#status")
	public String updatePostStatus(Long postId, String status, Authentication authentication) {
		Post post = postRepostiory.findById(postId)
				.orElseThrow(() -> new PostNotFoundException("post not found by this post ID : " + postId));

		PostStatus newStatus = updatStatus(status.toUpperCase());
		Set<String> authorities = authorities(authentication);

		switch (newStatus) {
		case PUBLISHED:
			requirePermission(authorities, "POST_PUBLISH");
			break;

		case ARCHIVED:
			requirePermission(authorities, "POST_UNPUBLISH");
			break;

		case REVIEW:
			boolean canSubmitOwn = has(authorities, "POST_SUBMIT_DRAFT") && isOwner(post, authentication);
			boolean canApprove = has(authorities, "POST_APPROVE");
			if (!canSubmitOwn && !canApprove) {
				throw new AccessDeniedException("Missing permission: POST_SUBMIT_DRAFT (own post) or POST_APPROVE");
			}
			break;

		case DRAFT:
			requirePermission(authorities, "POST_REJECT");
			break;

		case DELETED:
			boolean canDeleteAny = has(authorities, "POST_DELETE_ANY");
			boolean canDeleteOwn = has(authorities, "POST_DELETE_OWN") && isOwner(post, authentication);
			if (!canDeleteAny && !canDeleteOwn) {
				throw new AccessDeniedException("Missing permission: POST_DELETE_ANY or POST_DELETE_OWN");
			}
			break;
		}

		post.setStatus(newStatus);
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
	@Caching(evict = { @CacheEvict(value = "postLikeCount", key = "#postId"),
			@CacheEvict(value = "postById", key = "#postId") })
	public Post addLike(Long postId, PostLike likes, Authentication authentication) {
		Post post = postRepostiory.findById(postId)
				.orElseThrow(() -> new PostNotFoundException("Post not found by this post ID : " + postId));

		requirePermission(authorities(authentication), "POST_LIKE");

		// don't trust userId from the request body — derive from the caller's identity
		Long userId = resolveUserId(authentication.getName());

		Optional<PostLike> existingLikeOpt = likeRepository.findByPostAndUserId(post, post.getAuthorId());

		int currentLikes = post.getLikeCount() == null ? 0 : post.getLikeCount();
		if (existingLikeOpt.isPresent()) {
			PostLike existingLike = existingLikeOpt.get();
			likeRepository.delete(existingLike);
			post.setLikeCount(Math.max(0, currentLikes - 1));
		} else {
			PostLike postLike = new PostLike();
			postLike.setPost(post);
			postLike.setUserId(userId);
			likeRepository.save(postLike);
			post.setLikeCount(currentLikes + 1);
		}
		Post updateLike = postRepostiory.save(post);
		// sending the data to kafka producerhndha
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
	public List<Post> findAllByAuthorId(Long authorId) {
		List<Post> posts = postRepostiory.findAllByAuthorId(authorId);

		if (posts == null || posts.isEmpty()) {
			throw new PostNotFoundException("No post present by this userId: " + authorId);
		}

		return posts;
	}

	@Override
	@Transactional
	@Caching(evict = { @CacheEvict(value = "postById", key = "#postId"),
			@CacheEvict(value = "postList", allEntries = true), @CacheEvict(value = "postLikeCount", key = "#postId") })
	public void deleteAllPostByUserId(Long userId) {
		postRepostiory.deleteAllByauthorId(userId);

	}

	@Override
	@Cacheable(value = "postLikeCount", key = "#postId")
	public int totalLikes(Long postId) {
		Post post = postRepostiory.findById(postId)
				.orElseThrow(() -> new PostNotFoundException("post not found by this post ID : " + postId));
		Integer like_count = post.getLikeCount();
		return like_count;
	}

	@Override
	@Cacheable(value = "postById", key = "#postId")
	public PostDto findById(Long postId) {
		Post post = postRepostiory.findById(postId)
				.orElseThrow(() -> new PostNotFoundException("post not found by this post ID : " + postId));

		PostDto dto = new PostDto();
		dto.setPostId(post.getPostId());
		dto.setTitle(post.getTitle());
		dto.setSlug(post.getSlug());
		dto.setContent(post.getContent());
		dto.setExcerpt(post.getExcerpt());
		dto.setStatus(updatStatus(post.getStatus().name()));
		dto.setAuthorId(post.getAuthorId());
		dto.setCategoryId(post.getCategoryId());
		dto.setViewCount(post.getViewCount());
		dto.setLikeCount(post.getLikeCount());
		dto.setPublishedAt(post.getPublishedAt());
		dto.setCreatedAt(post.getCreatedAt());
		return dto;
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