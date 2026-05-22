package ru.hack.orchestrator.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import ru.hack.orchestrator.config.OpenStackProperties;
import ru.hack.orchestrator.dto.request.CreateVmRequest;
import ru.hack.orchestrator.dto.response.AdminVmResponse;
import ru.hack.orchestrator.gateway.openstack.CinderClient;
import ru.hack.orchestrator.gateway.openstack.NovaClient;
import ru.hack.orchestrator.gateway.openstack.OpenStackException;
import ru.hack.orchestrator.gateway.openstack.OpenStackServerInfo;
import ru.hack.orchestrator.gateway.openstack.OpenStackVolumeInfo;
import ru.hack.orchestrator.domain.VmInstance;
import ru.hack.orchestrator.repository.VmRepository;
import ru.hack.orchestrator.security.AppUser;

import java.time.Instant;
import java.util.List;
import java.util.regex.Pattern;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.CONFLICT;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
@RequiredArgsConstructor
public class VmService {

    private static final Pattern SERVER_NAME_PATTERN = Pattern.compile("^[A-Za-z0-9._\\-]{3,64}$");

    private final OpenStackProperties openStackProperties;
    private final CinderClient cinderClient;
    private final NovaClient novaClient;
    private final UserSshKeyService sshKeyService;
    private final VmRepository vmRepository;

    public VmInstance createVm(AppUser user, CreateVmRequest request) {
        VmInstance existing = vmRepository.findById(user.email().toLowerCase())
                .map(VmInstance::fromEntity)
                .orElse(null);
        if (existing != null && !"DELETED".equalsIgnoreCase(existing.status())) {
            throw new ResponseStatusException(CONFLICT, "You already have an active VM");
        }

        String keyName = sshKeyService.resolveKeyName(user, request.keyName());
        String vmName = normalizeServerName(request.name(), user.email());
        String flavorId = valueOrDefault(request.flavorId(), openStackProperties.defaultFlavorId());
        String imageId = valueOrDefault(request.imageId(), openStackProperties.defaultImageId());
        String networkId = valueOrDefault(request.networkId(), openStackProperties.defaultNetworkId());
        String securityGroup = valueOrDefault(request.securityGroup(), openStackProperties.defaultSecurityGroup());
        int volumeSizeGb = Math.max(
                request.volumeSizeGb() == null ? openStackProperties.defaultVolumeSizeGb() : request.volumeSizeGb(),
                openStackProperties.defaultVolumeSizeGb()
        );

        OpenStackVolumeInfo volume = null;
        OpenStackServerInfo activeServer;
        String serverId = null;
        try {
            String volumeName = vmName + "-boot";
            volume = cinderClient.createBootableVolume(volumeName, volumeSizeGb, imageId);
            waitForVolumeStatus(volume.id(), "available");

            OpenStackServerInfo server = novaClient.createServer(
                    vmName,
                    flavorId,
                    networkId,
                    securityGroup,
                    keyName,
                    volume.id()
            );
            serverId = server.id();
            activeServer = waitForServerActive(server.id());
        } catch (RuntimeException e) {
            cleanupFailedCreation(serverId, volume == null ? null : volume.id());
            throw e;
        }

        VmInstance vm = new VmInstance(
                user.email(),
                activeServer.id(),
                volume.id(),
                vmName,
                keyName,
                flavorId,
                imageId,
                networkId,
                activeServer.status(),
                activeServer.ipAddress(),
                activeServer.vcpus(),
                toRamGb(activeServer.ramMb()),
                Instant.now()
        );
        vmRepository.save(vm.toEntity());
        return vm;
    }

    public VmInstance getMyVm(AppUser user) {
        VmInstance vm = vmRepository.findById(user.email().toLowerCase())
                .map(VmInstance::fromEntity)
                .orElse(null);
        if (vm == null) {
            throw new ResponseStatusException(NOT_FOUND, "VM not found");
        }
        OpenStackServerInfo server = novaClient.getServer(vm.serverId());
        VmInstance refreshed = new VmInstance(
                vm.userEmail(),
                vm.serverId(),
                vm.volumeId(),
                vm.name(),
                vm.keyName(),
                vm.flavorId(),
                vm.imageId(),
                vm.networkId(),
                server.status(),
                server.ipAddress(),
                server.vcpus() == null ? vm.cpu() : server.vcpus(),
                server.ramMb() == null ? vm.ramGb() : toRamGb(server.ramMb()),
                vm.createdAt()
        );
        vmRepository.save(refreshed.toEntity());
        return refreshed;
    }

