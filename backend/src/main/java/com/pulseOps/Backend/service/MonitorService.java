package com.pulseOps.Backend.service;

import com.pulseOps.Backend.dto.*;
import com.pulseOps.Backend.entity.*;
import com.pulseOps.Backend.repository.*;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
public class MonitorService {

    private final MonitoredApiRepository apis;
    private final UserRepository users;
    private final CheckLogRepository logs;
    private final AlertRepository alerts;
    private final ActivityService activity;
    private final AlertService alertService;

    private static final java.util.Set<Integer> ALLOWED_INTERVALS = java.util.Set.of(1, 5, 15, 30);

    public MonitorService(MonitoredApiRepository apis, UserRepository users, CheckLogRepository logs,
                          AlertRepository alerts, ActivityService activity, AlertService alertService) {
        this.apis = apis;
        this.users = users;
        this.logs = logs;
        this.alertService = alertService;
        this.alerts = alerts;
        this.activity = activity;
    }

    private User owner(String email) {
        return users.findByEmail(email.toLowerCase())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unknown user"));
    }

    @Transactional(readOnly = true)
    public List<ApiResponse> list(String email) {
        User o = owner(email);
        return apis.findByOwnerIdOrderByCreatedAtDesc(o.getId()).stream().map(this::toDto).toList();
    }

    @Transactional(readOnly = true)
    public ApiDetailBundle get(String email, Long id) {
        MonitoredApi api = owned(email, id);
        ApiResponse dto = toDto(api);
        List<CheckLogResponse> recent = logs.findByApiIdOrderByCheckedAtDesc(id, PageRequest.of(0, 50))
                .stream().map(MonitorService::logToDto).toList();
        return new ApiDetailBundle(dto, recent);
    }

    public record ApiDetailBundle(ApiResponse api, List<CheckLogResponse> logs) {
    }

    @Transactional
    public ApiResponse create(String email, ApiCreateRequest req) {
        User o = owner(email);
        MonitoredApi api = new MonitoredApi();
        apply(api, req);
        api.setOwner(o);
        api.setStatus(ApiStatus.Healthy);
        apis.save(api);
        activity.log(o, "add", "text-success", "Added API",
                api.getName() + " monitoring initialized.", api.getUrl());
        return toDto(api);
    }

    @Transactional
    public ApiResponse update(String email, Long id, ApiCreateRequest req) {
        MonitoredApi api = owned(email, id);
        apply(api, req);
        api.touch();
        activity.log(api.getOwner(), "edit", "text-primary", "Updated API",
                api.getName() + " configuration updated.", api.getUrl());
        return toDto(api);
    }

    @Transactional
    public void delete(String email, Long id) {
        MonitoredApi api = owned(email, id);
        User o = api.getOwner();
        String name = api.getName();
        String url = api.getUrl();
        alerts.deleteByApiId(id);
        // delete logs explicitly to satisfy FK on MySQL when no cascade is mapped
        logs.findByApiIdOrderByCheckedAtDesc(id, PageRequest.of(0, 10000)).forEach(logs::delete);
        apis.delete(api);
        activity.log(o, "delete", "text-error", "Deleted API", name + " removed from monitoring.", url);
    }

    @Transactional
    public ApiResponse togglePaused(String email, Long id) {
        MonitoredApi api = owned(email, id);
        api.setPaused(!api.isPaused());
        api.touch();
        activity.log(api.getOwner(), api.isPaused() ? "pause" : "play_arrow", "text-warning",
                api.isPaused() ? "Paused Monitor" : "Resumed Monitor",
                api.getName() + " monitoring " + (api.isPaused() ? "paused" : "resumed") + ".", api.getUrl());
        return toDto(api);
    }

