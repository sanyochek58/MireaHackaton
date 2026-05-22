package ru.hack.orchestrator.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.reactive.function.client.WebClient;
import io.netty.handler.ssl.SslContext;
import io.netty.handler.ssl.SslContextBuilder;
import io.netty.handler.ssl.util.InsecureTrustManagerFactory;
import ru.hack.orchestrator.gateway.openstack.OpenStackException;
import reactor.netty.http.client.HttpClient;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;

import java.time.Duration;

@Configuration
@RequiredArgsConstructor
public class OpenStackClientConfig {

    private final OpenStackProperties openStackProperties;

    @Bean
    public WebClient openStackWebClient() {
        HttpClient httpClient = HttpClient.create().responseTimeout(Duration.ofSeconds(60));
        if (openStackProperties.insecureSsl()) {
            try {
                SslContext sslContext = SslContextBuilder.forClient()
                        .trustManager(InsecureTrustManagerFactory.INSTANCE)
                        .build();
                httpClient = httpClient.secure(sslSpec -> sslSpec.sslContext(sslContext));
            } catch (Exception exception) {
                throw new OpenStackException("Failed to configure insecure SSL for OpenStack client", exception);
            }
        }

        return WebClient.builder()
                .clientConnector(new ReactorClientHttpConnector(httpClient))
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .build();
    }
}
