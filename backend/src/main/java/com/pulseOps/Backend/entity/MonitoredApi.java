package com.pulseOps.Backend.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "monitored_apis", indexes = {
        @Index(name = "idx_api_owner", columnList = "owner_id"),
        @Index(name = "idx_api_status", columnList = "status")
})
public class MonitoredApi {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @Column(nullable = false, length = 160)
    private String name;

    @Column(nullable = false, length = 1024)
    private String url;

    @Column(nullable = false, length = 10)
    private String method = "GET";

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ApiStatus status = ApiStatus.Healthy;

    /** Last observed response time in ms; null = timeout/unreachable. */
    private Integer lastResponseTimeMs;

    /** Rolling average response time in ms across successful checks. */
    private Integer averageResponseTimeMs = 0;

    /** Success % over retained history, 0..100. */
    private Double successRate = 100.0;

    @Column(nullable = false, length = 40)
    private String environment = "Production";

    @Column(length = 1024)
    private String description = "";

    private Integer expectedStatus = 200;

    /** Latency threshold in ms; breaching it marks Warning. */
    private Integer thresholdMs = 500;

    /** Polling interval in minutes (1, 5, 15, 30). */
    private Integer intervalMinutes = 5;

    @Column(length = 20)
    private String authType = "None";

    @Column(nullable = false)
    private boolean paused = false;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "api_headers", joinColumns = @JoinColumn(name = "api_id"),
            indexes = @Index(name = "idx_headers_api", columnList = "api_id"))
    private List<ApiHeader> headers = new ArrayList<>();

    @Column(length = 4000)
    private String requestBody = "";

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "api_tags", joinColumns = @JoinColumn(name = "api_id"),
            indexes = @Index(name = "idx_tags_api", columnList = "api_id"))
    @Column(name = "tag", length = 60)
    private List<String> tags = new ArrayList<>();

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(nullable = false)
    private Instant updatedAt = Instant.now();

    private Instant lastCheckedAt;

    public MonitoredApi() {
    }

    public Long getId() { return id; }
    public User getOwner() { return owner; }
    public void setOwner(User owner) { this.owner = owner; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }
    public String getMethod() { return method; }
    public void setMethod(String method) { this.method = method; }
    public ApiStatus getStatus() { return status; }
    public void setStatus(ApiStatus status) { this.status = status; }
    public Integer getLastResponseTimeMs() { return lastResponseTimeMs; }
    public void setLastResponseTimeMs(Integer v) { this.lastResponseTimeMs = v; }
    public Integer getAverageResponseTimeMs() { return averageResponseTimeMs; }
    public void setAverageResponseTimeMs(Integer v) { this.averageResponseTimeMs = v; }
    public Double getSuccessRate() { return successRate; }
    public void setSuccessRate(Double v) { this.successRate = v; }
    public String getEnvironment() { return environment; }
    public void setEnvironment(String environment) { this.environment = environment; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Integer getExpectedStatus() { return expectedStatus; }
    public void setExpectedStatus(Integer expectedStatus) { this.expectedStatus = expectedStatus; }
    public Integer getThresholdMs() { return thresholdMs; }
    public void setThresholdMs(Integer thresholdMs) { this.thresholdMs = thresholdMs; }
    public Integer getIntervalMinutes() { return intervalMinutes; }
    public void setIntervalMinutes(Integer intervalMinutes) { this.intervalMinutes = intervalMinutes; }
    public String getAuthType() { return authType; }
    public void setAuthType(String authType) { this.authType = authType; }
    public boolean isPaused() { return paused; }
    public void setPaused(boolean paused) { this.paused = paused; }
    public List<ApiHeader> getHeaders() { return headers; }
    public void setHeaders(List<ApiHeader> headers) { this.headers = headers; }
    public String getRequestBody() { return requestBody; }
    public void setRequestBody(String requestBody) { this.requestBody = requestBody; }
    public List<String> getTags() { return tags; }
    public void setTags(List<String> tags) { this.tags = tags; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void touch() { this.updatedAt = Instant.now(); }
    public Instant getLastCheckedAt() { return lastCheckedAt; }
    public void setLastCheckedAt(Instant lastCheckedAt) { this.lastCheckedAt = lastCheckedAt; }
}
