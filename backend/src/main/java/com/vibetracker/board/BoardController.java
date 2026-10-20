package com.vibetracker.board;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.vibetracker.auth.AuthInterceptor;
import com.vibetracker.board.BoardDtos.AnchorRequest;
import com.vibetracker.board.BoardDtos.AnchorResponse;
import com.vibetracker.board.BoardDtos.BoardRequest;
import com.vibetracker.board.BoardDtos.BoardResponse;
import com.vibetracker.model.User;

import jakarta.validation.Valid;

/**
 * GET    /api/boards                       — my boards
 * POST   /api/boards                       — create a board
 * PATCH  /api/boards/{id}                  — rename
 * DELETE /api/boards/{id}                  — delete (with its tasks and links)
 * GET    /api/boards/{id}/anchors          — the board's deliverable links
 * PUT    /api/boards/{id}/anchors/{slot}   — set or clear one link
 */
@RestController
@RequestMapping("/api/boards")
public class BoardController {

    private final BoardService boardService;

    public BoardController(BoardService boardService) {
        this.boardService = boardService;
    }

    @GetMapping
    public List<BoardResponse> list(@RequestAttribute(AuthInterceptor.CURRENT_USER) User user) {
        return boardService.listBoards(user);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public BoardResponse create(@RequestAttribute(AuthInterceptor.CURRENT_USER) User user,
                                @Valid @RequestBody BoardRequest request) {
        return boardService.createBoard(user, request.name());
    }

    @PatchMapping("/{boardId}")
    public BoardResponse rename(@RequestAttribute(AuthInterceptor.CURRENT_USER) User user,
                                @PathVariable Long boardId,
                                @Valid @RequestBody BoardRequest request) {
        return boardService.renameBoard(user, boardId, request.name());
    }

    @DeleteMapping("/{boardId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@RequestAttribute(AuthInterceptor.CURRENT_USER) User user,
                       @PathVariable Long boardId) {
        boardService.deleteBoard(user, boardId);
    }

    @GetMapping("/{boardId}/anchors")
    public List<AnchorResponse> anchors(@RequestAttribute(AuthInterceptor.CURRENT_USER) User user,
                                        @PathVariable Long boardId) {
        return boardService.listAnchors(user, boardId);
    }

    @PutMapping("/{boardId}/anchors/{slot}")
    public AnchorResponse updateAnchor(@RequestAttribute(AuthInterceptor.CURRENT_USER) User user,
                                       @PathVariable Long boardId,
                                       @PathVariable String slot,
                                       @Valid @RequestBody AnchorRequest request) {
        return boardService.updateAnchor(user, boardId, slot, request.url());
    }
}
