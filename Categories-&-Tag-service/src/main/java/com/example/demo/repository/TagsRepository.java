package com.example.demo.repository;

import java.util.Collection;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.example.demo.entity.Tag;

public interface TagsRepository extends JpaRepository<Tag, Long> {
	@Query("SELECT t FROM Tag t ORDER BY t.postCount DESC")
	Page<Tag> findPopularTags(Pageable pageable);
	List<Tag> findByTagNameIn(Collection<String> names);
}
