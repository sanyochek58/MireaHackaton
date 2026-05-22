package ru.hack.orchestrator.repository.ssh;

import ru.hack.orchestrator.model.UserSshKey;

import java.util.List;

public interface UserSshKeyRepository {
    boolean exists(String userEmail, String keyName);
    UserSshKey save(String userEmail, UserSshKey key);
    List<UserSshKey> findAllByUserEmail(String userEmail);
}
