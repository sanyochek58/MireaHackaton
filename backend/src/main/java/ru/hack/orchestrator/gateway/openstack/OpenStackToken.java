package ru.hack.orchestrator.gateway.openstack;

import java.time.Instant;

public record OpenStackToken(String value, Instant expiresAt) {
    public boolean isExpired() {
        return expiresAt == null || Instant.now().isAfter(expiresAt.minusSeconds(60));
    }
}
