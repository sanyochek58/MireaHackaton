package ru.hack.orchestrator.dto.response;

import java.time.Instant;

public record VmResponse(
        String serverId,
        String volumeId,
        String name,
        String keyName,
        String status,
        String ipAddress,
        Instant createdAt
) {
}
