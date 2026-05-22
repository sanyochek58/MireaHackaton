package ru.hack.orchestrator.gateway.openstack;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import ru.hack.orchestrator.config.OpenStackProperties;

import java.util.Map;

@Repository
@RequiredArgsConstructor
public class CinderClient {

    private final OpenStackRequestExecutor requestExecutor;
    private final OpenStackProperties properties;

    public OpenStackVolumeInfo createBootableVolume(String name, int sizeGb, String imageId) {
        Map<String, Object> payload = Map.of(
                "volume", Map.of(
                        "name", name,
                        "size", sizeGb,
                        "imageRef", imageId,
                        "bootable", true
                )
        );
        String url = properties.baseUrl() + ":8776/v3/" + properties.projectId() + "/volumes";
        JsonNode response = requestExecutor.post(url, payload);
        return parseVolume(response.path("volume"));
    }

    public OpenStackVolumeInfo getVolume(String volumeId) {
        String url = properties.baseUrl() + ":8776/v3/" + properties.projectId() + "/volumes/" + volumeId;
        JsonNode response = requestExecutor.get(url);
        return parseVolume(response.path("volume"));
    }

    public void deleteVolume(String volumeId) {
        String url = properties.baseUrl() + ":8776/v3/" + properties.projectId() + "/volumes/" + volumeId;
        requestExecutor.delete(url);
    }

    private OpenStackVolumeInfo parseVolume(JsonNode volumeNode) {
        String id = volumeNode.path("id").asText();
        String status = volumeNode.path("status").asText();
        String name = volumeNode.path("name").asText();
        if (id == null || id.isBlank()) {
            throw new OpenStackException("Cinder response does not contain volume id");
        }
        return new OpenStackVolumeInfo(id, name, status);
    }
}
