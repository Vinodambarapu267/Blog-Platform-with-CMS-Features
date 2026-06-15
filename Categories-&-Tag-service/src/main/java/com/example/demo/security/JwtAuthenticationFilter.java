package com.example.demo.security;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;



import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    public JwtAuthenticationFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                     @NonNull HttpServletResponse response,
                                     @NonNull FilterChain filterChain) throws IOException, ServletException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);

            try {
                if (jwtUtil.isTokenValid(token)
                        && SecurityContextHolder.getContext().getAuthentication() == null) {

                    String username = jwtUtil.extractUsername(token);
                    String roleStr = jwtUtil.extractRole(token);

                    if (username != null && roleStr != null) {
                        Role role = Role.valueOf(roleStr);

                        List<GrantedAuthority> authorities = new ArrayList<>();
                        authorities.add(new SimpleGrantedAuthority("ROLE_" + role.name()));
                        role.getPermissions().forEach(p ->
                                authorities.add(new SimpleGrantedAuthority(p.name())));

                        var authToken = new UsernamePasswordAuthenticationToken(
                                username, null, authorities);
                        authToken.setDetails(
                                new WebAuthenticationDetailsSource().buildDetails(request));
                        SecurityContextHolder.getContext().setAuthentication(authToken);
                    }
                }
            } catch (Exception ex) {
                logger.warn("JWT processing failed: " + ex.getClass().getSimpleName()
                        + " - " + ex.getMessage());
                System.out.println("invalid access...!");
                SecurityContextHolder.clearContext();
                throw new RuntimeException("un authorized access to application");
              
            }
        }

        filterChain.doFilter(request, response);
    }
}