package com.pulseOps.Backend.controller;

import com.pulseOps.Backend.dto.ApiCreateRequest;
import com.pulseOps.Backend.dto.ApiResponse;
import com.pulseOps.Backend.dto.CheckLogResponse;
import com.pulseOps.Backend.dto.ProbeResponse;
import com.pulseOps.Backend.service.HealthCheckService;
import com.pulseOps.Backend.service.MonitorService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/apis")
public class ApiMonitorController {

    private final MonitorService monitors;
    private final HealthCheckService health;

    public ApiMonitorController(MonitorService monitors, HealthCheckService health) {
        this.monitors = monitors;
        this.health = health;
    }

    @GetMapping
    public List<ApiResponse> list(Authentication auth) {
        return monitors.list(auth.getName());
    }

    @GetMapping("/{id}")
    public Map<String, Object> get(Authentication auth, @PathVariable Long id) {
        var bundle = monitors.get(auth.getName(), id);
        return Map.of("api", bundle.api(), "logs", bundle.logs());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse create(Authentication auth, @Valid @RequestBody ApiCreateRequest req) {
        return monitors.create(auth.getName(), req);
    }

    /**
     * Pre-save "Test connection": runs one live probe against the given
     * config without creating a monitor or recording anything.
     */
    @PostMapping("/probe")
    public ProbeResponse probe(Authentication auth, @Valid @RequestBody ApiCreateRequest req) {
        return health.probeTransient(req);
    }

    @PutMapping("/{id}")
    public ApiResponse update(Authentication auth, @PathVariable Long id,
                              @Valid @RequestBody ApiCreateRequest req) {
        return monitors.update(auth.getName(), id, req);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(Authentication auth, @PathVariable Long id) {
        monitors.delete(auth.getName(), id);
    }

    @PatchMapping("/{id}/pause")
    public ApiResponse togglePaused(Authentication auth, @PathVariable Long id) {
        return monitors.togglePaused(auth.getName(), id);
    }

    @PostMapping("/{id}/check")
    public CheckLogResponse runCheck(Authentication auth, @PathVariable Long id) {
        return health.checkNow(auth.getName(), id);
    }

    @PostMapping("/{id}/test")
    public CheckLogResponse testConnection(Authentication auth, @PathVariable Long id) {
        return health.checkNow(auth.getName(), id);
    }
}
