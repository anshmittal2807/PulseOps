package com.pulseOps.Backend.controller;

import com.pulseOps.Backend.dto.AlertResponse;
import com.pulseOps.Backend.repository.UserRepository;
import com.pulseOps.Backend.service.AlertService;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/alerts")
public class AlertController {

    private final AlertService alerts;
    private final UserRepository users;

    public AlertController(AlertService alerts, UserRepository users) {
        this.alerts = alerts;
        this.users = users;
    }

    @GetMapping
    public List<AlertResponse> list(Authentication auth) {
        return alerts.list(ownerId(auth));
    }

    @PatchMapping("/{id}/read")
    public void markRead(Authentication auth, @PathVariable Long id) {
        alerts.markRead(ownerId(auth), id);
    }

    @PatchMapping("/read-all")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void markAllRead(Authentication auth) {
        alerts.markAllRead(ownerId(auth));
    }

    private Long ownerId(Authentication auth) {
        return users.findByEmail(auth.getName().toLowerCase())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unknown user"))
                .getId();
    }
}
