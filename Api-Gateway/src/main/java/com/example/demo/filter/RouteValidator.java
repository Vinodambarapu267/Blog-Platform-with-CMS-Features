package com.example.demo.filter;

import java.util.List;
import java.util.function.Predicate;

import org.springframework.http.HttpMethod;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
@Component
public class RouteValidator {

    private static final AntPathMatcher pathMatcher = new AntPathMatcher();

    private static final List<String> OPEN_GET_ENDPOINTS = List.of(
            "/api/v1/auth/**",
            "/api/v1/search/**",
            "/api/v1/users/createuser",
            "/api/v1/users/*/posts",
            "/api/v1/posts",
            "/api/v1/posts/*",
            "/api/v1/categories/**",
            "/api/v1/tags/**",
            "/api/v1/users/**",
            "/api/v1/comments/posts/*/comments",
            "/api/v1/posts/findpostsbyuserid/*"
    );

    private static final List<String> OPEN_POST_ENDPOINTS = List.of(
            "/api/v1/auth/**",
            "/api/v1/users/createuser"
    );

	public Predicate<ServerHttpRequest> isSecured = request -> {
		String path = request.getURI().getPath();
		HttpMethod method = request.getMethod();

		boolean isOpenGet = HttpMethod.GET.equals(method)
				&& OPEN_GET_ENDPOINTS.stream().anyMatch(pattern -> pathMatcher.match(pattern, path));

		boolean isOpenPost = HttpMethod.POST.equals(method)
				&& OPEN_POST_ENDPOINTS.stream().anyMatch(pattern -> pathMatcher.match(pattern, path));
		return !(isOpenGet || isOpenPost);
	};
}