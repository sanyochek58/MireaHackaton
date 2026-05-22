package ru.hack.orchestrator.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Entity
@Table(name = "system_metrics_snapshots")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
public class SystemMetricsSnapshotEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Instant timestamp;

    @Column(nullable = false)
    private int cpuPercent;

    @Column(nullable = false)
    private int ramPercent;

    public SystemMetricsSnapshotEntity(Instant timestamp, int cpuPercent, int ramPercent) {
        this.timestamp = timestamp;
        this.cpuPercent = cpuPercent;
        this.ramPercent = ramPercent;
    }
}
