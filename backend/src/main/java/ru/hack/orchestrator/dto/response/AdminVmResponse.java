package ru.hack.orchestrator.dto.response;

public record AdminVmResponse(
        String id,
        String userId,
        String userName,
        String name,
        String state,
        String ip,
        int cpu,
        int ramGb
) {
}
