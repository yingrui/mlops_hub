package com.mlops.hub.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/health")
public class HealthController {

    @Autowired
    private WebClient mlflowWebClient;

    @Autowired
    private WebClient rayWebClient;

    @GetMapping
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "UP");
        health.put("service", "MLOps Hub Backend");
        health.put("timestamp", System.currentTimeMillis());
        
        return ResponseEntity.ok(health);
    }

    @GetMapping("/mlflow")
    @SuppressWarnings("unchecked")
    public Mono<ResponseEntity<Map<String, Object>>> mlflowHealth() {
        return mlflowWebClient.get()
                .uri("/health")
                .retrieve()
                .bodyToMono(Map.class)
                .map(response -> ResponseEntity.ok((Map<String, Object>) response))
                .onErrorReturn(ResponseEntity.status(503).body(Map.of("status", "DOWN", "error", "MLflow service unavailable")));
    }

    @GetMapping("/ray")
    @SuppressWarnings("unchecked")
    public Mono<ResponseEntity<Map<String, Object>>> rayHealth() {
        return rayWebClient.get()
                .uri("/api/cluster_status")
                .retrieve()
                .bodyToMono(Map.class)
                .map(response -> ResponseEntity.ok((Map<String, Object>) response))
                .onErrorReturn(ResponseEntity.status(503).body(Map.of("status", "DOWN", "error", "Ray service unavailable")));
    }

    @GetMapping("/all")
    public Mono<ResponseEntity<Map<String, Object>>> allServicesHealth() {
        Map<String, Object> allHealth = new HashMap<>();
        allHealth.put("backend", Map.of("status", "UP"));
        
        return Mono.zip(
                mlflowHealth().map(ResponseEntity::getBody),
                rayHealth().map(ResponseEntity::getBody)
        ).map(tuple -> {
            allHealth.put("mlflow", tuple.getT1());
            allHealth.put("ray", tuple.getT2());
            return ResponseEntity.ok(allHealth);
        }).onErrorReturn(ResponseEntity.ok(allHealth));
    }
}
