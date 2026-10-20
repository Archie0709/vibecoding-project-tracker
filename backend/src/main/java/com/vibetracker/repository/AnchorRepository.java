package com.vibetracker.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.vibetracker.model.Anchor;

public interface AnchorRepository extends JpaRepository<Anchor, Long> {

    List<Anchor> findAllByBoardIdOrderByIdAsc(Long boardId);

    Optional<Anchor> findByBoardIdAndSlot(Long boardId, String slot);
}
