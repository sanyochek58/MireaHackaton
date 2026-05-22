package ru.hack.orchestrator.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.hack.orchestrator.model.SystemMetricsSnapshotEntity;

import java.time.Instant;
import java.util.List;

@Repository
public interface SystemMetricsRepository extends JpaRepository<SystemMetricsSnapshotEntity, Long> {
    List<SystemMetricsSnapshotEntity> findAllByTimestampGreaterThanEqualOrderByTimestampAsc(Instant threshold);
    void deleteByTimestampBefore(Instant threshold);
}
