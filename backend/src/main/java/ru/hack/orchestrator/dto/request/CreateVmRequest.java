package ru.hack.orchestrator.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

public record CreateVmRequest(
        @Size(min = 3, max = 64) String name,
        String keyName,
        String imageId,
        String flavorId,
        String networkId,
        String securityGroup,
        @Min(1) @Max(5000) Integer volumeSizeGb
) {
}
