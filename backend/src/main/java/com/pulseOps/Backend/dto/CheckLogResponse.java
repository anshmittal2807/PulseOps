package com.pulseOps.Backend.dto;

import java.time.Instant;

public record CheckLogResponse(
        Long id,
        Long apiId,
        String apiName,
        Instant checkedAt,
        String timestamp,
        int statusCode,
        String responseTime,
        Integer responseTimeMs,
        String errorMessage,
        boolean success) {
}
