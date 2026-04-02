package com.example.demo.repository;


import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.entity.Categories;

public interface CategoryRepository extends JpaRepository<Categories, Long> {
	Page<Categories> findAll(Pageable pageable);

	Optional<Categories> findByCategorySlug(String cSlug);

	boolean existsByParentCategoryId(Long categoryId);

}
