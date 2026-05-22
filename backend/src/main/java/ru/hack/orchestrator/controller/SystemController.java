package ru.hack.orchestrator.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import ru.hack.orchestrator.dto.response.MetricsHistoryPointResponse;
import ru.hack.orchestrator.dto.response.SystemImageResponse;
import ru.hack.orchestrator.dto.response.SystemLimitsResponse;
import ru.hack.orchestrator.dto.response.SystemMetricsResponse;
import ru.hack.orchestrator.service.SystemService;

import java.util.List;

@RestController
@RequestMapping("/api/system")
@RequiredArgsConstructor
public class SystemController {

    private final SystemService systemService;

    @GetMapping("/metrics")
    public SystemMetricsResponse metrics() {
        return systemService.getSystemMetrics();
    }

    @GetMapping("/metrics/history")
    public List<MetricsHistoryPointResponse> metricsHistory(
            @RequestParam(value = "range", required = false) String range
    ) {
        return systemService.getMetricsHistory(range);
    }

    @GetMapping("/limits")
    public SystemLimitsResponse limits() {
        return systemService.getLimits();
    }

    @GetMapping("/images")
    public List<SystemImageResponse> images() {
        return systemService.getImages();
    }
}
