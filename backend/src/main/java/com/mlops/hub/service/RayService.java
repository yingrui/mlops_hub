package com.mlops.hub.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.Map;

@Service
public class RayService {

    @Autowired
    private WebClient rayWebClient;

    public Mono<Map> getClusterStatus() {
        return rayWebClient.get()
                .uri("/api/cluster_status")
                .retrieve()
                .bodyToMono(Map.class);
    }

    public Mono<Map> getJobs() {
        return rayWebClient.get()
                .uri("/api/jobs")
                .retrieve()
                .bodyToMono(Map.class);
    }

    public Mono<Map> getJob(String jobId) {
        return rayWebClient.get()
                .uri("/api/jobs/{jobId}", jobId)
                .retrieve()
                .bodyToMono(Map.class);
    }

    public Mono<Map> getActors() {
        return rayWebClient.get()
                .uri("/api/actors")
                .retrieve()
                .bodyToMono(Map.class);
    }

    public Mono<Map> getActor(String actorId) {
        return rayWebClient.get()
                .uri("/api/actors/{actorId}", actorId)
                .retrieve()
                .bodyToMono(Map.class);
    }

    public Mono<Map> getTasks() {
        return rayWebClient.get()
                .uri("/api/tasks")
                .retrieve()
                .bodyToMono(Map.class);
    }

    public Mono<Map> getTask(String taskId) {
        return rayWebClient.get()
                .uri("/api/tasks/{taskId}", taskId)
                .retrieve()
                .bodyToMono(Map.class);
    }

    public Mono<Map> getNodes() {
        return rayWebClient.get()
                .uri("/api/nodes")
                .retrieve()
                .bodyToMono(Map.class);
    }
}
