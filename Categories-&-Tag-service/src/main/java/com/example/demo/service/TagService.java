package com.example.demo.service;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.example.demo.dto.TagResponse;
import com.example.demo.entity.Tags;

@Service
public interface TagService {
	public List<TagResponse> resolveTags(List<String> names);

	public Page<Tags> findAllPopularTags(Pageable pageable);

	public void deleteTag(Long id);

	public List<Tags> findAll();

}
