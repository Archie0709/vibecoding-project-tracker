package com.vibetracker.board;

import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.vibetracker.auth.AuthDtos.UserResponse;
import com.vibetracker.auth.AuthInterceptor;
import com.vibetracker.model.User;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

/**
 * 12e board members (FR-25, FR-26). Every member is an equal admin.
 * GET    /api/boards/{id}/members           — the board's members
 * POST   /api/boards/{id}/members           — add a user  { "userId": 3 }
 * DELETE /api/boards/{id}/members/{userId}  — remove a member (or leave, if it's you)
 */
@RestController
@RequestMapping("/api/boards/{boardId}/members")
public class MemberController {

    public record AddMemberRequest(@NotNull(message = "Choose someone to add.") Long userId) {
    }

    private final BoardService boardService;

    public MemberController(BoardService boardService) {
        this.boardService = boardService;
    }

    @GetMapping
    public List<UserResponse> list(@RequestAttribute(AuthInterceptor.CURRENT_USER) User user,
                                   @PathVariable Long boardId) {
        return boardService.listMembers(user, boardId);
    }

    @PostMapping
    public List<UserResponse> add(@RequestAttribute(AuthInterceptor.CURRENT_USER) User user,
                                  @PathVariable Long boardId,
                                  @Valid @RequestBody AddMemberRequest request) {
        return boardService.addMember(user, boardId, request.userId());
    }

    @DeleteMapping("/{userId}")
    public List<UserResponse> remove(@RequestAttribute(AuthInterceptor.CURRENT_USER) User user,
                                     @PathVariable Long boardId,
                                     @PathVariable Long userId) {
        return boardService.removeMember(user, boardId, userId);
    }
}
