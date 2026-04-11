package com.example.demo.controller;

import java.net.HttpURLConnection;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.CategoryDto;
import com.example.demo.entity.Categories;
import com.example.demo.service.CategoryService;
import com.example.demo.utility.ResponseMessage;
import com.example.demo.utility.ResponseStatus;

@RestController
@RequestMapping("/api/v1/categories")
public class CategoryController {
	@Autowired
	private CategoryService categoryService;

	@PostMapping("/createcategory")
	public ResponseEntity<?> createCategory(@RequestBody CategoryDto categories) {
		Categories category = categoryService.createCategory(categories);
		if (category == null) {
			return ResponseEntity.ok(new ResponseMessage(HttpURLConnection.HTTP_NOT_FOUND,
					ResponseStatus.FAILURE.name(), "Category creating failed"));
		}
		return ResponseEntity.ok(new ResponseMessage(HttpURLConnection.HTTP_CREATED, ResponseStatus.SUCCESS.name(),
				"category Created successfully", category));
	}

	@PutMapping("/updateCategory/{categoryId}")
	public ResponseEntity<?> updateById(@PathVariable("categoryId") Long id, @RequestBody CategoryDto categoryDto) {
		Categories updateCategories = categoryService.updateCategories(id, categoryDto);
		if (updateCategories == null) {
			return ResponseEntity.ok(new ResponseMessage(HttpURLConnection.HTTP_NOT_FOUND,
					ResponseStatus.FAILURE.name(), "Category updating failed"));
		}
		return ResponseEntity.ok(new ResponseMessage(HttpURLConnection.HTTP_CREATED, ResponseStatus.SUCCESS.name(),
				"category updated successfully", updateCategories));
	}

	@GetMapping
	public ResponseEntity<?> getAllCategories(@RequestParam int page, @RequestParam String soryBy) {
		Page<Categories> allCategories = categoryService.getAllCategories(page, soryBy);
		if (allCategories == null) {
			return ResponseEntity.ok(new ResponseMessage(HttpURLConnection.HTTP_NOT_FOUND,
					ResponseStatus.FAILURE.name(), "Category Retriving failed"));
		}
		return ResponseEntity.ok(allCategories);
	}

	@DeleteMapping("/deletebyid/{id}")
	public ResponseEntity<?> deleteByid(@PathVariable Long id) {
		categoryService.deleteCatory(id);
		return ResponseEntity.ok("deleted successfully : " + id);
	}

	@GetMapping("/{category-id}/validate")
	public String validateCategory(@PathVariable("category-id") Long id) {
		return categoryService.isExistCatgory(id);
	}
}
