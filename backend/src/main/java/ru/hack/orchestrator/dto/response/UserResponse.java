package ru.hack.orchestrator.dto.response;

public record UserResponse(
        String id,
        String email,
        String fullName,
        String role
) {
}
