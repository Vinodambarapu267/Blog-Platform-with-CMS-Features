package com.example.demo.feignclients;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import com.example.demo.dto.UserDto;

@FeignClient(name = "USERS-SERVICE", path = "/api/v1/users")
public interface UserFeignClient {
    @GetMapping("/{userId}")
    UserDto findByUserId(@PathVariable("userId") Long userId);

    @GetMapping("/findbyname/{username}")
    UserDto findByUsername(@PathVariable("username") String username);
}