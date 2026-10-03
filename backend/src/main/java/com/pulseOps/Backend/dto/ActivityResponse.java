package com.pulseOps.Backend.dto;

import java.time.Instant;

public record ActivityResponse(
        Long id,
        String icon,
        String tone,
        String category,
        String timestamp,
        String message,
        String detail,
        Instant createdAt) {
}
