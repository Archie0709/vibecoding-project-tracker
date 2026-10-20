package com.vibetracker.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.vibetracker.model.Board;

public interface BoardRepository extends JpaRepository<Board, Long> {

    /** Boards the user is a member of, oldest first. */
    @Query("select b from Board b join b.members m where m.id = :userId order by b.createdAt asc, b.id asc")
    List<Board> findAllForMember(@Param("userId") Long userId);

    /** A board, but only if the user is a member of it (otherwise empty). */
    @Query("select b from Board b join b.members m where b.id = :boardId and m.id = :userId")
    Optional<Board> findForMember(@Param("boardId") Long boardId, @Param("userId") Long userId);
}
