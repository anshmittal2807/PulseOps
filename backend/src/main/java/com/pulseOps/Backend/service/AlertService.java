package com.pulseOps.Backend.service;

import com.pulseOps.Backend.dto.AlertResponse;
import com.pulseOps.Backend.entity.Alert;
import com.pulseOps.Backend.entity.MonitoredApi;
import com.pulseOps.Backend.entity.User;
import com.pulseOps.Backend.repository.AlertRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class AlertService {

    private final AlertRepository repo;

    public AlertService(AlertRepository repo) {
        this.repo = repo;
    }

    @Transactional
    public Alert raise(User owner, MonitoredApi api, String type, String severity, String message, String icon) {
        String service = api != null ? api.getName() : "System";
        return repo.save(new Alert(owner, api, service, type, severity, message, icon));
    }

    @Transactional
    public void resolveOpenForApi(Long apiId) {
        repo.findByApiIdAndUnreadTrue(apiId).forEach(alert -> alert.setUnread(false));
    }

    @Transactional(readOnly = true)
    public List<AlertResponse> list(Long ownerId) {
        return repo.findByOwnerIdOrderByCreatedAtDesc(ownerId).stream().map(AlertService::toDto).toList();
    }

    @Transactional
    public void markRead(Long ownerId, Long id) {
        var alert = repo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Alert not found"));
        if (!alert.getOwner().getId().equals(ownerId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your alert");
        }
        alert.setUnread(false);
    }

    @Transactional
    public void markAllRead(Long ownerId) {
        repo.findByOwnerIdOrderByCreatedAtDesc(ownerId).forEach(a -> a.setUnread(false));
    }

    public static AlertResponse toDto(Alert a) {
        Long apiId = null;
        try {
            if (a.getApi() != null) apiId = a.getApi().getId();
        } catch (Exception ignored) {
        }
        return new AlertResponse(a.getId(), apiId, a.getService(), a.getType(), a.getSeverity(),
                a.getMessage(), format(a), a.getCreatedAt(), a.isUnread(), a.getIcon());
    }

    private static String format(Alert a) {
        long mins = java.time.Duration.between(a.getCreatedAt(), java.time.Instant.now()).toMinutes();
        if (mins < 1) return "Just now";
        if (mins < 60) return "Today, " + a.getCreatedAt().atZone(ZoneId.systemDefault())
                .format(DateTimeFormatter.ofPattern("HH:mm"));
        return a.getCreatedAt().atZone(ZoneId.systemDefault())
                .format(DateTimeFormatter.ofPattern("MMM d, HH:mm"));
    }
}
