package ru.hack.orchestrator.gateway.openstack;

public record OpenStackImageInfo(
        String id,
        String name,
        String osDistro,
        int minDiskGb,
        int minRamMb
) {
}
