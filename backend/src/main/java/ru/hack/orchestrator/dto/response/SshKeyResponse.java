package ru.hack.orchestrator.dto.response;

import java.time.Instant;

public record SshKeyResponse(
        String name,
        String fingerprint,
        Instant uploadedAt
) {
}
