package com.mlops.hub.controller;

import com.mlops.hub.service.RayService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.util.Map;

@RestController
@RequestMapping("/api/ray")
public class RayController {

    @Autowired
    private RayService rayService;

    @GetMapping("/cluster/status")
    public Mono<ResponseEntity<Map>> getClusterStatus() {
        return rayService.getClusterStatus()
                .map(ResponseEntity::ok);
    }

    @GetMapping("/jobs")
    public Mono<ResponseEntity<Map>> getJobs() {
        return rayService.getJobs()
                .map(ResponseEntity::ok);
    }

    @GetMapping("/jobs/{jobId}")
    public Mono<ResponseEntity<Map>> getJob(@PathVariable String jobId) {
        return rayService.getJob(jobId)
                .map(ResponseEntity::ok);
    }

    @GetMapping("/actors")
    public Mono<ResponseEntity<Map>> getActors() {
        return rayService.getActors()
                .map(ResponseEntity::ok);
    }

    @GetMapping("/actors/{actorId}")
    public Mono<ResponseEntity<Map>> getActor(@PathVariable String actorId) {
        return rayService.getActor(actorId)
                .map(ResponseEntity::ok);
    }

    @GetMapping("/tasks")
    public Mono<ResponseEntity<Map>> getTasks() {
        return rayService.getTasks()
                .map(ResponseEntity::ok);
    }

    @GetMapping("/tasks/{taskId}")
    public Mono<ResponseEntity<Map>> getTask(@PathVariable String taskId) {
        return rayService.getTask(taskId)
                .map(ResponseEntity::ok);
    }

    @GetMapping("/nodes")
    public Mono<ResponseEntity<Map>> getNodes() {
        return rayService.getNodes()
                .map(ResponseEntity::ok);
    }
}
