package com.mlops.hub.controller;

import com.mlops.hub.service.MLflowFacadeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.util.Map;

@RestController
@RequestMapping("/api/runs")
@CrossOrigin(origins = "*")
public class RunController {

    @Autowired
    private MLflowFacadeService mlflowFacadeService;

    // Run endpoints
    @GetMapping("/{runId}")
    public Mono<ResponseEntity<Map>> getRun(@PathVariable String runId) {
        return mlflowFacadeService.getRun(runId)
                .map(ResponseEntity::ok)
                .onErrorReturn(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Mono<ResponseEntity<Map>> createRun(@RequestBody Map<String, String> request) {
        String experimentId = request.get("experiment_id");
        return mlflowFacadeService.createRun(experimentId)
                .map(runId -> {
                    Map<String, String> response = Map.of("run_id", runId);
                    return ResponseEntity.ok((Map) response);
                })
                .onErrorReturn(ResponseEntity.badRequest().build());
    }

    @PutMapping("/{runId}")
    public Mono<ResponseEntity<Map>> updateRun(@PathVariable String runId, @RequestBody Map<String, String> request) {
        String status = request.get("status");
        String endTime = request.get("end_time");
        return mlflowFacadeService.updateRun(runId, status, endTime)
                .map(ResponseEntity::ok)
                .onErrorReturn(ResponseEntity.badRequest().build());
    }

    @DeleteMapping("/{runId}")
    public Mono<ResponseEntity<Map>> deleteRun(@PathVariable String runId) {
        return mlflowFacadeService.deleteRun(runId)
                .map(ResponseEntity::ok)
                .onErrorReturn(ResponseEntity.badRequest().build());
    }

    @PostMapping("/{runId}/restore")
    public Mono<ResponseEntity<Map>> restoreRun(@PathVariable String runId) {
        return mlflowFacadeService.restoreRun(runId)
                .map(ResponseEntity::ok)
                .onErrorReturn(ResponseEntity.badRequest().build());
    }

    @GetMapping("/search")
    public Mono<ResponseEntity<Map>> searchRuns(@RequestParam(required = false) String experiment_ids,
                                               @RequestParam(required = false) String filter,
                                               @RequestParam(required = false) String run_view_type) {
        return mlflowFacadeService.searchRuns(experiment_ids, filter, run_view_type)
                .map(ResponseEntity::ok)
                .onErrorReturn(ResponseEntity.badRequest().build());
    }

    // Metric endpoints
    @PostMapping("/{runId}/metrics")
    public Mono<ResponseEntity<Void>> logMetric(@PathVariable String runId, @RequestBody Map<String, Object> request) {
        String key = (String) request.get("key");
        Double value = ((Number) request.get("value")).doubleValue();
        return mlflowFacadeService.logMetric(runId, key, value)
                .then(Mono.just(ResponseEntity.ok().<Void>build()))
                .onErrorReturn(ResponseEntity.badRequest().build());
    }

    @GetMapping("/{runId}/metrics/{metricKey}/history")
    public Mono<ResponseEntity<Map>> getMetricHistory(@PathVariable String runId, @PathVariable String metricKey) {
        return mlflowFacadeService.getMetricHistory(runId, metricKey)
                .map(ResponseEntity::ok)
                .onErrorReturn(ResponseEntity.badRequest().build());
    }

    // Parameter endpoints
    @PostMapping("/{runId}/parameters")
    public Mono<ResponseEntity<Void>> logParameter(@PathVariable String runId, @RequestBody Map<String, String> request) {
        String key = request.get("key");
        String value = request.get("value");
        return mlflowFacadeService.logParameter(runId, key, value)
                .then(Mono.just(ResponseEntity.ok().<Void>build()))
                .onErrorReturn(ResponseEntity.badRequest().build());
    }

    // Tag endpoints
    @PostMapping("/{runId}/tags")
    public Mono<ResponseEntity<Void>> setTag(@PathVariable String runId, @RequestBody Map<String, String> request) {
        String key = request.get("key");
        String value = request.get("value");
        return mlflowFacadeService.setTag(runId, key, value)
                .then(Mono.just(ResponseEntity.ok().<Void>build()))
                .onErrorReturn(ResponseEntity.badRequest().build());
    }

    @DeleteMapping("/{runId}/tags/{key}")
    public Mono<ResponseEntity<Void>> deleteTag(@PathVariable String runId, @PathVariable String key) {
        return mlflowFacadeService.deleteTag(runId, key)
                .then(Mono.just(ResponseEntity.ok().<Void>build()))
                .onErrorReturn(ResponseEntity.badRequest().build());
    }

    // Artifact endpoints
    @GetMapping("/{runId}/artifacts")
    public Mono<ResponseEntity<Map>> listArtifacts(@PathVariable String runId,
                                                   @RequestParam(required = false) String path,
                                                   @RequestParam(required = false) String pageToken) {
        return mlflowFacadeService.listArtifacts(runId, path, pageToken)
                .map(artifacts -> ResponseEntity.ok()
                        .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                        .body(artifacts))
                .onErrorResume(e -> Mono.just(ResponseEntity.internalServerError().build()));
    }

    @GetMapping("/{runId}/artifacts/download")
    public Mono<ResponseEntity<byte[]>> downloadArtifact(@PathVariable String runId,
                                                          @RequestParam String path) {
        return mlflowFacadeService.downloadArtifact(runId, path)
                .map(content -> ResponseEntity.ok()
                        .contentType(org.springframework.http.MediaType.APPLICATION_OCTET_STREAM)
                        .body(content))
                .onErrorResume(e -> Mono.just(ResponseEntity.internalServerError().build()));
    }
}
