package com.pulseOps.Backend.controller;

import com.pulseOps.Backend.dto.ActivityResponse;
import com.pulseOps.Backend.repository.UserRepository;
import com.pulseOps.Backend.service.ActivityService;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/activity")
public class ActivityController {

    private final ActivityService activity;
    private final UserRepository users;

    public ActivityController(ActivityService activity, UserRepository users) {
        this.activity = activity;
        this.users = users;
    }

    @GetMapping
    public List<ActivityResponse> list(Authentication auth) {
        var owner = users.findByEmail(auth.getName().toLowerCase())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unknown user"));
        return activity.list(owner.getId());
    }
}
