package ru.hack.orchestrator.repository.vm;

import org.springframework.stereotype.Repository;
import ru.hack.orchestrator.model.VmInstance;

import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Repository
public class InMemoryVmRepository implements VmRepository {

    private final Map<String, VmInstance> storage = new ConcurrentHashMap<>();

    @Override
    public Optional<VmInstance> findByUserEmail(String userEmail) {
        if (userEmail == null) {
            return Optional.empty();
        }
        return Optional.ofNullable(storage.get(userEmail.toLowerCase()));
    }

    @Override
    public VmInstance save(VmInstance vmInstance) {
        storage.put(vmInstance.userEmail().toLowerCase(), vmInstance);
        return vmInstance;
    }

    @Override
    public void deleteByUserEmail(String userEmail) {
        if (userEmail != null) {
            storage.remove(userEmail.toLowerCase());
        }
    }
}