    /** Called by the health-check service after each probe. */
    @Transactional
    public CheckLogResponse recordResult(MonitoredApi api, int statusCode, Integer responseMs,
                                         String error, boolean success) {
        // Callers (scheduler, manual check) pass detached instances, so re-fetch
        // the managed entity — otherwise field updates would never be flushed.
        MonitoredApi managed = apis.findById(api.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Monitor not found"));
        ApiStatus previousStatus = managed.getStatus();
        ApiStatus nextStatus = classify(managed, statusCode, responseMs, success);
        var log = logs.save(new CheckLog(managed, statusCode, responseMs, error, success));

        // Recompute rolling stats from retained history (last 100).
        var history = logs.findByApiIdOrderByCheckedAtDesc(managed.getId(), PageRequest.of(0, 100));
        long ok = history.stream().filter(CheckLog::isSuccess).count();
        managed.setSuccessRate(history.isEmpty() ? 100.0 : ok * 100.0 / history.size());
        var times = history.stream().filter(CheckLog::isSuccess)
                .map(CheckLog::getResponseTimeMs).filter(t -> t != null).toList();
        managed.setAverageResponseTimeMs(times.isEmpty() ? 0
                : (int) Math.round(times.stream().mapToInt(Integer::intValue).average().orElse(0)));
        managed.setLastResponseTimeMs(responseMs);
        managed.setLastCheckedAt(Instant.now());
        managed.setStatus(nextStatus);
        managed.touch();

        // Notify once per state transition, not once per poll while an outage
        // remains open.
        if (previousStatus != nextStatus && nextStatus != ApiStatus.Healthy) {
            String type = responseMs == null ? "Timeout"
                    : (statusCode != managed.getExpectedStatus() ? "Status Mismatch" : "Slow Response");
            String severity = nextStatus == ApiStatus.Warning ? "warning" : "critical";
            String icon = responseMs == null ? "cloud_off" : "warning";
            String msg = responseMs == null
                    ? "Endpoint did not respond before the request timeout"
                    : (statusCode != managed.getExpectedStatus()
                        ? "Expected status " + managed.getExpectedStatus() + ", but received " + statusCode
                        : "Latency reached " + responseMs + "ms (threshold " + managed.getThresholdMs() + "ms)");
            alertService.raise(managed.getOwner(), managed, type, severity, msg, icon);
        } else if (previousStatus != nextStatus && nextStatus == ApiStatus.Healthy) {
            alertService.resolveOpenForApi(managed.getId());
            alertService.raise(managed.getOwner(), managed, "Recovered", "recovered",
                    "Monitor recovered with HTTP " + statusCode + " in " + responseMs + "ms", "check_circle");
        }
        if (previousStatus != nextStatus) {
            activity.log(managed.getOwner(), nextStatus == ApiStatus.Healthy ? "check_circle" : "monitor_heart",
                    nextStatus == ApiStatus.Healthy ? "text-success" : "text-error", "Monitor status changed",
                    managed.getName() + " changed from " + previousStatus + " to " + nextStatus + ".",
                    success ? statusCode + " OK · " + responseMs + "ms"
                            : "Request failed (" + typeOf(statusCode, responseMs) + ")");
        }
        return logToDto(log);
    }

    private static String typeOf(int statusCode, Integer ms) {
        if (ms == null) return "timeout";
        return String.valueOf(statusCode);
    }

    public static ApiStatus classify(MonitoredApi api, int statusCode, Integer responseMs, boolean success) {
        if (responseMs == null || statusCode == 0) return ApiStatus.Offline;
        if (statusCode != api.getExpectedStatus()) return ApiStatus.Critical;
        if (responseMs > api.getThresholdMs()) return ApiStatus.Warning;
        return ApiStatus.Healthy;
    }

    /**
     * Builds a validated but unpersisted monitor for pre-save probing.
     * Nothing is written to the database.
     */
    public MonitoredApi buildTransient(ApiCreateRequest req) {
        MonitoredApi api = new MonitoredApi();
        apply(api, req);
        return api;
    }

    private void apply(MonitoredApi api, ApiCreateRequest req) {        // Defense in depth: bean validation covers shape, but the allow-list and
        // JSON well-formedness are enforced here so direct service callers get 400s too.
        int interval = req.intervalMinutes() == null ? 5 : req.intervalMinutes();
        if (!ALLOWED_INTERVALS.contains(interval)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Check interval must be one of 1, 5, 15 or 30 minutes");
        }
        String body = req.requestBody() == null ? "" : req.requestBody().trim();
        if (!body.isEmpty() && !isValidJson(body)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Request body must be valid JSON");
        }
        api.setName(req.name().trim());
        api.setUrl(req.url().trim());
        api.setMethod(req.method() == null ? "GET" : req.method());
        api.setEnvironment(req.environment() == null || req.environment().isBlank() ? "Production" : req.environment());
        api.setDescription(req.description() == null ? "" : req.description());
        api.setExpectedStatus(req.expectedStatus() == null ? 200 : req.expectedStatus());
        api.setThresholdMs(req.thresholdMs() == null ? 500 : req.thresholdMs());
        api.setIntervalMinutes(interval);
        api.setAuthType(req.authType() == null ? "None" : req.authType());
        api.setRequestBody(req.requestBody() == null ? "" : req.requestBody());
        List<ApiHeader> headers = new ArrayList<>();
        if (req.headers() != null) {
            req.headers().stream()
                    .filter(h -> h != null && h.key() != null && !h.key().isBlank())
                    .forEach(h -> headers.add(new ApiHeader(h.key().trim(), h.value() == null ? "" : h.value())));
        }
        api.setHeaders(headers);
        List<String> tags = new ArrayList<>();
        if (req.tags() != null) {
            req.tags().stream().filter(t -> t != null && !t.isBlank()).map(String::trim).forEach(tags::add);
        }
        if (tags.isEmpty()) tags.add("Core");
        api.setTags(tags);
    }

    private static boolean isValidJson(String body) {
        try {
            new com.fasterxml.jackson.databind.ObjectMapper().readTree(body);
            return true;
        } catch (Exception ex) {
            return false;
        }
    }

    private MonitoredApi owned(String email, Long id) {
        User o = owner(email);
        MonitoredApi api = apis.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Monitor not found"));
        if (!api.getOwner().getId().equals(o.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your monitor");
        }
        return api;
    }

    ApiResponse toDto(MonitoredApi api) {
        String rt = api.getLastResponseTimeMs() == null ? "timeout" : api.getLastResponseTimeMs() + "ms";
        if (api.getLastCheckedAt() == null && api.getLastResponseTimeMs() == null) rt = "—";
        return new ApiResponse(
                api.getId(), api.getName(), api.getUrl(), api.getMethod(), api.getStatus().name(),
                rt, api.getAverageResponseTimeMs() == null ? 0 : api.getAverageResponseTimeMs(),
                api.getSuccessRate() == null ? 100.0 : Math.round(api.getSuccessRate() * 10) / 10.0,
                api.getEnvironment(), lastCheckedLabel(api), api.getLastCheckedAt(),
                List.copyOf(api.getTags()), api.getDescription() == null ? "" : api.getDescription(),
                api.getExpectedStatus(), api.getThresholdMs(), api.getIntervalMinutes(),
                api.getAuthType(), api.isPaused(),
                api.getHeaders().stream().map(h -> new ApiResponse.HeaderDto(h.getKey(), h.getValue())).toList(),
                api.getRequestBody() == null ? "" : api.getRequestBody());
    }

    private static String lastCheckedLabel(MonitoredApi api) {
        if (api.getLastCheckedAt() == null) return "Not checked yet";
        long mins = java.time.Duration.between(api.getLastCheckedAt(), Instant.now()).toMinutes();
        if (mins < 1) return "Just now";
        if (mins < 60) return mins + " mins ago";
        return api.getLastCheckedAt().atZone(ZoneId.systemDefault())
                .format(DateTimeFormatter.ofPattern("MMM d, HH:mm"));
    }

    static CheckLogResponse logToDto(CheckLog l) {
        Long apiId = null;
        String apiName = "Unknown";
        try {
            apiId = l.getApi().getId();
            apiName = l.getApi().getName();
        } catch (Exception ignored) {
        }
        String ts = l.getCheckedAt().atZone(ZoneId.systemDefault())
                .format(DateTimeFormatter.ofPattern("'Today,' HH:mm:ss"));
        String rt = l.getResponseTimeMs() == null ? "timeout" : l.getResponseTimeMs() + "ms";
        return new CheckLogResponse(l.getId(), apiId, apiName, l.getCheckedAt(), ts, l.getStatusCode(),
                rt, l.getResponseTimeMs(), l.getErrorMessage(), l.isSuccess());
    }
}
