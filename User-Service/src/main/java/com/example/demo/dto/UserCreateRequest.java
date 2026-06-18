package com.example.demo.dto;

import java.util.Map;

import com.example.demo.utility.UserRole;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserCreateRequest {
    private String username;
    private String displayName;
    private String bio;
    private Map<String, String> socialLinks;
    private String email;
    private String password;
    private UserRole role;
}