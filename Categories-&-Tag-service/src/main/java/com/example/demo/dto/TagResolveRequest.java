package com.example.demo.dto;

import java.util.List;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record TagResolveRequest(
	    @NotNull
	    @Size(min = 1, max = 50, message = "Tag list must have between 1 and 50 tags")
	    List<String> names
	) {}