package com.example.demo.dto;

import java.io.Serializable;

import jakarta.persistence.Embeddable;
import lombok.Data;

@Embeddable
@Data
public class PostTagRefId implements Serializable {
    private Long postId;
    private Long tagId;
}
