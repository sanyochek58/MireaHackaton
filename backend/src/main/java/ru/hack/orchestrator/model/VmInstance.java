package ru.hack.orchestrator.model;

import java.time.Instant;

public record VmInstance(
        String userEmail,
        String serverId,
        String volumeId,
        String name,
        String keyName,
        String flavorId,
        String imageId,
        String networkId,
        String status,
        String ipAddress,
        Integer cpu,
        Integer ramGb,
        Instant createdAt
) {
}
