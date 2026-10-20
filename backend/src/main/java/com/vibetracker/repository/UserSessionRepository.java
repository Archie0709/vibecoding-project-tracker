package com.vibetracker.repository;

import java.time.Instant;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.vibetracker.model.UserSession;

public interface UserSessionRepository extends JpaRepository<UserSession, String> {

    /** Loads the session and its user in one query (the user is needed on every request). */
    @Query("select s from UserSession s join fetch s.user where s.token = :token")
    Optional<UserSession> findWithUser(@Param("token") String token);

    @Modifying
    @Query("delete from UserSession s where s.expiresAt < :now")
    int deleteExpired(@Param("now") Instant now);
}
