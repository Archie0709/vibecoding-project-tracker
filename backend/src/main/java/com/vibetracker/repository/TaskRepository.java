package com.vibetracker.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.vibetracker.model.Task;

public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findAllByBoardIdOrderByIdAsc(Long boardId);
}
