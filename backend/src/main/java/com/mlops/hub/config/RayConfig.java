package com.mlops.hub.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class RayConfig {

    @Value("${ray.head-node-url}")
    private String headNodeUrl;

    @Value("${ray.dashboard-url}")
    private String dashboardUrl;

    @Bean
    public WebClient rayWebClient() {
        return WebClient.builder()
                .baseUrl(headNodeUrl)
                .build();
    }

    public String getDashboardUrl() {
        return dashboardUrl;
    }
}
