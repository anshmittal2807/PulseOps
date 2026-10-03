package com.pulseOps.Backend.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "alerts", indexes = @Index(name = "idx_alert_owner", columnList = "owner_id"))
public class Alert {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "api_id")
    private MonitoredApi api;

    @Column(nullable = false, length = 160)
    private String service = "";

    @Column(nullable = false, length = 80)
    private String type = "";

    @Column(nullable = false, length = 20)
    private String severity = "critical";

    @Column(nullable = false, length = 1024)
    private String message = "";

    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    @Column(nullable = false)
    private boolean unread = true;

    @Column(length = 40)
    private String icon = "warning";

    protected Alert() {
    }

    public Alert(User owner, MonitoredApi api, String service, String type, String severity, String message, String icon) {
        this.owner = owner;
        this.api = api;
        this.service = service;
        this.type = type;
        this.severity = severity;
        this.message = message;
        this.icon = icon == null ? "warning" : icon;
    }

    public Long getId() { return id; }
    public User getOwner() { return owner; }
    public MonitoredApi getApi() { return api; }
    public String getService() { return service; }
    public String getType() { return type; }
    public String getSeverity() { return severity; }
    public String getMessage() { return message; }
    public Instant getCreatedAt() { return createdAt; }
    public boolean isUnread() { return unread; }
    public void setUnread(boolean unread) { this.unread = unread; }
    public String getIcon() { return icon; }
}