    public List<AdminVmResponse> listAdminVms() {
        return novaClient.listServers().stream()
                .map(server -> new AdminVmResponse(
                        server.id(),
                        "n/a",
                        "OpenStack user",
                        server.name(),
                        mapServerState(server.status()),
                        server.ipAddress() == null ? "—" : server.ipAddress(),
                        server.vcpus() == null ? 0 : server.vcpus(),
                        toRamGb(server.ramMb())
                ))
                .toList();
    }

    public void deleteMyVm(AppUser user) {
        VmInstance vm = vmRepository.findById(user.email().toLowerCase())
                .map(VmInstance::fromEntity)
                .orElse(null);
        if (vm == null) {
            throw new ResponseStatusException(NOT_FOUND, "VM not found");
        }

        novaClient.deleteServer(vm.serverId());
        waitForVolumeStatus(vm.volumeId(), "available");
        cinderClient.deleteVolume(vm.volumeId());

        vmRepository.deleteById(user.email().toLowerCase());
    }

    private OpenStackServerInfo waitForServerActive(String serverId) {
        int maxAttempts = openStackProperties.maxPollAttempts();
        for (int i = 0; i < maxAttempts; i++) {
            OpenStackServerInfo server = novaClient.getServer(serverId);
            if ("ACTIVE".equalsIgnoreCase(server.status())) {
                return server;
            }
            if ("ERROR".equalsIgnoreCase(server.status())) {
                throw new OpenStackException("VM creation failed: server entered ERROR state");
            }
            sleep();
        }
        throw new OpenStackException("VM creation timeout: server did not become ACTIVE");
    }

    private void waitForVolumeStatus(String volumeId, String targetStatus) {
        int maxAttempts = openStackProperties.maxPollAttempts();
        for (int i = 0; i < maxAttempts; i++) {
            OpenStackVolumeInfo volume = cinderClient.getVolume(volumeId);
            if (targetStatus.equalsIgnoreCase(volume.status())) {
                return;
            }
            if ("error".equalsIgnoreCase(volume.status()) || "error_deleting".equalsIgnoreCase(volume.status())) {
                throw new OpenStackException("Volume operation failed: status=" + volume.status());
            }
            sleep();
        }
        throw new OpenStackException("Volume operation timeout: status did not become " + targetStatus);
    }

    private void sleep() {
        try {
            Thread.sleep(openStackProperties.pollIntervalSeconds() * 1000L);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new OpenStackException("Polling interrupted", e);
        }
    }

    private String valueOrDefault(String value, String fallback) {
        return (value == null || value.isBlank()) ? fallback : value;
    }

    private String normalizeServerName(String requestedName, String userEmail) {
        String fallback = "vm-" + Math.abs(userEmail.hashCode());
        String value = requestedName == null || requestedName.isBlank() ? fallback : requestedName.trim();
        if (!SERVER_NAME_PATTERN.matcher(value).matches()) {
            throw new ResponseStatusException(BAD_REQUEST, "Invalid VM name format");
        }
        return value;
    }

    private void cleanupFailedCreation(String serverId, String volumeId) {
        try {
            if (serverId != null && !serverId.isBlank()) {
                novaClient.deleteServer(serverId);
            }
        } catch (RuntimeException ignored) {
        }
        try {
            if (volumeId != null && !volumeId.isBlank()) {
                waitForVolumeStatus(volumeId, "available");
                cinderClient.deleteVolume(volumeId);
            }
        } catch (RuntimeException ignored) {
        }
    }

    private int toRamGb(Integer ramMb) {
        if (ramMb == null || ramMb <= 0) {
            return 0;
        }
        return (int) Math.ceil((double) ramMb / 1024.0);
    }

    private String mapServerState(String status) {
        if (status == null) {
            return "deploying";
        }
        return switch (status.toUpperCase()) {
            case "ACTIVE" -> "ready";
            case "ERROR" -> "cleaning";
            default -> "deploying";
        };
    }
}
