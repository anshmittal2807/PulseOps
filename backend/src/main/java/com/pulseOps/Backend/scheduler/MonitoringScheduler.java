package com.pulseOps.Backend.scheduler;

import com.pulseOps.Backend.repository.MonitoredApiRepository;
import com.pulseOps.Backend.service.HealthCheckService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

/**
 * Periodically probes monitors that are due, based on their intervalMinutes.
 * Runs every minute by default; each monitor is checked only when its
 * interval has elapsed since the last check.
 */
@Component
public class MonitoringScheduler {

    private static final Logger log = LoggerFactory.getLogger(MonitoringScheduler.class);

    private final MonitoredApiRepository apis;
    private final HealthCheckService health;
    private final boolean enabled;

    public MonitoringScheduler(MonitoredApiRepository apis, HealthCheckService health,
                               @Value("${app.monitoring.enabled:true}") boolean enabled) {
        this.apis = apis;
        this.health = health;
        this.enabled = enabled;
    }

    @Scheduled(fixedDelayString = "${app.monitoring.fixed-delay-ms:60000}")
    public void pollDueMonitors() {
        if (!enabled) return;
        var all = apis.findAll();
        int ran = 0;
        for (var api : all) {
            if (api.isPaused()) continue;
            int interval = api.getIntervalMinutes() == null ? 5 : api.getIntervalMinutes();
            var last = api.getLastCheckedAt();
            if (last != null && ChronoUnit.MINUTES.between(last, Instant.now()) < interval) continue;
            try {
                // Re-fetch inside probe transaction boundaries is handled by the service.
                health.probe(api);
                ran++;
            } catch (Exception ex) {
                log.warn("Scheduled check failed for api {}: {}", api.getId(), ex.getMessage());
            }
        }
        if (ran > 0) log.info("Scheduled monitoring ran {} checks", ran);
    }
}
