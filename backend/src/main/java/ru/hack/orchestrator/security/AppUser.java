package ru.hack.orchestrator.security;

import java.util.UUID;

public record AppUser(
        UUID id,
        String email,
        String fullName,
        String passwordHash,
        String role
) {
}
