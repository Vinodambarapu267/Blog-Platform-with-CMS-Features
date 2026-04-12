package com.example.demo.controller;

import java.net.HttpURLConnection;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.TagResolveRequest;
import com.example.demo.dto.TagResponse;
import com.example.demo.entity.Tags;
import com.example.demo.service.TagService;
import com.example.demo.utility.ResponseMessage;
import com.example.demo.utility.ResponseStatus;

import io.github.resilience4j.ratelimiter.annotation.RateLimiter;

@RestController
@RequestMapping("/api/v1/tags")
public class TagsController {
	@Autowired
	private TagService tagService;

	@PostMapping("/autocreate")
	public ResponseEntity<?> createTags(@RequestBody TagResolveRequest request) {
		List<TagResponse> tags = tagService.resolveTags(request.names());
		if (tags.isEmpty()) {
			return ResponseEntity.ok(new ResponseMessage(HttpURLConnection.HTTP_NOT_FOUND,
					ResponseStatus.FAILURE.name(), "tag creating failed"));
		}
		return ResponseEntity.ok(new ResponseMessage(HttpURLConnection.HTTP_CREATED, ResponseStatus.SUCCESS.name(),
				"Tag Created successfully", tags));
	}

	@DeleteMapping("/delete/{tag-id}")
	public String deleteTag(@PathVariable("tag-id") Long id) {
		tagService.deleteTag(id);
		return "deleted successfully";
	}

	@GetMapping
	@RateLimiter(name = "myRateLimiter", fallbackMethod = "tagsFallback")
	public ResponseEntity<?> findAll() {
		List<Tags> all = tagService.findAll();

		if (all.isEmpty()) {
			return ResponseEntity.ok(new ResponseMessage(HttpURLConnection.HTTP_NOT_FOUND,
					ResponseStatus.FAILURE.name(), "Tags retriving failed.."));
		}
		return ResponseEntity.ok(new ResponseMessage(HttpURLConnection.HTTP_CREATED, ResponseStatus.SUCCESS.name(),
				"All Tags Retrived successfully", all));
	}

	@GetMapping("/popular")
	@RateLimiter(name = "myRateLimiter", fallbackMethod = "tagsFallback")
	public ResponseEntity<Page<Tags>> getPopularTags(@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "20") int size) {

		Pageable pageable = PageRequest.of(page, size);
		Page<Tags> popularTags = tagService.findAllPopularTags(pageable);
		return ResponseEntity.ok(popularTags);
	}
	public ResponseEntity<?> tagsFallback(Throwable t) {
		return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body("Too many requests - please try again later.");
	}

}
