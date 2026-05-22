package ru.hack.orchestrator.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.hack.orchestrator.model.UserSshKeyEntity;
import ru.hack.orchestrator.model.UserSshKeyEntity.UserSshKeyId;

import java.util.List;

@Repository
public interface SshKeyRepository extends JpaRepository<UserSshKeyEntity, UserSshKeyId> {
    boolean existsByUserEmailAndKeyName(String userEmail, String keyName);
    List<UserSshKeyEntity> findAllByUserEmailOrderByUploadedAtDesc(String userEmail);
}
