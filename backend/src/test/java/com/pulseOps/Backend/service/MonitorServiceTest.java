package com.pulseOps.Backend.service;

import com.pulseOps.Backend.entity.ApiStatus;
import com.pulseOps.Backend.entity.MonitoredApi;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class MonitorServiceTest {

    private final MonitoredApi api = monitor();

    @Test
    void classifiesExpectedFastResponseAsHealthy() {
        assertEquals(ApiStatus.Healthy, MonitorService.classify(api, 200, 120, true));
    }

    @Test
    void classifiesExpectedSlowResponseAsWarning() {
        assertEquals(ApiStatus.Warning, MonitorService.classify(api, 200, 800, true));
    }

    @Test
    void classifiesUnexpectedStatusAsCritical() {
        assertEquals(ApiStatus.Critical, MonitorService.classify(api, 503, 100, false));
    }

    @Test
    void classifiesConnectionFailureAsOffline() {
        assertEquals(ApiStatus.Offline, MonitorService.classify(api, 0, null, false));
    }

    private static MonitoredApi monitor() {
        MonitoredApi value = new MonitoredApi();
        value.setExpectedStatus(200);
        value.setThresholdMs(500);
        return value;
    }
}
