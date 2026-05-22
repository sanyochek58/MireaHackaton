package ru.hack.orchestrator.dto.response;

public record SystemLimitsResponse(
        int cpuMin,
        int cpuMax,
        int ramMin,
        int ramMax,
        int diskMin,
        int diskMax,
        int ttlMinHours,
        int ttlMaxHours,
        int ttlDefaultHours
) {
}
