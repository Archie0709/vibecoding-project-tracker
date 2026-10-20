package com.vibetracker.task;

import java.time.Instant;
import java.time.LocalDate;

import com.vibetracker.model.Task;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/** Request and response shapes for /api/boards/{id}/tasks (PRD §5 Task, DR-01 / DR-02). */
public final class TaskDtos {

    private TaskDtos() {
    }

    /**
     * The full task as sent by the frontend (create and update both send every field).
     * contextUpdatedAt is NOT accepted from the client — the server sets it (FR-16).
     * createdDate is only used when importing older tasks.
     */
    public record TaskRequest(
            @NotBlank(message = "Give the task a title.")
            @Size(max = 120, message = "Titles must be 120 characters or fewer.")
            String title,

            @Size(max = 20000, message = "Descriptions must be 20,000 characters or fewer.")
            String description,

            @NotNull(message = "Choose a type.")
            @Pattern(regexp = "feature|bug", message = "Type must be feature or bug.")
            String type,

            @NotNull(message = "Choose a status.")
            @Pattern(regexp = "todo|in-progress|review|done", message = "Status must be To Do, In Progress, Review or Done.")
            String status,

            Long assigneeId,

            LocalDate dueDate,

            @Size(max = 1000000, message = "Context must be 1,000,000 characters or fewer.")
            String context,

            @Size(max = 40, message = "AI tool names must be 40 characters or fewer.")
            String contextTool,

            LocalDate createdDate) {
    }

    public record TaskResponse(
            Long id,
            String title,
            String description,
            String type,
            String status,
            Long assigneeId,
            LocalDate dueDate,
            LocalDate createdDate,
            String context,
            String contextTool,
            Instant contextUpdatedAt) {

        public static TaskResponse from(Task task) {
            return new TaskResponse(
                    task.getId(),
                    task.getTitle(),
                    task.getDescription() == null ? "" : task.getDescription(),
                    task.getType(),
                    task.getStatus(),
                    task.getAssignee() == null ? null : task.getAssignee().getId(),
                    task.getDueDate(),
                    task.getCreatedDate(),
                    task.getContext() == null ? "" : task.getContext(),
                    task.getContextTool(),
                    task.getContextUpdatedAt());
        }
    }
}
