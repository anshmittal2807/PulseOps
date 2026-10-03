package com.pulseOps.Backend.dto;

/**
 * Result of a one-off live probe that is NOT persisted
 * (used by "Test connection" before a monitor is saved).
 */
public record ProbeResponse(
        int statusCode,
        Integer responseTimeMs,
        String responseTime,
        boolean success,
        String status,
        String message) {
}
