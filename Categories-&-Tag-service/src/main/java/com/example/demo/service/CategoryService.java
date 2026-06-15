package com.example.demo.service;

import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;

import com.example.demo.dto.CategoryDto;
import com.example.demo.entity.Category;

@Service
public interface CategoryService {
	public Category createCategory(CategoryDto dto);

	public Category updateCategories(Long cId, CategoryDto category);

	public void deleteCatory(Long cId_);

	public String isExistCatgory(Long cId);

	public Page<Category> getAllCategories(int page, String sortBy);

}
