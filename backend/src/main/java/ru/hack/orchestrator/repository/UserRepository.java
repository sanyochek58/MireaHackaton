package ru.hack.orchestrator.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.hack.orchestrator.model.UserRecordEntity;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<UserRecordEntity, UUID> {
    Optional<UserRecordEntity> findByEmail(String email);
    boolean existsByEmail(String email);
}
