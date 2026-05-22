package ru.hack.orchestrator.domain;

import java.time.Instant;

public record SystemMetricsSnapshot(
        Instant timestamp,
        int cpuPercent,
        int ramPercent
) {
}
