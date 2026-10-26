package com.vibetracker.auth;

import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.HexFormat;
import java.util.Locale;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.vibetracker.auth.AuthDtos.LoginRequest;
import com.vibetracker.auth.AuthDtos.RegisterRequest;
import com.vibetracker.board.BoardService;
import com.vibetracker.common.ApiException;
import com.vibetracker.model.User;
import com.vibetracker.model.UserSession;
import com.vibetracker.repository.UserRepository;
import com.vibetracker.repository.UserSessionRepository;

/**
 * 12c accounts (FR-22, FR-23, NFR-13, NFR-14).
 * - Passwords are hashed with Spring Security's BCryptPasswordEncoder (salted, adaptive).
 * - A login creates a random 256-bit session token stored server-side, so logging out
 *   really ends the session (OWASP Session Management guidance).
 */
@Service
public class AuthService {

    /** Same message for "no such email" and "wrong password", so accounts can't be discovered. */
    private static final String BAD_LOGIN = "Email or password is incorrect.";

    private final UserRepository users;
    private final UserSessionRepository sessions;
    private final BoardService boardService;
    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    private final SecureRandom random = new SecureRandom();
    private final Duration sessionLength;
    /** Used to spend the same time checking a password when the email doesn't exist (timing attacks). */
    private final String dummyHash;

    public AuthService(UserRepository users,
                       UserSessionRepository sessions,
                       BoardService boardService,
                       @Value("${app.auth.session-days:7}") long sessionDays) {
        this.users = users;
        this.sessions = sessions;
        this.boardService = boardService;
        this.sessionLength = Duration.ofDays(sessionDays);
        this.dummyHash = passwordEncoder.encode("not-a-real-password");
    }

    public Duration getSessionLength() {
        return sessionLength;
    }

    @Transactional
    public User register(RegisterRequest request) {
        String email = normaliseEmail(request.email());
        if (users.existsByEmailIgnoreCase(email)) {
            throw ApiException.conflict("An account with this email already exists. Try logging in instead.");
        }
        User user = new User();
        user.setName(request.name().trim());
        user.setEmail(email);
        String github = request.githubHandle() == null ? "" : request.githubHandle().trim();
        user.setGithubHandle(github.isEmpty() ? null : github);
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        User saved = users.save(user);

        // 12d: everyone starts with a board, so the app is never empty after signing up.
        String firstName = saved.getName().split("\\s+")[0];
        boardService.createBoard(saved, firstName + "'s board");
        return saved;
    }

    @Transactional(readOnly = true)
    public User checkCredentials(LoginRequest request) {
        Optional<User> found = users.findByEmailIgnoreCase(normaliseEmail(request.email()));
        if (found.isEmpty()) {
            passwordEncoder.matches(request.password(), dummyHash);
            throw ApiException.unauthorized(BAD_LOGIN);
        }
        User user = found.get();
        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw ApiException.unauthorized(BAD_LOGIN);
        }
        return user;
    }

    @Transactional(readOnly = true)
    public Optional<User> findByEmail(String email) {
        return users.findByEmailIgnoreCase(normaliseEmail(email));
    }

    /** Creates a new session for the user and returns its token. */
    @Transactional
    public String startSession(User user) {
        sessions.deleteExpired(Instant.now());
        byte[] bytes = new byte[32];
        random.nextBytes(bytes);
        String token = HexFormat.of().formatHex(bytes);
        sessions.save(new UserSession(token, user, Instant.now().plus(sessionLength)));
        return token;
    }

    @Transactional
    public void endSession(String token) {
        if (token != null && !token.isBlank()) {
            sessions.deleteById(token);
        }
    }

    /** The user for a valid, unexpired session token, if any. */
    @Transactional(readOnly = true)
    public Optional<User> findUserBySession(String token) {
        if (token == null || token.isBlank()) return Optional.empty();
        return sessions.findWithUser(token)
                .filter(session -> !session.isExpired())
                .map(UserSession::getUser);
    }

    private static String normaliseEmail(String email) {
        return email == null ? "" : email.trim().toLowerCase(Locale.ROOT);
    }
}
