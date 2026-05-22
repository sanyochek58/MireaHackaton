package ru.hack.orchestrator.dto.response;

public record SystemMetricsResponse(
        int cpuPercent,
        int ramPercent,
        int activeStands,
        int maxStands,
        boolean canProvision
) {
}
