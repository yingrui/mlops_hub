package com.mlops.hub.service;

import com.mlops.hub.config.KeycloakConfig;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Map;

@Service
public class KeycloakService {

    @Autowired
    private KeycloakConfig keycloakConfig;

    @Autowired
    private WebClient.Builder webClientBuilder;

    private final RestTemplate restTemplate = new RestTemplate();

    @SuppressWarnings("unchecked")
    public String getAdminToken() {
        String tokenUrl = keycloakConfig.getTokenUrl();
        
        HttpHeaders headers = new HttpHeaders();
        headers.set("Content-Type", "application/x-www-form-urlencoded");
        
        String body = "grant_type=client_credentials&client_id=admin-cli&client_secret=" + keycloakConfig.getClientSecret();
        
        HttpEntity<String> request = new HttpEntity<>(body, headers);
        
        ResponseEntity<Map> response = restTemplate.postForEntity(tokenUrl, request, Map.class);
        
        if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
            return (String) response.getBody().get("access_token");
        }
        
        throw new RuntimeException("Failed to get admin token");
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> getUserInfo(String token) {
        String userInfoUrl = keycloakConfig.getUserInfoUrl();
        
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        
        HttpEntity<String> request = new HttpEntity<>(headers);
        
        ResponseEntity<Map> response = restTemplate.exchange(
            userInfoUrl, 
            HttpMethod.GET, 
            request, 
            Map.class
        );
        
        if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
            return response.getBody();
        }
        
        throw new RuntimeException("Failed to get user info");
    }

    public WebClient getKeycloakWebClient() {
        return webClientBuilder
                .baseUrl(keycloakConfig.getRealmUrl())
                .build();
    }

    public String getRealmUrl() {
        return keycloakConfig.getRealmUrl();
    }

    public String getLogoutUrl() {
        return keycloakConfig.getLogoutUrl();
    }
}
