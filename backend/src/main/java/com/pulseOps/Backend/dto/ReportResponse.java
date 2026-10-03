package com.pulseOps.Backend.dto;

import java.time.Instant;
import java.util.List;

public record ReportResponse(
        String period,
        Instant from,
        Instant to,
        long totalChecks,
        long successfulChecks,
        long failedChecks,
        double uptime,
        int averageResponseTimeMs,
        long estimatedDowntimeMinutes,
        List<MonitorSummary> monitors) {

    public record MonitorSummary(
            Long id,
            String name,
            String url,
            String currentStatus,
            long totalChecks,
            long failedChecks,
            double uptime,
            int averageResponseTimeMs,
            long estimatedDowntimeMinutes) {
    }
}
