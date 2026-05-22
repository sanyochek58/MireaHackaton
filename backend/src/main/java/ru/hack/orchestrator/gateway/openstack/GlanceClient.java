package ru.hack.orchestrator.gateway.openstack;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import ru.hack.orchestrator.config.OpenStackProperties;

import java.util.ArrayList;
import java.util.List;

@Repository
@RequiredArgsConstructor
public class GlanceClient {

    private final OpenStackRequestExecutor requestExecutor;
    private final OpenStackProperties properties;

    public List<OpenStackImageInfo> listActivePublicImages() {
        String url = properties.baseUrl() + ":9292/v2/images?status=active";
        JsonNode response = requestExecutor.get(url);
        List<OpenStackImageInfo> images = new ArrayList<>();
        for (JsonNode imageNode : response.path("images")) {
            String visibility = imageNode.path("visibility").asText("");
            if (!"public".equalsIgnoreCase(visibility)) {
                continue;
            }
            String id = imageNode.path("id").asText("");
            if (id.isBlank()) {
                continue;
            }
            images.add(new OpenStackImageInfo(
                    id,
                    imageNode.path("name").asText("Unnamed image"),
                    imageNode.path("os_distro").asText(""),
                    imageNode.path("min_disk").asInt(1),
                    imageNode.path("min_ram").asInt(1024)
            ));
        }
        return images;
    }
}
