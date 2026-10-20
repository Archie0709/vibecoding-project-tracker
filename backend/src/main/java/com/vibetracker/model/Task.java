package com.vibetracker.model;

import java.time.Instant;
import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

/** DR-01 / DR-02 / DR-11: a task on a board, including its AI context. */
@Entity
@Table(name = "task")
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "board_id", nullable = false)
    private Board board;

    @Column(nullable = false, length = 120)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    /** 'feature' | 'bug' (enforced by a CHECK constraint in schema.sql). */
    @Column(nullable = false, length = 20)
    private String type = "feature";

    /** 'todo' | 'in-progress' | 'review' | 'done'. */
    @Column(nullable = false, length = 20)
    private String status = "todo";

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assignee_id")
    private User assignee;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(name = "created_date", nullable = false, updatable = false)
    private LocalDate createdDate;

    @Column(columnDefinition = "MEDIUMTEXT")
    private String context;

    @Column(name = "context_tool", length = 40)
    private String contextTool;

    @Column(name = "context_updated_at")
    private Instant contextUpdatedAt;

    @PrePersist
    void onCreate() {
        if (createdDate == null) createdDate = LocalDate.now();
    }

    public Long getId() { return id; }
    public Board getBoard() { return board; }
    public void setBoard(Board board) { this.board = board; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public User getAssignee() { return assignee; }
    public void setAssignee(User assignee) { this.assignee = assignee; }
    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }
    public LocalDate getCreatedDate() { return createdDate; }
    /** Only used when importing older tasks; otherwise set automatically on create. */
    public void setCreatedDate(LocalDate createdDate) { this.createdDate = createdDate; }
    public String getContext() { return context; }
    public void setContext(String context) { this.context = context; }
    public String getContextTool() { return contextTool; }
    public void setContextTool(String contextTool) { this.contextTool = contextTool; }
    public Instant getContextUpdatedAt() { return contextUpdatedAt; }
    public void setContextUpdatedAt(Instant contextUpdatedAt) { this.contextUpdatedAt = contextUpdatedAt; }
}
