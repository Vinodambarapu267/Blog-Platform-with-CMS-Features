package com.example.demo.repository;


import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.entity.Category;

public interface CategoryRepository extends JpaRepository<Category, Long> {
	Page<Category> findAll(Pageable pageable);

	Optional<Category> findByCategorySlug(String cSlug);

	boolean existsByParentCategoryId(Long categoryId);

}
