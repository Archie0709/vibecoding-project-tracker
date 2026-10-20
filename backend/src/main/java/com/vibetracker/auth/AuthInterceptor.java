package com.vibetracker.auth;

import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import com.vibetracker.model.User;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * Guards every /api route except login, register, logout and health (NFR-14).
 * A valid session puts the logged-in User on the request as CURRENT_USER;
 * otherwise the request is rejected with 401 before it reaches a controller.
 */
@Component
public class AuthInterceptor implements HandlerInterceptor {

    public static final String CURRENT_USER = "currentUser";

    private final AuthService authService;
    private final SessionCookie sessionCookie;

    public AuthInterceptor(AuthService authService, SessionCookie sessionCookie) {
        this.authService = authService;
        this.sessionCookie = sessionCookie;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) return true;

        Optional<User> user = authService.findUserBySession(sessionCookie.read(request));
        if (user.isPresent()) {
            request.setAttribute(CURRENT_USER, user.get());
            return true;
        }

        response.setStatus(HttpStatus.UNAUTHORIZED.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.getWriter().write("{\"message\":\"Please log in.\"}");
        return false;
    }
}
