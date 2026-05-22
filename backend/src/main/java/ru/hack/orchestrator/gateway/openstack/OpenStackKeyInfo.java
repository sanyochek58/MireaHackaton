package ru.hack.orchestrator.gateway.openstack;

public record OpenStackKeyInfo(
        String name,
        String fingerprint,
        String publicKey
) {
}
