package ru.hack.orchestrator.gateway.openstack;

public record OpenStackLimitsInfo(
        int maxTotalCores,
        int totalCoresUsed,
        int maxTotalRamMb,
        int totalRamUsedMb,
        int maxTotalInstances,
        int totalInstancesUsed
) {
}
