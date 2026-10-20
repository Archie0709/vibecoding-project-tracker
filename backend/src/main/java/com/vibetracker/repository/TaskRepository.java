package com.vibetracker.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.vibetracker.model.Task;

public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findAllByBoardIdOrderByIdAsc(Long boardId);

    Optional<Task> findByIdAndBoardId(Long id, Long boardId);

    /** When someone leaves a board, their tasks on it become unassigned (12f). */
    @Modifying
    @Query("update Task t set t.assignee = null where t.board.id = :boardId and t.assignee.id = :userId")
    int unassignAll(@Param("boardId") Long boardId, @Param("userId") Long userId);
}
