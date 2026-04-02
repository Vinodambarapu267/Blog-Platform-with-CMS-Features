package com.example.demo.service_impl;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.dto.TagResponse;
import com.example.demo.entity.Tags;
import com.example.demo.repository.TagsRepository;
import com.example.demo.service.TagService;

@Service
@Transactional
public class TagsServiceImpl implements TagService {

	@Autowired
	private TagsRepository repository;

	@Override
	public List<TagResponse> resolveTags(List<String> names) {

		// Step 1 — clean the names
		Set<String> normalized = normalize(names);
		if (normalized.isEmpty())
			return List.of();

		// Step 2 — find tags that already exist in DB
		Map<String, Tags> existingMap = repository.findByTagNameIn(normalized)
				.stream()
				.collect(Collectors.
						toMap(Tags::getTagName, Function.identity()));

		// Step 3 — create only the ones that don't exist
		normalized.stream()
		.filter(name -> !existingMap.containsKey(name))
		.map(name -> repository.save(new Tags(name)))
				.forEach(tag -> existingMap.put(tag.getTagName(), tag));

		// Step 4 — return all tags
		return normalized.stream()
				.map(existingMap::get)
				.map(tag -> new TagResponse(tag.getTagId(), tag.getTagName()))
				.toList();
	}

	@Override
	public Page<Tags> findAllPopularTags(Pageable pageable) {
		Page<Tags> popular = repository.findPopularTags(pageable);
		return popular;
	}

	@Override
	public void deleteTag(Long id) {
		Tags tags = repository.findById(id).orElseThrow(() -> new RuntimeException("Tag not found"));
		repository.delete(tags);
	}

	@Override
	public List<Tags> findAll() {
		List<Tags> allTags = repository.findAll();
		if (allTags.isEmpty()) {
			throw new RuntimeException("No tages found");
		}
		return allTags;
	}

	private Set<String> normalize(List<String> names) {
		if (names == null)
			return Set.of();
		return names.stream().filter(Objects::nonNull)
				.map(s -> s.trim().toLowerCase())
				.filter(s -> !s.isBlank())
				.collect(Collectors.toCollection(LinkedHashSet::new));
	}
}
