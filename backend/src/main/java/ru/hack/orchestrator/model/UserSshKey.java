package ru.hack.orchestrator.model;

import java.time.Instant;

public record UserSshKey(
        String name,
        String publicKey,
        String fingerprint,
        Instant uploadedAt
) {
}
