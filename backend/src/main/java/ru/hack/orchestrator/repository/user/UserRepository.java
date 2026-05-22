package ru.hack.orchestrator.repository.user;

import ru.hack.orchestrator.security.AppUser;

import java.util.Optional;

public interface UserRepository {
    AppUser save(AppUser user);
    Optional<AppUser> findByEmail(String email);
    boolean existsByEmail(String email);
}
