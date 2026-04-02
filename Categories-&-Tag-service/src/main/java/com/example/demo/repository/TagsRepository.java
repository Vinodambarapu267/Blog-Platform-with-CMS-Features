package com.example.demo.repository;

import java.util.Collection;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.example.demo.entity.Tags;

public interface TagsRepository extends JpaRepository<Tags, Long> {
	@Query("SELECT t FROM Tags t ORDER BY t.postCount DESC")
	Page<Tags> findPopularTags(Pageable pageable);
	List<Tags> findByTagNameIn(Collection<String> names);
}
