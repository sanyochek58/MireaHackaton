package ru.hack.orchestrator.repository.user;

import org.springframework.stereotype.Repository;
import ru.hack.orchestrator.security.AppUser;

import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Repository
public class InMemoryUserRepository implements UserRepository {
    private final Map<String, AppUser> usersByEmail = new ConcurrentHashMap<>();

    @Override
    public AppUser save(AppUser user) {
        usersByEmail.put(user.email().toLowerCase(), user);
        return user;
    }

    @Override
    public Optional<AppUser> findByEmail(String email) {
        if (email == null) {
            return Optional.empty();
        }
        return Optional.ofNullable(usersByEmail.get(email.toLowerCase()));
    }

    @Override
    public boolean existsByEmail(String email) {
        return email != null && usersByEmail.containsKey(email.toLowerCase());
    }
}
