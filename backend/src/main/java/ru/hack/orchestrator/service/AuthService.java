package ru.hack.orchestrator.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import ru.hack.orchestrator.dto.request.LoginRequest;
import ru.hack.orchestrator.dto.request.RegisterRequest;
import ru.hack.orchestrator.dto.response.AuthResponse;
import ru.hack.orchestrator.dto.response.UserResponse;
import ru.hack.orchestrator.repository.UserRepository;
import ru.hack.orchestrator.security.AppUser;
import ru.hack.orchestrator.security.JwtService;

import java.util.UUID;

import static org.springframework.http.HttpStatus.CONFLICT;
import static org.springframework.http.HttpStatus.UNAUTHORIZED;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthResponse register(RegisterRequest request) {
        String normalizedEmail = request.email().trim().toLowerCase();
        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new ResponseStatusException(CONFLICT, "User with this email already exists");
        }
        AppUser user = new AppUser(
                UUID.randomUUID(),
                normalizedEmail,
                request.fullName().trim(),
                passwordEncoder.encode(request.password()),
                "student"
        );
        userRepository.save(user.toEntity());
        return toAuthResponse(user);
    }

    public AuthResponse login(LoginRequest request) {
        AppUser user = userRepository.findByEmail(request.email().trim().toLowerCase())
                .map(AppUser::fromEntity)
                .orElseThrow(() -> new ResponseStatusException(UNAUTHORIZED, "Invalid email or password"));
        if (!passwordEncoder.matches(request.password(), user.passwordHash())) {
            throw new ResponseStatusException(UNAUTHORIZED, "Invalid email or password");
        }
        return toAuthResponse(user);
    }

    private AuthResponse toAuthResponse(AppUser user) {
        String token = jwtService.generateToken(user);
        UserResponse response = new UserResponse(
                user.id().toString(),
                user.email(),
                user.fullName(),
                user.role()
        );
        return new AuthResponse(token, response);
    }
}
