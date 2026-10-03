package com.pulseOps.Backend.service;

import com.pulseOps.Backend.dto.CheckLogResponse;
import com.pulseOps.Backend.dto.DashboardStatsResponse;
import com.pulseOps.Backend.entity.ApiStatus;
import com.pulseOps.Backend.entity.MonitoredApi;
import com.pulseOps.Backend.repository.AlertRepository;
import com.pulseOps.Backend.repository.CheckLogRepository;
import com.pulseOps.Backend.repository.MonitoredApiRepository;
import com.pulseOps.Backend.repository.UserRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class DashboardService {

    private final UserRepository users;
    private final MonitoredApiRepository apis;
    private final AlertRepository alerts;
    private final CheckLogRepository logs;

    public DashboardService(UserRepository users, MonitoredApiRepository apis,
                            AlertRepository alerts, CheckLogRepository logs) {
        this.users = users;
        this.apis = apis;
        this.alerts = alerts;
        this.logs = logs;
    }

    @Transactional(readOnly = true)
    public DashboardStatsResponse stats(String email) {
        var owner = users.findByEmail(email.toLowerCase())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unknown user"));
        List<MonitoredApi> all = apis.findByOwnerIdOrderByCreatedAtDesc(owner.getId());

        int healthy = (int) all.stream().filter(a -> a.getStatus() == ApiStatus.Healthy).count();
        int warning = (int) all.stream().filter(a -> a.getStatus() == ApiStatus.Warning).count();
        int critical = (int) all.stream().filter(a -> a.getStatus() == ApiStatus.Critical).count();
        int offline = (int) all.stream().filter(a -> a.getStatus() == ApiStatus.Offline).count();
        int active = (int) all.stream().filter(a -> !a.isPaused()).count();
        var measured = all.stream().filter(a -> a.getAverageResponseTimeMs() != null && a.getAverageResponseTimeMs() > 0).toList();
        int avg = measured.isEmpty() ? 0 : (int) Math.round(
                measured.stream().mapToInt(MonitoredApi::getAverageResponseTimeMs).average().orElse(0));

        var recent = logs.findRecentByOwner(owner.getId(), PageRequest.of(0, 5)).stream()
                .map(l -> {
                    String name = "Unknown";
                    try {
                        name = l.getApi().getName();
                    } catch (Exception ignored) {
                    }
                    String rt = l.getResponseTimeMs() == null ? "timeout" : l.getResponseTimeMs() + "ms";
                    String checked = MonitorService.logToDto(l).timestamp();
                    return new DashboardStatsResponse.RecentCheckDto(name, l.getStatusCode(), rt, checked);
                }).toList();

        int total = Math.max(all.size(), 1);
        List<Integer> dist = List.of(
                (int) Math.round(healthy * 100.0 / total),
                (int) Math.round(warning * 100.0 / total),
                (int) Math.round((critical + offline) * 100.0 / total));

        List<DashboardStatsResponse.LatencyBarDto> bars = measured.stream().limit(5)
                .map(a -> new DashboardStatsResponse.LatencyBarDto(
                        a.getName().split(" ")[0], a.getAverageResponseTimeMs()))
                .toList();

        return new DashboardStatsResponse(all.size(), active, healthy, warning, critical, offline,
                warning + critical + offline, avg, alerts.countByOwnerIdAndUnreadTrue(owner.getId()),
                recent, dist, bars);
    }

    /** Most recent recorded checks across the whole estate (scheduler + manual). */
    @Transactional(readOnly = true)
    public List<CheckLogResponse> recentChecks(String email, int limit) {
        var owner = users.findByEmail(email.toLowerCase())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unknown user"));
        int safeLimit = Math.min(Math.max(limit, 1), 200);
        return logs.findRecentByOwner(owner.getId(), PageRequest.of(0, safeLimit)).stream()
                .map(MonitorService::logToDto).toList();
    }
}
