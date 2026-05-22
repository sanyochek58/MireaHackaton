package ru.hack.orchestrator.security;

import ru.hack.orchestrator.model.UserRecordEntity;

import java.util.UUID;

public record AppUser(
        UUID id,
        String email,
        String fullName,
        String passwordHash,
        String role
) {
    public UserRecordEntity toEntity() {
        return new UserRecordEntity(id, email, fullName, passwordHash, role);
    }

    public static AppUser fromEntity(UserRecordEntity entity) {
        return new AppUser(
                entity.getId(),
                entity.getEmail(),
                entity.getFullName(),
                entity.getPasswordHash(),
                entity.getRole()
        );
    }
}
