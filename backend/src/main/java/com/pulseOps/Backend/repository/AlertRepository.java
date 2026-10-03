package com.pulseOps.Backend.repository;

import com.pulseOps.Backend.entity.Alert;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AlertRepository extends JpaRepository<Alert, Long> {
    List<Alert> findByOwnerIdOrderByCreatedAtDesc(Long ownerId);
    long countByOwnerIdAndUnreadTrue(Long ownerId);
    List<Alert> findByApiIdAndUnreadTrue(Long apiId);
    void deleteByApiId(Long apiId);
}
