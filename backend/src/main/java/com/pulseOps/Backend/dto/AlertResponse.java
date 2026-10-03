package com.pulseOps.Backend.dto;

import java.time.Instant;

public record AlertResponse(
        Long id,
        Long apiId,
        String service,
        String type,
        String severity,
        String message,
        String timestamp,
        Instant createdAt,
        boolean unread,
        String icon) {
}
