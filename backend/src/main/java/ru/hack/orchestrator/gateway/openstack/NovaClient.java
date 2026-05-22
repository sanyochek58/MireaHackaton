package ru.hack.orchestrator.gateway.openstack;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import ru.hack.orchestrator.config.OpenStackProperties;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

@Repository
@RequiredArgsConstructor
public class NovaClient {

    private final OpenStackRequestExecutor requestExecutor;
    private final OpenStackProperties properties;

    public OpenStackKeyInfo importPublicKey(String keyName, String publicKey) {
        Map<String, Object> payload = Map.of(
                "keypair", Map.of(
                        "name", keyName,
                        "public_key", publicKey
                )
        );
        String url = properties.baseUrl() + ":8774/v2.1/" + properties.projectId() + "/os-keypairs";
        JsonNode response = requestExecutor.post(url, payload);
        JsonNode keyNode = response.path("keypair");
        return new OpenStackKeyInfo(
                keyNode.path("name").asText(),
                keyNode.path("fingerprint").asText(),
                keyNode.path("public_key").asText()
        );
    }

    public OpenStackLimitsInfo getLimits() {
        String url = properties.baseUrl() + ":8774/v2.1/" + properties.projectId() + "/limits";
        JsonNode response = requestExecutor.get(url);
        JsonNode absolute = response.path("limits").path("absolute");
        return new OpenStackLimitsInfo(
                absolute.path("maxTotalCores").asInt(1),
                absolute.path("totalCoresUsed").asInt(0),
                absolute.path("maxTotalRAMSize").asInt(1024),
                absolute.path("totalRAMUsed").asInt(0),
                absolute.path("maxTotalInstances").asInt(-1),
                absolute.path("totalInstancesUsed").asInt(0)
        );
    }

    public List<OpenStackServerInfo> listServers() {
        String url = properties.baseUrl() + ":8774/v2.1/" + properties.projectId() + "/servers/detail";
        JsonNode response = requestExecutor.get(url);
        JsonNode serversNode = response.path("servers");
        if (!serversNode.isArray()) {
            return List.of();
        }
        List<OpenStackServerInfo> servers = new ArrayList<>();
        for (JsonNode serverNode : serversNode) {
            servers.add(parseServer(serverNode));
        }
        return servers;
    }

    public OpenStackServerInfo createServer(
            String serverName,
            String flavorId,
            String networkId,
            String securityGroup,
            String keyName,
            String volumeId
    ) {
        Map<String, Object> payload = Map.of(
                "server", Map.of(
                        "name", serverName,
                        "flavorRef", flavorId,
                        "networks", new Object[]{Map.of("uuid", networkId)},
                        "security_groups", new Object[]{Map.of("name", securityGroup)},
                        "key_name", keyName,
                        "block_device_mapping_v2", new Object[]{
                                Map.of(
                                        "uuid", volumeId,
                                        "source_type", "volume",
                                        "destination_type", "volume",
                                        "boot_index", 0,
                                        "delete_on_termination", false
                                )
                        }
                )
        );
        String url = properties.baseUrl() + ":8774/v2.1/" + properties.projectId() + "/servers";
        JsonNode response = requestExecutor.post(url, payload);
        return parseServer(response.path("server"));
    }

    public OpenStackServerInfo getServer(String serverId) {
        String url = properties.baseUrl() + ":8774/v2.1/" + properties.projectId() + "/servers/" + serverId;
        JsonNode response = requestExecutor.get(url);
        return parseServer(response.path("server"));
    }

    public void deleteServer(String serverId) {
        String url = properties.baseUrl() + ":8774/v2.1/" + properties.projectId() + "/servers/" + serverId;
        requestExecutor.delete(url);
    }

    private OpenStackServerInfo parseServer(JsonNode serverNode) {
        String id = serverNode.path("id").asText();
        String name = serverNode.path("name").asText();
        String status = serverNode.path("status").asText();
        if (id == null || id.isBlank()) {
            throw new OpenStackException("Nova response does not contain server id");
        }
        Integer vcpus = serverNode.path("vcpus").isMissingNode() ? null : serverNode.path("vcpus").asInt();
        Integer ramMb = serverNode.path("memory_mb").isMissingNode() ? null : serverNode.path("memory_mb").asInt();
        return new OpenStackServerInfo(
                id,
                name,
                status,
                extractFirstIp(serverNode.path("addresses")),
                vcpus,
                ramMb
        );
    }

    private String extractFirstIp(JsonNode addressesNode) {
        if (addressesNode == null || addressesNode.isMissingNode() || !addressesNode.isObject()) {
            return null;
        }
        Iterator<JsonNode> networks = addressesNode.elements();
        while (networks.hasNext()) {
            JsonNode networkArray = networks.next();
            if (!networkArray.isArray()) {
                continue;
            }
            for (JsonNode address : networkArray) {
                String ip = address.path("addr").asText(null);
                if (ip != null && !ip.isBlank()) {
                    return ip;
                }
            }
        }
        return null;
    }
}
