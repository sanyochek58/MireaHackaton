package ru.hack.orchestrator.repository.vm;

import ru.hack.orchestrator.model.VmInstance;

import java.util.Optional;

public interface VmRepository {
    Optional<VmInstance> findByUserEmail(String userEmail);
    VmInstance save(VmInstance vmInstance);
    void deleteByUserEmail(String userEmail);
}
