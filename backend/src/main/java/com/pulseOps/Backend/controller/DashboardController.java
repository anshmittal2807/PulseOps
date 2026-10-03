package com.pulseOps.Backend.controller;

import com.pulseOps.Backend.dto.CheckLogResponse;
import com.pulseOps.Backend.dto.DashboardStatsResponse;
import com.pulseOps.Backend.dto.ReportResponse;
import com.pulseOps.Backend.service.DashboardService;
import com.pulseOps.Backend.service.ReportService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboard;
    private final ReportService reports;

    public DashboardController(DashboardService dashboard, ReportService reports) {
        this.dashboard = dashboard;
        this.reports = reports;
    }

    @GetMapping("/stats")
    public DashboardStatsResponse stats(Authentication auth) {
        return dashboard.stats(auth.getName());
    }

    @GetMapping("/recent-checks")
    public List<CheckLogResponse> recentChecks(Authentication auth,
                                               @RequestParam(defaultValue = "60") int limit) {
        return dashboard.recentChecks(auth.getName(), limit);
    }

    @GetMapping("/report")
    public ReportResponse report(Authentication auth,
                                 @RequestParam(defaultValue = "weekly") String period) {
        return reports.report(auth.getName(), period);
    }
}
