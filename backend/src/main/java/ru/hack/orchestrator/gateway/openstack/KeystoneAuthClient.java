package ru.hack.orchestrator.gateway.openstack;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Repository;
import org.springframework.web.reactive.function.client.WebClient;
import ru.hack.orchestrator.config.OpenStackProperties;

import java.time.Instant;
import java.util.Map;

@Repository
@RequiredArgsConstructor
public class KeystoneAuthClient {

    private final WebClient openStackWebClient;
    private final OpenStackProperties properties;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public OpenStackToken authenticate() {
        Map<String, Object> payload = Map.of(
                "auth", Map.of(
                        "identity", Map.of(
                                "methods", new String[]{"password"},
                                "password", Map.of(
                                        "user", Map.of(
                                                "name", properties.username(),
                                                "domain", Map.of("name", properties.domain()),
                                                "password", properties.password()
                                        )
                                )
                        ),
                        "scope", Map.of(
                                "project", Map.of(
                                        "name", properties.projectName(),
                                        "domain", Map.of("name", properties.domain())
                                )
                        )
                )
        );

        return openStackWebClient.post()
                .uri(properties.baseUrl() + ":5000/v3/auth/tokens")
                .bodyValue(payload)
                .exchangeToMono(response -> {
                    HttpStatusCode status = response.statusCode();
                    if (status.isError()) {
                        return response.bodyToMono(String.class)
                                .defaultIfEmpty("")
                                .map(body -> {
                                    throw new OpenStackException("Keystone auth failed: HTTP " + status.value());
                                });
                    }
                    String token = response.headers().asHttpHeaders().getFirst("X-Subject-Token");
                    return response.bodyToMono(String.class)
                            .map(rawBody -> {
                                if (token == null || token.isBlank()) {
                                    throw new OpenStackException("Keystone auth failed: token missing in response");
                                }
                                JsonNode body;
                                try {
                                    body = objectMapper.readTree(rawBody);
                                } catch (Exception exception) {
                                    throw new OpenStackException("Keystone auth failed: invalid JSON response", exception);
                                }
                                String expiresAtRaw = body.path("token").path("expires_at").asText(null);
                                Instant expiresAt = expiresAtRaw == null ? Instant.now().plusSeconds(6 * 3600) : Instant.parse(expiresAtRaw);
                                return new OpenStackToken(token, expiresAt);
                            });
                })
                .blockOptional()
                .orElseThrow(() -> new OpenStackException("Keystone auth failed: empty response"));
    }
}
