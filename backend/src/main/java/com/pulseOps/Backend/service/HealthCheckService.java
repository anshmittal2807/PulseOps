package com.pulseOps.Backend.service;

import com.pulseOps.Backend.dto.ApiCreateRequest;
import com.pulseOps.Backend.dto.CheckLogResponse;
import com.pulseOps.Backend.dto.ProbeResponse;
import com.pulseOps.Backend.entity.MonitoredApi;
import com.pulseOps.Backend.repository.MonitoredApiRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

/**
 * Performs live HTTP probes against monitored endpoints.
 * Timeouts and connection failures are recorded as failed checks
 * (statusCode 0, responseTimeMs null) instead of throwing.
 */
@Service
public class HealthCheckService {

    private final HttpClient http;
    private final MonitoredApiRepository apis;
    private final MonitorService monitors;
    private final long timeoutMs;

    public HealthCheckService(HttpClient http, MonitoredApiRepository apis, MonitorService monitors,
                              @Value("${app.monitoring.timeout-ms:8000}") long timeoutMs) {
        this.http = http;
        this.apis = apis;
        this.monitors = monitors;
        this.timeoutMs = timeoutMs;
    }

    public CheckLogResponse checkNow(String ownerEmail, Long apiId) {
        MonitoredApi api = apis.findByIdAndOwnerEmailIgnoreCase(apiId, ownerEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Monitor not found"));
        if (api.isPaused()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Monitor is paused");
        }
        return probe(api);
    }

    /** Scheduled + manual path: executes the HTTP call AND persists the result. */
    public CheckLogResponse probe(MonitoredApi api) {
        ProbeOutcome outcome = executeProbe(api);
        return monitors.recordResult(api, outcome.statusCode(), outcome.responseTimeMs(),
                outcome.error(), outcome.available(api));
    }

    /**
     * Pre-save "Test connection" path: executes the same HTTP call but persists
     * nothing — no check log, no alert, no activity entry.
     */
    public ProbeResponse probeTransient(ApiCreateRequest req) {
        MonitoredApi transientApi = monitors.buildTransient(req);
        ProbeOutcome outcome = executeProbe(transientApi);
        boolean success = outcome.available(transientApi);
        String status = MonitorService.classify(transientApi, outcome.statusCode(),
                outcome.responseTimeMs(), success).name();
        String message = success
                ? "Endpoint responded with " + outcome.statusCode() + " in " + outcome.responseTimeMs() + "ms"
                : (!outcome.error().isEmpty() ? outcome.error()
                    : "Expected status " + transientApi.getExpectedStatus()
                        + ", but received " + outcome.statusCode());
        return new ProbeResponse(outcome.statusCode(), outcome.responseTimeMs(),
                outcome.responseTimeMs() == null ? "timeout" : outcome.responseTimeMs() + "ms",
                success, status, message);
    }

    /** Raw HTTP execution shared by the persisted and transient paths. */
    private ProbeOutcome executeProbe(MonitoredApi api) {
        long start = System.currentTimeMillis();
        try {
            HttpRequest.Builder builder = HttpRequest.newBuilder()
                    .uri(URI.create(api.getUrl()))
                    .timeout(Duration.ofMillis(timeoutMs));
            if (api.getHeaders() != null) {
                for (var h : api.getHeaders()) {
                    if (h.getKey() == null || h.getKey().isBlank()) continue;
                    try {
                        builder.header(h.getKey().trim(), h.getValue() == null ? "" : h.getValue());
                    } catch (IllegalArgumentException ignored) {
                    }
                }
            }
            String method = api.getMethod() == null ? "GET" : api.getMethod().toUpperCase();
            String body = api.getRequestBody() == null ? "" : api.getRequestBody();
            HttpRequest.BodyPublisher publisher =
                    (method.equals("POST") || method.equals("PUT") || method.equals("PATCH"))
                            ? HttpRequest.BodyPublishers.ofString(body)
                            : HttpRequest.BodyPublishers.noBody();
            builder.method(method, publisher);
            HttpResponse<byte[]> res = http.send(builder.build(), HttpResponse.BodyHandlers.ofByteArray());
            int elapsed = (int) (System.currentTimeMillis() - start);
            boolean expectedStatus = res.statusCode() == api.getExpectedStatus();
            boolean withinThreshold = elapsed <= api.getThresholdMs();
            String error = expectedStatus && withinThreshold
                    ? ""
                    : ("HTTP " + res.statusCode() + " in " + elapsed + "ms");
            return new ProbeOutcome(res.statusCode(), elapsed, error);
        } catch (Exception ex) {
            String msg = ex.getClass().getSimpleName() + ": " + String.valueOf(ex.getMessage());
            if (msg.length() > 900) msg = msg.substring(0, 900);
            return new ProbeOutcome(0, null, msg);
        }
    }

    private record ProbeOutcome(int statusCode, Integer responseTimeMs, String error) {
        boolean available(MonitoredApi api) {
            if (responseTimeMs == null) return false;
            return statusCode == api.getExpectedStatus();
        }
    }
}
