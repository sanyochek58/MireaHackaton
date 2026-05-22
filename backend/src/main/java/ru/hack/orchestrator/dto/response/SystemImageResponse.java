package ru.hack.orchestrator.dto.response;

public record SystemImageResponse(
        String id,
        String name,
        String family,
        String version,
        String description,
        String iconLabel,
        int minDiskGb,
        int recommendedCpu,
        int recommendedRamGb
) {
}
