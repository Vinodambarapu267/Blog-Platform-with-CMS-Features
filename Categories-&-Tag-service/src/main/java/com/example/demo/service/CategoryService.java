package com.example.demo.service;

import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;

import com.example.demo.dto.CategoryDto;
import com.example.demo.entity.Categories;
@Service
public interface CategoryService {
	public Categories createCategory(CategoryDto dto);

	public Categories updateCategories(Long cId, CategoryDto category);

	public void deleteCatory(Long cId);

	public String isExistCatgory(Long cId);

	public Page<Categories> getAllCategories(int page, String sortBy);

	

}
