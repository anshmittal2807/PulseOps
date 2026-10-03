package com.pulseOps.Backend.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "activity_entries", indexes = @Index(name = "idx_activity_owner", columnList = "owner_id"))
public class ActivityEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @Column(nullable = false, length = 40)
    private String icon = "info";

    @Column(nullable = false, length = 40)
    private String tone = "text-primary";

    @Column(nullable = false, length = 80)
    private String category = "";

    @Column(nullable = false, length = 1024)
    private String message = "";

    @Column(length = 1024)
    private String detail = "";

    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    protected ActivityEntry() {
    }

    public ActivityEntry(User owner, String icon, String tone, String category, String message, String detail) {
        this.owner = owner;
        this.icon = icon;
        this.tone = tone;
        this.category = category;
        this.message = message;
        this.detail = detail == null ? "" : detail;
    }

    public Long getId() { return id; }
    public User getOwner() { return owner; }
    public String getIcon() { return icon; }
    public String getTone() { return tone; }
    public String getCategory() { return category; }
    public String getMessage() { return message; }
    public String getDetail() { return detail; }
    public Instant getCreatedAt() { return createdAt; }
}
