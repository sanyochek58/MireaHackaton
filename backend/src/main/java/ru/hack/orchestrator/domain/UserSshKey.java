package ru.hack.orchestrator.domain;

import ru.hack.orchestrator.model.UserSshKeyEntity;

import java.time.Instant;

public record UserSshKey(
        String name,
        String publicKey,
        String fingerprint,
        Instant uploadedAt
) {
    public UserSshKeyEntity toEntity(String userEmail) {
        return new UserSshKeyEntity(
                userEmail == null ? null : userEmail.toLowerCase(),
                name,
                publicKey,
                fingerprint,
                uploadedAt
        );
    }

    public static UserSshKey fromEntity(UserSshKeyEntity entity) {
        return new UserSshKey(
                entity.getKeyName(),
                entity.getPublicKey(),
                entity.getFingerprint(),
                entity.getUploadedAt()
        );
    }
}
