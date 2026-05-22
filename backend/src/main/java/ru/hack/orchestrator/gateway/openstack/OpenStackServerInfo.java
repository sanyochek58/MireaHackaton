package ru.hack.orchestrator.gateway.openstack;

public record OpenStackServerInfo(
        String id,
        String name,
        String status,
        String ipAddress,
        Integer vcpus,
        Integer ramMb
) {
}
