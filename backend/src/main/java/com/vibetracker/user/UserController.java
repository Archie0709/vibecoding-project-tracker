package com.vibetracker.user;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.vibetracker.auth.AuthDtos.UserResponse;
import com.vibetracker.repository.UserRepository;

/**
 * GET /api/users — everyone with an account on this instance.
 * The tool is self-hosted by one small, self-managed team, so every user can see
 * every other user when adding board members (developer guide; PRD NFR-18).
 * Only logged-in users can call this (AuthInterceptor).
 */
@RestController
public class UserController {

    private final UserRepository users;

    public UserController(UserRepository users) {
        this.users = users;
    }

    @GetMapping("/api/users")
    public List<UserResponse> list() {
        return users.findAllByOrderByNameAsc().stream().map(UserResponse::from).toList();
    }
}
