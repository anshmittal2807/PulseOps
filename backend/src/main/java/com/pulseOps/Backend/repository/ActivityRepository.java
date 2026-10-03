package com.pulseOps.Backend.repository;

import com.pulseOps.Backend.entity.ActivityEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ActivityRepository extends JpaRepository<ActivityEntry, Long> {
    List<ActivityEntry> findByOwnerIdOrderByCreatedAtDesc(Long ownerId);
}
