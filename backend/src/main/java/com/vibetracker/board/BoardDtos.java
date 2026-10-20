package com.vibetracker.board;

import java.time.Instant;

import com.vibetracker.model.Anchor;
import com.vibetracker.model.Board;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Request and response shapes for /api/boards. */
public final class BoardDtos {

    private BoardDtos() {
    }

    public record BoardRequest(
            @NotBlank(message = "Give the board a name.")
            @Size(max = 100, message = "Board names must be 100 characters or fewer.")
            String name) {
    }

    public record BoardResponse(Long id, String name, Long ownerId, int memberCount, Instant createdAt) {

        /** Must be called inside a transaction (reads the lazy member list). */
        public static BoardResponse from(Board board) {
            return new BoardResponse(
                    board.getId(),
                    board.getName(),
                    board.getOwner().getId(),
                    board.getMembers().size(),
                    board.getCreatedAt());
        }
    }

    public record AnchorRequest(
            @Size(max = 2048, message = "Links must be 2048 characters or fewer.")
            String url) {
    }

    /** `id` is the slot name ('presentation', 'demo'…), matching the frontend's Anchor shape (PRD §5). */
    public record AnchorResponse(String id, String label, String url) {

        public static AnchorResponse from(Anchor anchor) {
            return new AnchorResponse(anchor.getSlot(), anchor.getLabel(), anchor.getUrl());
        }
    }
}
