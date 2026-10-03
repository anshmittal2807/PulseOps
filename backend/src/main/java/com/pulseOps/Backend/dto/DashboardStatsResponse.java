package com.pulseOps.Backend.dto;

import java.util.List;

public record DashboardStatsResponse(
        int totalMonitors,
        int activeMonitors,
        int healthy,
        int warning,
        int critical,
        int offline,
        int needsAttention,
        int averageLatencyMs,
        long openAlerts,
        List<RecentCheckDto> recentChecks,
        List<Integer> statusDistribution,
        List<LatencyBarDto> latencyByService) {

    public record RecentCheckDto(String name, int statusCode, String responseTime, String checked) {
    }

    public record LatencyBarDto(String label, int ms) {
    }
}
