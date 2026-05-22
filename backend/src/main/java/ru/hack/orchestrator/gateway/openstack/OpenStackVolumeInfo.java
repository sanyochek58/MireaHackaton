package ru.hack.orchestrator.gateway.openstack;

public record OpenStackVolumeInfo(
        String id,
        String name,
        String status
) {
}
