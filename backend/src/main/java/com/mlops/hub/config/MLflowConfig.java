package com.mlops.hub.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class MLflowConfig {

    @Value("${mlflow.tracking-uri}")
    private String trackingUri;

    @Bean
    public WebClient mlflowWebClient() {
        return WebClient.builder()
                .baseUrl(trackingUri)
                .build();
    }
}
