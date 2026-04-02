package com.example.demo.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.demo.entity.Tags;

@Service
public interface TagService {
	public Tags createTag(Tags tags);

	public List<Tags> findAllPopularTags();

	public void deleteTag(Long id);

	public List<Tags> findAll();
}
