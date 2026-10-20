package com.vibetracker.auth;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.vibetracker.auth.AuthDtos.LoginRequest;
import com.vibetracker.auth.AuthDtos.RegisterRequest;
import com.vibetracker.auth.AuthDtos.UserResponse;
import com.vibetracker.model.User;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;

/**
 * POST /api/auth/register  — create an account and log in
 * POST /api/auth/login     — log in
 * POST /api/auth/logout    — log out (ends the server-side session)
 * GET  /api/auth/me        — who am I? (401 if not logged in)
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final SessionCookie sessionCookie;

    public AuthController(AuthService authService, SessionCookie sessionCookie) {
        this.authService = authService;
        this.sessionCookie = sessionCookie;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponse register(@Valid @RequestBody RegisterRequest request, HttpServletResponse response) {
        User user = authService.register(request);
        logIn(user, response);
        return UserResponse.from(user);
    }

    @PostMapping("/login")
    public UserResponse login(@Valid @RequestBody LoginRequest request, HttpServletResponse response) {
        User user = authService.checkCredentials(request);
        logIn(user, response);
        return UserResponse.from(user);
    }

    @PostMapping("/logout")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void logout(HttpServletRequest request, HttpServletResponse response) {
        authService.endSession(sessionCookie.read(request));
        sessionCookie.clear(response);
    }

    @GetMapping("/me")
    public UserResponse me(@RequestAttribute(AuthInterceptor.CURRENT_USER) User user) {
        return UserResponse.from(user);
    }

    private void logIn(User user, HttpServletResponse response) {
        String token = authService.startSession(user);
        sessionCookie.set(response, token, authService.getSessionLength());
    }
}
