package com.vibetracker.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.vibetracker.model.Board;

public interface BoardRepository extends JpaRepository<Board, Long> {

    /** Boards the user is a member of, oldest first. */
    @Query("select b from Board b join b.members m where m.id = :userId order by b.createdAt asc")
    List<Board> findAllForMember(@Param("userId") Long userId);
}
