package ru.hack.orchestrator.config;

import jakarta.validation.constraints.Min;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@ConfigurationProperties(prefix = "app.system")
@Validated
public record SystemApiProperties(
        @Min(1) int cpuMin,
        @Min(1) int ramMinGb,
        @Min(1) int diskMinGb,
        @Min(1) int diskMaxGb,
        @Min(1) int ttlMinHours,
        @Min(1) int ttlMaxHours,
        @Min(1) int ttlDefaultHours,
        @Min(1) int maxStandsFallback,
        @Min(1) int metricsSnapshotIntervalMs,
        @Min(1) int metricsHistoryRetentionHours
) {
}
