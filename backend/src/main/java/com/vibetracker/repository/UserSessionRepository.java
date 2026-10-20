package com.vibetracker.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.vibetracker.model.UserSession;

public interface UserSessionRepository extends JpaRepository<UserSession, String> {
}
