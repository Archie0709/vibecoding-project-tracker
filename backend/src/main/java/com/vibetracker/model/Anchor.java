package com.vibetracker.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

/** DR-05 / DR-11: one pinned deliverable slot on a board. */
@Entity
@Table(name = "anchor")
public class Anchor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "board_id", nullable = false)
    private Board board;

    /** 'presentation' | 'demo' | 'report' | 'documentation'. */
    @Column(nullable = false, length = 20)
    private String slot;

    @Column(nullable = false, length = 50)
    private String label;

    @Column(length = 2048)
    private String url;

    protected Anchor() {
        // for JPA
    }

    public Anchor(Board board, String slot, String label) {
        this.board = board;
        this.slot = slot;
        this.label = label;
    }

    public Long getId() { return id; }
    public Board getBoard() { return board; }
    public String getSlot() { return slot; }
    public String getLabel() { return label; }
    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }
}
