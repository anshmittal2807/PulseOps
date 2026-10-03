package com.pulseOps.Backend.service;

import com.pulseOps.Backend.dto.ReportResponse;
import com.pulseOps.Backend.entity.CheckLog;
import com.pulseOps.Backend.entity.MonitoredApi;
import com.pulseOps.Backend.repository.CheckLogRepository;
import com.pulseOps.Backend.repository.MonitoredApiRepository;
import com.pulseOps.Backend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Duration;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ReportService {

    private final UserRepository users;
    private final MonitoredApiRepository apis;
    private final CheckLogRepository logs;

    public ReportService(UserRepository users, MonitoredApiRepository apis, CheckLogRepository logs) {
        this.users = users;
        this.apis = apis;
        this.logs = logs;
    }

    @Transactional(readOnly = true)
    public ReportResponse report(String email, String requestedPeriod) {
        var owner = users.findByEmail(email.toLowerCase(Locale.ROOT))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unknown user"));
        String period = normalizePeriod(requestedPeriod);
        Instant to = Instant.now();
        Instant from = switch (period) {
            case "today" -> to.truncatedTo(ChronoUnit.DAYS);
            case "monthly" -> to.minus(30, ChronoUnit.DAYS);
            default -> to.minus(7, ChronoUnit.DAYS);
        };

        List<CheckLog> allLogs = logs.findByOwnerSince(owner.getId(), from);
        Map<Long, List<CheckLog>> byMonitor = allLogs.stream()
                .collect(Collectors.groupingBy(log -> log.getApi().getId()));
        List<MonitoredApi> monitors = apis.findByOwnerIdOrderByCreatedAtDesc(owner.getId());

        List<ReportResponse.MonitorSummary> summaries = monitors.stream()
                .map(api -> summarize(api, byMonitor.getOrDefault(api.getId(), List.of()), to))
                .sorted(Comparator.comparingLong(ReportResponse.MonitorSummary::failedChecks).reversed()
                        .thenComparing(ReportResponse.MonitorSummary::name))
                .toList();

        long successful = allLogs.stream().filter(CheckLog::isSuccess).count();
        long failed = allLogs.size() - successful;
        int averageMs = averageResponse(allLogs);
        long downtime = summaries.stream().mapToLong(ReportResponse.MonitorSummary::estimatedDowntimeMinutes).sum();

        return new ReportResponse(period, from, to, allLogs.size(), successful, failed,
                percentage(successful, allLogs.size()), averageMs, downtime, summaries);
    }

    private static ReportResponse.MonitorSummary summarize(MonitoredApi api, List<CheckLog> monitorLogs,
                                                            Instant reportEnd) {
        long successful = monitorLogs.stream().filter(CheckLog::isSuccess).count();
        long failed = monitorLogs.size() - successful;
        long downtime = estimateDowntime(monitorLogs, reportEnd, api.getIntervalMinutes());
        return new ReportResponse.MonitorSummary(api.getId(), api.getName(), api.getUrl(),
                api.getStatus().name(), monitorLogs.size(), failed,
                percentage(successful, monitorLogs.size()), averageResponse(monitorLogs), downtime);
    }

    /**
     * Check-based monitoring cannot know an outage's exact start. Estimate each
     * failed run as down until the next run, capped at the configured interval.
     */
    private static long estimateDowntime(List<CheckLog> logs, Instant reportEnd, Integer intervalMinutes) {
        if (logs.isEmpty()) return 0;
        int interval = intervalMinutes == null ? 5 : Math.max(intervalMinutes, 1);
        List<CheckLog> chronological = logs.stream()
                .sorted(Comparator.comparing(CheckLog::getCheckedAt)).toList();
        long seconds = 0;
        for (int i = 0; i < chronological.size(); i++) {
            CheckLog current = chronological.get(i);
            if (current.isSuccess()) continue;
            Instant next = i + 1 < chronological.size() ? chronological.get(i + 1).getCheckedAt() : reportEnd;
            seconds += Math.min(Math.max(Duration.between(current.getCheckedAt(), next).toSeconds(), 0),
                    interval * 60L);
        }
        return Math.round(seconds / 60.0);
    }

    private static int averageResponse(List<CheckLog> values) {
        return (int) Math.round(values.stream().filter(CheckLog::isSuccess)
                .map(CheckLog::getResponseTimeMs).filter(value -> value != null)
                .mapToInt(Integer::intValue).average().orElse(0));
    }

    private static double percentage(long successful, long total) {
        if (total == 0) return 0.0;
        return Math.round(successful * 10000.0 / total) / 100.0;
    }

    private static String normalizePeriod(String value) {
        String period = value == null ? "weekly" : value.trim().toLowerCase(Locale.ROOT);
        if (!List.of("today", "weekly", "monthly").contains(period)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Period must be today, weekly or monthly");
        }
        return period;
    }
}
