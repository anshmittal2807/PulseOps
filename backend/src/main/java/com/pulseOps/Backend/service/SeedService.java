package com.pulseOps.Backend.service;

import com.pulseOps.Backend.entity.ActivityEntry;
import com.pulseOps.Backend.entity.User;
import com.pulseOps.Backend.repository.ActivityRepository;
import com.pulseOps.Backend.repository.MonitoredApiRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Bootstraps a fresh account with a single welcome activity entry.
 * Monitors are never fabricated: the user adds real endpoints and the
 * scheduler records genuine health checks against them.
 */
@Service
public class SeedService {

    private final MonitoredApiRepository apis;
    private final ActivityRepository activities;

    public SeedService(MonitoredApiRepository apis, ActivityRepository activities) {
        this.apis = apis;
        this.activities = activities;
    }

    @Transactional
    public void seedForUser(User owner) {
        if (apis.countByOwnerId(owner.getId()) > 0) return;

        activities.save(new ActivityEntry(owner, "rocket_launch", "text-success", "Workspace ready",
                "Welcome to PulseOps. Add your first monitor to begin scheduled health checks.",
                "Monitors are probed automatically on their configured interval"));
    }
}
