package com.vibetracker.task;

import java.time.Instant;
import java.util.List;
import java.util.Objects;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.vibetracker.board.BoardService;
import com.vibetracker.common.ApiException;
import com.vibetracker.model.Board;
import com.vibetracker.model.Task;
import com.vibetracker.model.User;
import com.vibetracker.repository.TaskRepository;
import com.vibetracker.repository.UserRepository;
import com.vibetracker.task.TaskDtos.TaskRequest;
import com.vibetracker.task.TaskDtos.TaskResponse;

/**
 * 12f: tasks stored in MariaDB, shared by everyone on the board.
 * Every call checks the user is a member of the board (via BoardService.requireBoard),
 * and that a task really belongs to that board, so IDs can't be used across boards.
 */
@Service
public class TaskService {

    private final TaskRepository tasks;
    private final UserRepository users;
    private final BoardService boardService;

    public TaskService(TaskRepository tasks, UserRepository users, BoardService boardService) {
        this.tasks = tasks;
        this.users = users;
        this.boardService = boardService;
    }

    @Transactional(readOnly = true)
    public List<TaskResponse> list(User user, Long boardId) {
        boardService.requireBoard(user, boardId);
        return tasks.findAllByBoardIdOrderByIdAsc(boardId).stream().map(TaskResponse::from).toList();
    }

    @Transactional
    public TaskResponse create(User user, Long boardId, TaskRequest request) {
        Board board = boardService.requireBoard(user, boardId);
        return TaskResponse.from(createIn(board, request));
    }

    @Transactional
    public TaskResponse update(User user, Long boardId, Long taskId, TaskRequest request) {
        Board board = boardService.requireBoard(user, boardId);
        Task task = tasks.findByIdAndBoardId(taskId, boardId)
                .orElseThrow(() -> ApiException.notFound("Task not found."));
        apply(task, board, request);
        return TaskResponse.from(task);
    }

    @Transactional
    public void delete(User user, Long boardId, Long taskId) {
        boardService.requireBoard(user, boardId);
        Task task = tasks.findByIdAndBoardId(taskId, boardId)
                .orElseThrow(() -> ApiException.notFound("Task not found."));
        tasks.delete(task);
    }

    /** One-off import of tasks that were saved in the browser before 12f. All or nothing. */
    @Transactional
    public List<TaskResponse> importTasks(User user, Long boardId, List<TaskRequest> requests) {
        if (requests.size() > 500) {
            throw ApiException.badRequest("Import at most 500 tasks at a time.");
        }
        Board board = boardService.requireBoard(user, boardId);
        return requests.stream().map(request -> TaskResponse.from(createIn(board, request))).toList();
    }

    private Task createIn(Board board, TaskRequest request) {
        Task task = new Task();
        task.setBoard(board);
        if (request.createdDate() != null) task.setCreatedDate(request.createdDate());
        apply(task, board, request);
        return tasks.save(task);
    }

    private void apply(Task task, Board board, TaskRequest request) {
        String context = blankToNull(request.context());
        String contextTool = blankToNull(request.contextTool());

        // FR-16: the server stamps the context time, only when context or tool actually change.
        boolean contextChanged = !Objects.equals(context, task.getContext())
                || !Objects.equals(contextTool, task.getContextTool());
        if (contextChanged) {
            task.setContextUpdatedAt(context == null && contextTool == null ? null : Instant.now());
        }

        task.setTitle(request.title().trim());
        task.setDescription(blankToNull(request.description()));
        task.setType(request.type());
        task.setStatus(request.status());
        task.setDueDate(request.dueDate());
        task.setContext(context);
        task.setContextTool(contextTool);

        if (request.assigneeId() == null) {
            task.setAssignee(null);
        } else if (board.hasMember(request.assigneeId())) {
            task.setAssignee(users.getReferenceById(request.assigneeId()));
        } else {
            throw ApiException.badRequest("Tasks can only be assigned to members of this board.");
        }
    }

    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value;
    }
}
