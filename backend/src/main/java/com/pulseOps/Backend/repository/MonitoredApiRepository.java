package com.pulseOps.Backend.repository;

import com.pulseOps.Backend.entity.MonitoredApi;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface MonitoredApiRepository extends JpaRepository<MonitoredApi, Long> {
    List<MonitoredApi> findByOwnerIdOrderByCreatedAtDesc(Long ownerId);
    List<MonitoredApi> findByOwnerIdAndPausedFalse(Long ownerId);
    Optional<MonitoredApi> findByIdAndOwnerEmailIgnoreCase(Long id, String email);
    long countByOwnerId(Long ownerId);
}
