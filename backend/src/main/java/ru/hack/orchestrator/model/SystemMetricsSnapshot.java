package ru.hack.orchestrator.model;

import java.time.Instant;

public record SystemMetricsSnapshot(
        Instant timestamp,
        int cpuPercent,
        int ramPercent
) {
}
