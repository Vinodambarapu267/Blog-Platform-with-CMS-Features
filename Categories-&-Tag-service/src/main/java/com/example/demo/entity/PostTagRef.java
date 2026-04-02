package com.example.demo.entity;

import com.example.demo.dto.PostTagRefId;

import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Data;


@Entity
@Table(name = "post_tag_refs")
@Data
public class PostTagRef {
    @EmbeddedId
    private PostTagRefId id;
}