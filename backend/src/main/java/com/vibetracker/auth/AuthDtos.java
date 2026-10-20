package com.vibetracker.auth;

import com.vibetracker.model.User;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/** Request and response shapes for /api/auth. */
public final class AuthDtos {

    private AuthDtos() {
    }

    /**
     * Password rules follow NIST SP 800-63B: a minimum length (8) and no forced
     * character-type rules. The 64-character maximum keeps it within BCrypt's 72-byte limit.
     */
    public record RegisterRequest(
            @NotBlank(message = "Enter your name.")
            @Size(max = 100, message = "Name must be 100 characters or fewer.")
            String name,

            @NotBlank(message = "Enter your email address.")
            @Email(message = "Enter a valid email address, like name@example.com.")
            @Size(max = 255, message = "Email must be 255 characters or fewer.")
            String email,

            @Pattern(regexp = "^$|^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9])){0,38}$",
                    message = "GitHub usernames use letters, numbers and single hyphens (max 39).")
            String githubHandle,

            @NotBlank(message = "Choose a password.")
            @Size(min = 8, max = 64, message = "Password must be 8 to 64 characters.")
            String password) {
    }

    public record LoginRequest(
            @NotBlank(message = "Enter your email address.")
            String email,

            @NotBlank(message = "Enter your password.")
            String password) {
    }

    /** What the API returns about a user. Never includes the password hash. */
    public record UserResponse(Long id, String name, String email, String githubHandle) {

        public static UserResponse from(User user) {
            return new UserResponse(user.getId(), user.getName(), user.getEmail(), user.getGithubHandle());
        }
    }
}
