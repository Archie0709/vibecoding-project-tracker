package com.vibetracker.task;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.vibetracker.auth.AuthInterceptor;
import com.vibetracker.model.User;
import com.vibetracker.task.TaskDtos.TaskRequest;
import com.vibetracker.task.TaskDtos.TaskResponse;

import jakarta.validation.Valid;

/**
 * GET    /api/boards/{id}/tasks           — the board's tasks
 * POST   /api/boards/{id}/tasks           — create a task
 * PUT    /api/boards/{id}/tasks/{taskId}  — update a task (full task in the body)
 * DELETE /api/boards/{id}/tasks/{taskId}  — delete a task
 * POST   /api/boards/{id}/tasks/import    — one-off import of tasks saved in the browser
 */
@RestController
@RequestMapping("/api/boards/{boardId}/tasks")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @GetMapping
    public List<TaskResponse> list(@RequestAttribute(AuthInterceptor.CURRENT_USER) User user,
                                   @PathVariable Long boardId) {
        return taskService.list(user, boardId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TaskResponse create(@RequestAttribute(AuthInterceptor.CURRENT_USER) User user,
                               @PathVariable Long boardId,
                               @Valid @RequestBody TaskRequest request) {
        return taskService.create(user, boardId, request);
    }

    @PutMapping("/{taskId}")
    public TaskResponse update(@RequestAttribute(AuthInterceptor.CURRENT_USER) User user,
                               @PathVariable Long boardId,
                               @PathVariable Long taskId,
                               @Valid @RequestBody TaskRequest request) {
        return taskService.update(user, boardId, taskId, request);
    }

    @DeleteMapping("/{taskId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@RequestAttribute(AuthInterceptor.CURRENT_USER) User user,
                       @PathVariable Long boardId,
                       @PathVariable Long taskId) {
        taskService.delete(user, boardId, taskId);
    }

    @PostMapping("/import")
    @ResponseStatus(HttpStatus.CREATED)
    public List<TaskResponse> importTasks(@RequestAttribute(AuthInterceptor.CURRENT_USER) User user,
                                          @PathVariable Long boardId,
                                          @RequestBody List<@Valid TaskRequest> requests) {
        return taskService.importTasks(user, boardId, requests);
    }
}
