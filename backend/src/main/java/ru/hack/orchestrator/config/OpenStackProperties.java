package ru.hack.orchestrator.config;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@ConfigurationProperties(prefix = "openstack")
@Validated
public record OpenStackProperties(
        @NotBlank String baseUrl,
        @NotBlank String projectId,
        @NotBlank String domain,
        @NotBlank String username,
        @NotBlank String password,
        @NotBlank String projectName,
        boolean insecureSsl,
        @NotBlank String defaultFlavorId,
        @NotBlank String defaultImageId,
        @NotBlank String defaultNetworkId,
        @NotBlank String defaultSecurityGroup,
        @Min(1) int defaultVolumeSizeGb,
        @Min(1) int pollIntervalSeconds,
        @Min(1) int maxPollAttempts
) {
}
