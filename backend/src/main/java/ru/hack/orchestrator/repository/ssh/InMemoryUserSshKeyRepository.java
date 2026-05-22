package ru.hack.orchestrator.repository.ssh;

import org.springframework.stereotype.Repository;
import ru.hack.orchestrator.model.UserSshKey;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Repository
public class InMemoryUserSshKeyRepository implements UserSshKeyRepository {

    private final Map<String, Map<String, UserSshKey>> storage = new ConcurrentHashMap<>();

    @Override
    public boolean exists(String userEmail, String keyName) {
        if (userEmail == null || keyName == null) {
            return false;
        }
        return storage.getOrDefault(userEmail.toLowerCase(), Map.of()).containsKey(keyName);
    }

    @Override
    public UserSshKey save(String userEmail, UserSshKey key) {
        String normalizedUserEmail = userEmail.toLowerCase();
        storage.putIfAbsent(normalizedUserEmail, new ConcurrentHashMap<>());
        storage.get(normalizedUserEmail).put(key.name(), key);
        return key;
    }

    @Override
    public List<UserSshKey> findAllByUserEmail(String userEmail) {
        if (userEmail == null) {
            return List.of();
        }
        return storage.getOrDefault(userEmail.toLowerCase(), Map.of())
                .values()
                .stream()
                .sorted(Comparator.comparing(UserSshKey::uploadedAt).reversed())
                .toList();
    }
}
