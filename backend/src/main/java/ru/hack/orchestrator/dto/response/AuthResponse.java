package ru.hack.orchestrator.dto.response;

public record AuthResponse(
        String token,
        UserResponse user
) {
}
