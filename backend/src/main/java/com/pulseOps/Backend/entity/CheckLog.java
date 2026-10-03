package com.pulseOps.Backend.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "check_logs", indexes = {
        @Index(name = "idx_log_api", columnList = "api_id"),
        @Index(name = "idx_log_api_time", columnList = "api_id,checked_at")
})
public class CheckLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "api_id", nullable = false)
    private MonitoredApi api;

    @Column(nullable = false)
    private Instant checkedAt = Instant.now();

    /** 0 = no response / connection failure. */
    @Column(nullable = false)
    private int statusCode;

    /** Null = timeout. */
    private Integer responseTimeMs;

    @Column(length = 1024)
    private String errorMessage = "";

    @Column(nullable = false)
    private boolean success;

    protected CheckLog() {
    }

    public CheckLog(MonitoredApi api, int statusCode, Integer responseTimeMs, String errorMessage, boolean success) {
        this.api = api;
        this.statusCode = statusCode;
        this.responseTimeMs = responseTimeMs;
        this.errorMessage = errorMessage == null ? "" : errorMessage;
        this.success = success;
    }

    public Long getId() { return id; }
    public MonitoredApi getApi() { return api; }
    public Instant getCheckedAt() { return checkedAt; }
    public int getStatusCode() { return statusCode; }
    public Integer getResponseTimeMs() { return responseTimeMs; }
    public String getErrorMessage() { return errorMessage; }
    public boolean isSuccess() { return success; }
}
