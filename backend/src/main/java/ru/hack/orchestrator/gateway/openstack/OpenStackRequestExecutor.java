package ru.hack.orchestrator.gateway.openstack;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Repository;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientRequestException;
import org.springframework.web.reactive.function.client.WebClientResponseException;

@Repository
@RequiredArgsConstructor
public class OpenStackRequestExecutor {

    private final WebClient openStackWebClient;
    private final OpenStackTokenService tokenService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public JsonNode get(String url) {
        return executeJson(HttpMethod.GET, url, null);
    }

    public JsonNode post(String url, Object body) {
        return executeJson(HttpMethod.POST, url, body);
    }

    public void delete(String url) {
        executeVoid(HttpMethod.DELETE, url, null);
    }

    private JsonNode executeJson(HttpMethod method, String url, Object body) {
        try {
            return doExecuteJson(method, url, body);
        } catch (WebClientResponseException.Unauthorized e) {
            tokenService.refresh();
            return doExecuteJson(method, url, body);
        } catch (WebClientResponseException e) {
            throw toOpenStackException(e);
        } catch (WebClientRequestException e) {
            throw toOpenStackConnectivityException(e);
        }
    }

    private void executeVoid(HttpMethod method, String url, Object body) {
        try {
            doExecuteVoid(method, url, body);
        } catch (WebClientResponseException.Unauthorized e) {
            tokenService.refresh();
            doExecuteVoid(method, url, body);
        } catch (WebClientResponseException e) {
            throw toOpenStackException(e);
        } catch (WebClientRequestException e) {
            throw toOpenStackConnectivityException(e);
        }
    }

    private JsonNode doExecuteJson(HttpMethod method, String url, Object body) {
        WebClient.RequestBodySpec request = openStackWebClient.method(method)
                .uri(url)
                .header("X-Auth-Token", tokenService.currentToken().value());
        String responseBody;
        if (body != null) {
            responseBody = request.bodyValue(body)
                    .retrieve()
                    .bodyToMono(String.class)
                    .blockOptional()
                    .orElseThrow(() -> new OpenStackException("OpenStack returned empty response for " + method + " " + url));
            return parseJson(responseBody, method, url);
        }
        responseBody = request.retrieve()
                .bodyToMono(String.class)
                .blockOptional()
                .orElseThrow(() -> new OpenStackException("OpenStack returned empty response for " + method + " " + url));
        return parseJson(responseBody, method, url);
    }

    private void doExecuteVoid(HttpMethod method, String url, Object body) {
        WebClient.RequestBodySpec request = openStackWebClient.method(method)
                .uri(url)
                .header("X-Auth-Token", tokenService.currentToken().value());
        if (body != null) {
            request.bodyValue(body)
                    .retrieve()
                    .toBodilessEntity()
                    .block();
            return;
        }
        request.retrieve().toBodilessEntity().block();
    }

    private OpenStackException toOpenStackException(WebClientResponseException e) {
        String body = e.getResponseBodyAsString();
        String userFriendlyMessage = extractQuotaMessage(e.getStatusCode().value(), body);
        if (userFriendlyMessage != null) {
            return new OpenStackException(userFriendlyMessage, e);
        }
        if (body != null && body.length() > 280) {
            body = body.substring(0, 280) + "...";
        }
        String suffix = (body == null || body.isBlank()) ? "" : (" | " + body);
        return new OpenStackException("OpenStack request failed: HTTP " + e.getStatusCode().value() + suffix, e);
    }

    private OpenStackException toOpenStackConnectivityException(WebClientRequestException e) {
        String message = e.getMessage();
        if (message != null && message.length() > 280) {
            message = message.substring(0, 280) + "...";
        }
        String suffix = (message == null || message.isBlank()) ? "" : (" | " + message);
        return new OpenStackException("OpenStack request failed: network/connectivity error" + suffix, e);
    }

    private JsonNode parseJson(String rawBody, HttpMethod method, String url) {
        try {
            return objectMapper.readTree(rawBody);
        } catch (Exception exception) {
            throw new OpenStackException(
                    "OpenStack returned invalid JSON for " + method + " " + url,
                    exception
            );
        }
    }

    private String extractQuotaMessage(int status, String body) {
        if (status != 413 || body == null || body.isBlank()) {
            return null;
        }
        try {
            JsonNode root = objectMapper.readTree(body);
            JsonNode overLimit = root.path("overLimit");
            String message = overLimit.path("message").asText("");
            if (!message.contains("VolumeSizeExceedsAvailableQuota")) {
                return null;
            }
            Integer requested = extractIntAfter(message, "Requested ", "G");
            Integer quota = extractIntAfter(message, "quota is ", "G");
            Integer consumed = extractIntAfter(message, "and ", "G has been consumed");
            if (requested == null || quota == null || consumed == null) {
                return "Недостаточно дисковой квоты OpenStack для создания тома.";
            }
            int available = Math.max(0, quota - consumed);
            return "Недостаточно дисковой квоты OpenStack: запрошено "
                    + requested
                    + "G, доступно "
                    + available
                    + "G (квота "
                    + quota
                    + "G, занято "
                    + consumed
                    + "G).";
        } catch (Exception ignored) {
            return "Недостаточно дисковой квоты OpenStack для создания тома.";
        }
    }

    private Integer extractIntAfter(String source, String prefix, String suffix) {
        int from = source.indexOf(prefix);
        if (from < 0) {
            return null;
        }
        from += prefix.length();
        int to = source.indexOf(suffix, from);
        if (to < 0 || to <= from) {
            return null;
        }
        String value = source.substring(from, to).trim();
        try {
            return Integer.parseInt(value);
        } catch (NumberFormatException exception) {
            return null;
        }
    }
}
