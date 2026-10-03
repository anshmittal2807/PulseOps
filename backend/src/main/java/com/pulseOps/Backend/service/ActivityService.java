package com.pulseOps.Backend.service;

import com.pulseOps.Backend.dto.ActivityResponse;
import com.pulseOps.Backend.entity.ActivityEntry;
import com.pulseOps.Backend.entity.User;
import com.pulseOps.Backend.repository.ActivityRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class ActivityService {

    private final ActivityRepository repo;

    public ActivityService(ActivityRepository repo) {
        this.repo = repo;
    }

    @Transactional
    public void log(User owner, String icon, String tone, String category, String message, String detail) {
        repo.save(new ActivityEntry(owner, icon, tone, category, message, detail));
    }

    @Transactional(readOnly = true)
    public List<ActivityResponse> list(Long ownerId) {
        return repo.findByOwnerIdOrderByCreatedAtDesc(ownerId).stream()
                .map(ActivityService::toDto).toList();
    }

    public static ActivityResponse toDto(ActivityEntry e) {
        return new ActivityResponse(
                e.getId(), e.getIcon(), e.getTone(), e.getCategory(),
                relative(e), e.getMessage(), e.getDetail(), e.getCreatedAt());
    }

    static String relative(ActivityEntry e) {
        long mins = java.time.Duration.between(e.getCreatedAt(), java.time.Instant.now()).toMinutes();
        if (mins < 1) return "Just now";
        if (mins < 60) return mins + " minutes ago";
        long hrs = mins / 60;
        if (hrs < 24) return hrs + " hours ago";
        return e.getCreatedAt().atZone(ZoneId.systemDefault())
                .format(DateTimeFormatter.ofPattern("MMM d, HH:mm"));
    }
}
