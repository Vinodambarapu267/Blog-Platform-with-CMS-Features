package com.example.demo.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.example.demo.dto.CategoryDto;
import com.example.demo.entity.Category;
import com.example.demo.exception.CategoryNotFoundException;
import com.example.demo.exception.SlugAlreadyExistException;
import com.example.demo.repository.CategoryRepository;

import jakarta.transaction.Transactional;

@Service

public class CategoryServiceImpl implements CategoryService {

	@Autowired
	private CategoryRepository categoryRepository;

	@Override

	public Category createCategory(CategoryDto dto) {
		if (categoryRepository.findByCategorySlug(dto.getCategorySlug()).isPresent()) {
			throw new SlugAlreadyExistException("Slug already exists");
		}

		Category category = new Category();
		category.setCategoryName(dto.getCategoryName());
		category.setCategorySlug(dto.getCategorySlug());
		category.setDescription(dto.getDescription());

		if (dto.getParentId() != null) {
			Category parentCategory = categoryRepository.findById(dto.getParentId())
					.orElseThrow(() -> new CategoryNotFoundException("Parent category not found"));
			category.setParent(parentCategory);
		} else {
			category.setParent(null);
		}

		return categoryRepository.save(category);
	}

	@CachePut(value = "category", key = "#cId")
	@Override
	public Category updateCategories(Long cId, CategoryDto category) {
		Category existedCategory = categoryRepository.findById(cId)
				.orElseThrow(() -> new CategoryNotFoundException("Category not found exception"));
		if (categoryRepository.findByCategorySlug(category.getCategorySlug()).isPresent()) {
			throw new SlugAlreadyExistException("Slug already Existed :" + category.getCategorySlug());
		}
		if (category.getParentId() != null) {
			Category parentCategory = categoryRepository.findById(category.getParentId())
					.orElseThrow(() -> new CategoryNotFoundException("Parent category not found"));
			existedCategory.setParent(parentCategory);
		} else {
			existedCategory.setParent(null);
		}
		existedCategory.setCategoryName(category.getCategoryName());
		existedCategory.setCategorySlug(category.getCategorySlug());
		existedCategory.setDescription(category.getDescription());
		return categoryRepository.save(existedCategory);

	}

	@Override
	@CacheEvict(value = "deleteCategory", key = "#cId")
	public void deleteCatory(Long cId) {
		Category category = categoryRepository.findById(cId)
				.orElseThrow(() -> new CategoryNotFoundException("Category not Found"));
		categoryRepository.delete(category);
	}

	@Cacheable(value = "category", key = "#cId")
	@Override
	public String isExistCatgory(Long cId) {
		boolean existsById = categoryRepository.existsById(cId);
		return existsById ? "valid Category " : "not valid category";
	}

	@Override
	@Cacheable(value = "allCategories", key = "'all'")
	@Transactional()
	public Page<Category> getAllCategories(int page, String sortBy) {
		Pageable pageable = PageRequest.of(page, 10, Sort.by(sortBy).ascending()); // ← page=1, size=10
		Page<Category> categories = categoryRepository.findAll(pageable);
		return categories;
	}
}
