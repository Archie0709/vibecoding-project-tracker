package com.vibetracker.board;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.Comparator;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.vibetracker.auth.AuthDtos.UserResponse;
import com.vibetracker.board.BoardDtos.AnchorResponse;
import com.vibetracker.board.BoardDtos.BoardResponse;
import com.vibetracker.common.ApiException;
import com.vibetracker.model.Anchor;
import com.vibetracker.model.Board;
import com.vibetracker.model.User;
import com.vibetracker.repository.AnchorRepository;
import com.vibetracker.repository.BoardRepository;
import com.vibetracker.repository.UserRepository;

/**
 * 12d boards (FR-24, FR-27) and 12e members (FR-25, FR-26).
 * Every query checks membership: a board you're not a member of is reported as
 * "not found" rather than "forbidden", so board IDs can't be probed (NFR-14).
 * All members are equal admins, so any member can rename or delete a board.
 */
@Service
public class BoardService {

    /** The four deliverable slots every board gets (PRD §5 Anchor). Order = display order. */
    private static final List<Map.Entry<String, String>> SLOTS = List.of(
            Map.entry("presentation", "Presentation"),
            Map.entry("demo", "Demo"),
            Map.entry("report", "Report"),
            Map.entry("documentation", "Documentation"));

    private final BoardRepository boards;
    private final AnchorRepository anchors;
    private final UserRepository users;

    public BoardService(BoardRepository boards, AnchorRepository anchors, UserRepository users) {
        this.boards = boards;
        this.anchors = anchors;
        this.users = users;
    }

    @Transactional(readOnly = true)
    public List<BoardResponse> listBoards(User user) {
        return boards.findAllForMember(user.getId()).stream().map(BoardResponse::from).toList();
    }

    @Transactional
    public BoardResponse createBoard(User user, String name) {
        User owner = users.getReferenceById(user.getId());
        Board board = new Board();
        board.setName(name.trim());
        board.setOwner(owner);
        board.getMembers().add(owner);
        boards.save(board);
        for (Map.Entry<String, String> slot : SLOTS) {
            anchors.save(new Anchor(board, slot.getKey(), slot.getValue()));
        }
        return BoardResponse.from(board);
    }

    @Transactional
    public BoardResponse renameBoard(User user, Long boardId, String name) {
        Board board = requireBoard(user, boardId);
        board.setName(name.trim());
        return BoardResponse.from(board);
    }

    /** Deletes the board; its tasks, anchors and memberships go with it (ON DELETE CASCADE). */
    @Transactional
    public void deleteBoard(User user, Long boardId) {
        Board board = requireBoard(user, boardId);
        boards.delete(board);
    }

    @Transactional(readOnly = true)
    public List<AnchorResponse> listAnchors(User user, Long boardId) {
        requireBoard(user, boardId);
        return anchors.findAllByBoardIdOrderByIdAsc(boardId).stream().map(AnchorResponse::from).toList();
    }

    @Transactional
    public AnchorResponse updateAnchor(User user, Long boardId, String slot, String url) {
        requireBoard(user, boardId);
        Anchor anchor = anchors.findByBoardIdAndSlot(boardId, slot)
                .orElseThrow(() -> ApiException.notFound("No deliverable slot called '" + slot + "'."));
        anchor.setUrl(cleanUrl(url));
        return AnchorResponse.from(anchor);
    }

    // ---- Members (12e) ------------------------------------------------------

    @Transactional(readOnly = true)
    public List<UserResponse> listMembers(User user, Long boardId) {
        return membersOf(requireBoard(user, boardId));
    }

    @Transactional
    public List<UserResponse> addMember(User user, Long boardId, Long newMemberId) {
        Board board = requireBoard(user, boardId);
        if (board.hasMember(newMemberId)) {
            throw ApiException.conflict("They're already a member of this board.");
        }
        User newMember = users.findById(newMemberId)
                .orElseThrow(() -> ApiException.notFound("User not found."));
        board.getMembers().add(newMember);
        return membersOf(board);
    }

    /** Any member can remove any member (all are admins), including themselves (= leave). */
    @Transactional
    public List<UserResponse> removeMember(User user, Long boardId, Long memberId) {
        Board board = requireBoard(user, boardId);
        if (!board.hasMember(memberId)) {
            throw ApiException.notFound("They aren't a member of this board.");
        }
        if (board.getMembers().size() == 1) {
            throw ApiException.badRequest("A board needs at least one member. Delete the board instead.");
        }
        board.getMembers().removeIf(member -> member.getId().equals(memberId));
        return membersOf(board);
    }

    private static List<UserResponse> membersOf(Board board) {
        return board.getMembers().stream()
                .sorted(Comparator.comparing(User::getName, String.CASE_INSENSITIVE_ORDER))
                .map(UserResponse::from)
                .toList();
    }

    /** The board if the user is a member of it; 404 otherwise. Used by other services too. */
    @Transactional(readOnly = true)
    public Board requireBoard(User user, Long boardId) {
        return boards.findForMember(boardId, user.getId())
                .orElseThrow(() -> ApiException.notFound("Board not found."));
    }

    /** DR-05: links must be http(s) — never javascript: or other schemes. Empty = remove the link. */
    static String cleanUrl(String url) {
        if (url == null || url.isBlank()) return null;
        String trimmed = url.trim();
        try {
            URI uri = new URI(trimmed);
            String scheme = uri.getScheme();
            if (scheme == null || !(scheme.equalsIgnoreCase("http") || scheme.equalsIgnoreCase("https"))
                    || uri.getHost() == null) {
                throw ApiException.badRequest("Links must start with http:// or https://");
            }
            return trimmed;
        } catch (URISyntaxException e) {
            throw ApiException.badRequest("That doesn't look like a valid link.");
        }
    }
}
