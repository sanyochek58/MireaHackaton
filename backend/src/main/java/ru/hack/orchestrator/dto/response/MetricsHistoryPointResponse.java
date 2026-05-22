package ru.hack.orchestrator.dto.response;

import java.time.Instant;

public record MetricsHistoryPointResponse(
        Instant timestamp,
        int cpuPercent,
        int ramPercent
) {
}
