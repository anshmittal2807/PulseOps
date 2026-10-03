package com.pulseOps.Backend.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.util.List;

public record ApiCreateRequest(
        @NotBlank(message = "Name is required")
        @Size(min = 2, max = 160, message = "Name must be 2-160 characters") String name,

        @NotBlank(message = "URL is required")
        @Size(max = 1024, message = "URL must be under 1024 characters")
        @Pattern(regexp = "^https?://.+", message = "URL must start with http:// or https://") String url,

        @Pattern(regexp = "GET|POST|PUT|PATCH|DELETE", message = "Method must be GET, POST, PUT, PATCH or DELETE") String method,

        @Pattern(regexp = "Production|Staging|Development",
                message = "Environment must be Production, Staging or Development") String environment,

        @Size(max = 1024, message = "Description must be under 1024 characters") String description,

        @Min(value = 100, message = "Expected status must be 100-599")
        @Max(value = 599, message = "Expected status must be 100-599") Integer expectedStatus,

        @Min(value = 50, message = "Threshold must be at least 50ms")
        @Max(value = 60000, message = "Threshold must be under 60000ms") Integer thresholdMs,

        @Min(value = 1, message = "Check interval must be 1, 5, 15 or 30 minutes")
        @Max(value = 30, message = "Check interval must be 1, 5, 15 or 30 minutes") Integer intervalMinutes,

        @Pattern(regexp = "None|Bearer|API Key|APIKey|Basic",
                message = "Auth type must be None, Bearer, API Key or Basic") String authType,

        @Size(max = 4000, message = "Request body must be under 4000 characters") String requestBody,

        @Size(max = 20, message = "Too many headers (max 20)")
        List<@Valid HeaderDto> headers,

        @Size(max = 10, message = "Too many tags (max 10)") List<@Size(max = 60, message = "Tag must be under 60 characters") String> tags) {

    public record HeaderDto(
            @NotBlank(message = "Header key is required")
            @Size(max = 190, message = "Header key must be under 190 characters") String key,

            @Size(max = 1024, message = "Header value must be under 1024 characters") String value) {
    }
}
