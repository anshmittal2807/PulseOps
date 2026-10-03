package com.pulseOps.Backend.repository;

import com.pulseOps.Backend.entity.CheckLog;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.time.Instant;
import java.util.List;

public interface CheckLogRepository extends JpaRepository<CheckLog, Long> {
    List<CheckLog> findByApiIdOrderByCheckedAtDesc(Long apiId, Pageable pageable);

    @Query("select c from CheckLog c where c.api.owner.id = :ownerId order by c.checkedAt desc")
    List<CheckLog> findRecentByOwner(Long ownerId, Pageable pageable);

    @Query("select c from CheckLog c where c.api.owner.id = :ownerId and c.checkedAt >= :from order by c.checkedAt desc")
    List<CheckLog> findByOwnerSince(Long ownerId, Instant from);

    long countByApiId(Long apiId);
    long countByApiIdAndSuccessTrue(Long apiId);
}
