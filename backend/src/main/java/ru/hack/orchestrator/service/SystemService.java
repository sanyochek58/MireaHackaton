package ru.hack.orchestrator.service;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import ru.hack.orchestrator.config.SystemApiProperties;
import ru.hack.orchestrator.dto.response.MetricsHistoryPointResponse;
import ru.hack.orchestrator.dto.response.SystemImageResponse;
import ru.hack.orchestrator.dto.response.SystemLimitsResponse;
import ru.hack.orchestrator.dto.response.SystemMetricsResponse;
import ru.hack.orchestrator.gateway.openstack.GlanceClient;
import ru.hack.orchestrator.gateway.openstack.NovaClient;
import ru.hack.orchestrator.gateway.openstack.OpenStackImageInfo;
import ru.hack.orchestrator.gateway.openstack.OpenStackException;
import ru.hack.orchestrator.gateway.openstack.OpenStackLimitsInfo;
import ru.hack.orchestrator.model.SystemMetricsSnapshot;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.logging.Logger;

@Service
@RequiredArgsConstructor
public class SystemService {

    private static final int MB_IN_GB = 1024;
    private static final Logger LOGGER = Logger.getLogger(SystemService.class.getName());

    private final NovaClient novaClient;
    private final GlanceClient glanceClient;
    private final SystemApiProperties systemApiProperties;

    private final CopyOnWriteArrayList<SystemMetricsSnapshot> metricsHistory = new CopyOnWriteArrayList<>();

    @PostConstruct
    public void initMetricsHistory() {
        try {
            snapshotMetrics();
        } catch (RuntimeException ignored) {
            // При старте тестов/локальной разработки OpenStack может быть недоступен.
            metricsHistory.add(new SystemMetricsSnapshot(Instant.now(), 0, 0));
        }
    }

    @Scheduled(fixedDelayString = "${app.system.metrics-snapshot-interval-ms}")
    public void snapshotMetrics() {
        try {
            SystemMetricsResponse current = getSystemMetrics();
            metricsHistory.add(new SystemMetricsSnapshot(Instant.now(), current.cpuPercent(), current.ramPercent()));
            cleanupOldSnapshots();
        } catch (RuntimeException e) {
            LOGGER.warning("Не удалось обновить исторические метрики: " + e.getMessage());
        }
    }

    public SystemMetricsResponse getSystemMetrics() {
        try {
            OpenStackLimitsInfo limits = novaClient.getLimits();
            int cpuPercent = calculatePercent(limits.totalCoresUsed(), limits.maxTotalCores());
            int ramPercent = calculatePercent(limits.totalRamUsedMb(), limits.maxTotalRamMb());
            int activeStands = Math.max(0, limits.totalInstancesUsed());
            int maxStands = normalizeMaxInstances(limits.maxTotalInstances());
            boolean canProvision = limits.totalCoresUsed() < limits.maxTotalCores()
                    && limits.totalRamUsedMb() < limits.maxTotalRamMb();
            return new SystemMetricsResponse(cpuPercent, ramPercent, activeStands, maxStands, canProvision);
        } catch (OpenStackException e) {
            return new SystemMetricsResponse(0, 0, 0, systemApiProperties.maxStandsFallback(), true);
        }
    }

    public List<MetricsHistoryPointResponse> getMetricsHistory(String range) {
        Duration requestedRange = switch (range == null ? "" : range.trim().toLowerCase(Locale.ROOT)) {
            case "1h" -> Duration.ofHours(1);
            case "6h" -> Duration.ofHours(6);
            case "24h" -> Duration.ofHours(24);
            default -> Duration.ofHours(1);
        };
        Instant threshold = Instant.now().minus(requestedRange);
        List<SystemMetricsSnapshot> filtered = new ArrayList<>();
        for (SystemMetricsSnapshot snapshot : metricsHistory) {
            if (!snapshot.timestamp().isBefore(threshold)) {
                filtered.add(snapshot);
            }
        }
        filtered.sort(Comparator.comparing(SystemMetricsSnapshot::timestamp));
        return filtered.stream()
                .map(snapshot -> new MetricsHistoryPointResponse(
                        snapshot.timestamp(),
                        snapshot.cpuPercent(),
                        snapshot.ramPercent()
                ))
                .toList();
    }

    public SystemLimitsResponse getLimits() {
        int cpuMax = systemApiProperties.cpuMin();
        int ramMaxGb = systemApiProperties.ramMinGb();
        try {
            OpenStackLimitsInfo limits = novaClient.getLimits();
            cpuMax = Math.max(systemApiProperties.cpuMin(), limits.maxTotalCores());
            ramMaxGb = Math.max(1, (int) Math.ceil((double) limits.maxTotalRamMb() / MB_IN_GB));
        } catch (OpenStackException ignored) {
            // Возвращаем лимиты из конфигурации, если OpenStack временно недоступен.
        }
        return new SystemLimitsResponse(
                systemApiProperties.cpuMin(),
                cpuMax,
                systemApiProperties.ramMinGb(),
                Math.max(systemApiProperties.ramMinGb(), ramMaxGb),
                systemApiProperties.diskMinGb(),
                Math.max(systemApiProperties.diskMinGb(), systemApiProperties.diskMaxGb()),
                systemApiProperties.ttlMinHours(),
                Math.max(systemApiProperties.ttlMinHours(), systemApiProperties.ttlMaxHours()),
                Math.min(
                        Math.max(systemApiProperties.ttlDefaultHours(), systemApiProperties.ttlMinHours()),
                        Math.max(systemApiProperties.ttlMinHours(), systemApiProperties.ttlMaxHours())
                )
        );
    }

    public List<SystemImageResponse> getImages() {
        try {
            return glanceClient.listActivePublicImages().stream()
                    .map(this::mapImage)
                    .toList();
        } catch (OpenStackException e) {
            return List.of();
        }
    }

    private SystemImageResponse mapImage(OpenStackImageInfo image) {
        String normalized = image.osDistro() == null ? "" : image.osDistro().toLowerCase(Locale.ROOT);
        String family = normalized.contains("win") ? "windows" : "linux";
        String iconLabel = normalized.contains("win") ? "Win" : "Linux";
        int recommendedRamGb = Math.max(1, (int) Math.ceil((double) image.minRamMb() / MB_IN_GB));
        int recommendedCpu = family.equals("windows") ? 2 : 1;
        return new SystemImageResponse(
                image.id(),
                image.name(),
                family,
                "latest",
                "Образ из OpenStack Glance",
                iconLabel,
                Math.max(1, image.minDiskGb()),
                recommendedCpu,
                recommendedRamGb
        );
    }

    private int normalizeMaxInstances(int maxTotalInstances) {
        if (maxTotalInstances < 0) {
            return systemApiProperties.maxStandsFallback();
        }
        return Math.max(1, maxTotalInstances);
    }

    private int calculatePercent(int used, int max) {
        if (max <= 0) {
            return 0;
        }
        double ratio = (double) used / (double) max;
        int value = (int) Math.round(ratio * 100.0);
        return Math.max(0, Math.min(100, value));
    }

    private void cleanupOldSnapshots() {
        Instant threshold = Instant.now().minus(Duration.ofHours(systemApiProperties.metricsHistoryRetentionHours()));
        metricsHistory.removeIf(snapshot -> snapshot.timestamp().isBefore(threshold));
    }
}
