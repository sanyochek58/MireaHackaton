package ru.hack.orchestrator.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.hack.orchestrator.model.VmRecordEntity;

@Repository
public interface VmRepository extends JpaRepository<VmRecordEntity, String> {
}
