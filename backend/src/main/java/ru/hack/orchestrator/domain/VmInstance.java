package ru.hack.orchestrator.domain;

import ru.hack.orchestrator.model.VmRecordEntity;

import java.time.Instant;

public record VmInstance(
        String userEmail,
        String serverId,
        String volumeId,
        String name,
        String keyName,
        String flavorId,
        String imageId,
        String networkId,
        String status,
        String ipAddress,
        Integer cpu,
        Integer ramGb,
        Instant createdAt
) {
    public VmRecordEntity toEntity() {
        return new VmRecordEntity(
                userEmail == null ? null : userEmail.toLowerCase(),
                serverId,
                volumeId,
                name,
                keyName,
                flavorId,
                imageId,
                networkId,
                status,
                ipAddress,
                cpu,
                ramGb,
                createdAt
        );
    }

    public static VmInstance fromEntity(VmRecordEntity entity) {
        return new VmInstance(
                entity.getUserEmail(),
                entity.getServerId(),
                entity.getVolumeId(),
                entity.getName(),
                entity.getKeyName(),
                entity.getFlavorId(),
                entity.getImageId(),
                entity.getNetworkId(),
                entity.getStatus(),
                entity.getIpAddress(),
                entity.getCpu(),
                entity.getRamGb(),
                entity.getCreatedAt()
        );
    }
}
