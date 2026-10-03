package com.pulseOps.Backend.dto;

import java.time.Instant;
import java.util.List;

public record ApiResponse(
        Long id,
        String name,
        String url,
        String method,
        String status,
        String responseTime,
        Integer averageResponseTimeMs,
        Double successRate,
        String environment,
        String lastChecked,
        Instant lastCheckedAt,
        List<String> tags,
        String description,
        Integer expectedStatus,
        Integer thresholdMs,
        Integer intervalMinutes,
        String authType,
        boolean paused,
        List<HeaderDto> headers,
        String requestBody) {

    public record HeaderDto(String key, String value) {
    }
}
