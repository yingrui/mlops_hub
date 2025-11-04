package com.mlops.hub.controller;

import com.mlops.hub.service.MLflowFacadeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Collections;
import java.util.Comparator;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/data")
@CrossOrigin(origins = "*")
public class DataController {

    @Autowired
    private MLflowFacadeService mlflowFacadeService;

    // Enhanced experiment endpoints
    @GetMapping("/experiments")
    public Mono<ResponseEntity<Map>> getExperiments() {
        return mlflowFacadeService.getCachedExperiments()
                .map(ResponseEntity::ok)
                .onErrorReturn(ResponseEntity.internalServerError().build());
    }

    @GetMapping("/experiments/summary")
    public Mono<ResponseEntity<Map>> getExperimentsWithSummary() {
        return mlflowFacadeService.getExperimentsWithSummary()
                .map(ResponseEntity::ok)
                .onErrorReturn(ResponseEntity.internalServerError().build());
    }

    @GetMapping("/experiments/search")
    public Mono<ResponseEntity<Map>> searchExperimentsByName(@RequestParam String name) {
        return mlflowFacadeService.searchExperimentsByName(name)
                .map(ResponseEntity::ok)
                .onErrorReturn(ResponseEntity.badRequest().build());
    }

    // Enhanced run endpoints
    @GetMapping("/experiments/{experimentId}/runs")
    public Mono<ResponseEntity<Map>> getRunsWithMetrics(@PathVariable String experimentId) {
        return mlflowFacadeService.getRunsWithMetrics(experimentId)
                .map(ResponseEntity::ok)
                .onErrorReturn(ResponseEntity.badRequest().build());
    }

    @GetMapping("/experiments/{experimentId}/runs/search")
    public Mono<ResponseEntity<Map>> searchRunsByExperimentIdAndFilter(@PathVariable String experimentId, @RequestParam(required = false) String filter) {
        return mlflowFacadeService.searchRunsByStatus(experimentId, filter)
                .map(ResponseEntity::ok)
                .onErrorReturn(ResponseEntity.badRequest().build());
    }

    @GetMapping("/experiments/{experimentId}/runs/search-by-tag")
    public Mono<ResponseEntity<Map>> searchRunsByExperimentIdAndTag(@PathVariable String experimentId, @RequestParam String tagKey, @RequestParam String tagValue) {
        return mlflowFacadeService.searchRunsByTag(experimentId, tagKey, tagValue)
                .map(ResponseEntity::ok)
                .onErrorReturn(ResponseEntity.badRequest().build());
    }

    // Enhanced model endpoints
    @GetMapping("/models")
    public Mono<ResponseEntity<Map>> getRegisteredModels() {
        return mlflowFacadeService.getCachedRegisteredModels()
                .map(ResponseEntity::ok)
                .onErrorReturn(ResponseEntity.internalServerError().build());
    }

    @GetMapping("/models/{modelName}/versions")
    public Mono<ResponseEntity<Map>> getModelVersionsWithDetails(@PathVariable String modelName) {
        return mlflowFacadeService.getModelVersionsWithDetails(modelName)
                .map(ResponseEntity::ok)
                .onErrorReturn(ResponseEntity.badRequest().build());
    }

    @GetMapping("/models/{modelName}/versions/search")
    public Mono<ResponseEntity<Map>> searchModelVersionsByModelNameAndFilter(@PathVariable String modelName, @RequestParam(required = false) String filter) {
        // This would typically involve a searchModelVersions call in MLflowService
        // For now, we'll just return the details for the model versions
        return mlflowFacadeService.getModelVersionsWithDetails(modelName)
                .map(ResponseEntity::ok)
                .onErrorReturn(ResponseEntity.badRequest().build());
    }

    // Dashboard and analytics endpoints
    @GetMapping("/dashboard/overview")
    public Mono<ResponseEntity<Map>> getDashboardOverview() {
        return mlflowFacadeService.getCachedExperiments()
                .zipWith(mlflowFacadeService.getCachedRegisteredModels())
                .map(tuple -> {
                    Map experiments = tuple.getT1();
                    Map models = tuple.getT2();
                    
                    Map<String, Object> overview = new HashMap<>();
                    overview.put("total_experiments", getExperimentCount(experiments));
                    overview.put("total_models", getModelCount(models));
                    overview.put("recent_experiments", getRecentExperiments(experiments));
                    overview.put("recent_models", getRecentModels(models));
                    return ResponseEntity.ok((Map) overview);
                })
                .onErrorReturn(ResponseEntity.internalServerError().build());
    }

    @GetMapping("/dashboard/experiments/{experimentId}/metrics")
    public Mono<ResponseEntity<Map>> getExperimentMetricsOverview(@PathVariable String experimentId) {
        // This would aggregate metrics for a given experiment's runs
        // For now, return dummy data
        Map<String, Object> metricsOverview = new HashMap<>();
        metricsOverview.put("experiment_id", experimentId);
        metricsOverview.put("total_runs", 5);
        metricsOverview.put("avg_accuracy", 0.92);
        metricsOverview.put("avg_loss", 0.08);
        return Mono.just(ResponseEntity.ok(metricsOverview));
    }

    @GetMapping("/runs/{runId}/metrics")
    public Mono<ResponseEntity<Map>> getMetricsForRun(@PathVariable String runId, @RequestParam String metricKey) {
        // This would typically call a method in MLflowProxyService
        // For now, return a simple response
        Map<String, Object> response = new HashMap<>();
        response.put("run_id", runId);
        response.put("metric_key", metricKey);
        response.put("message", "Metrics endpoint - implementation needed");
        return Mono.just(ResponseEntity.ok(response));
    }

    // Helper methods for dashboard data
    private int getExperimentCount(Map<String, Object> experimentsResponse) {
        List<Map<String, Object>> experiments = (List<Map<String, Object>>) experimentsResponse.get("experiments");
        return experiments != null ? experiments.size() : 0;
    }

    private int getModelCount(Map<String, Object> modelsResponse) {
        List<Map<String, Object>> models = (List<Map<String, Object>>) modelsResponse.get("registered_models");
        return models != null ? models.size() : 0;
    }

    private List<Map<String, Object>> getRecentExperiments(Map<String, Object> experimentsResponse) {
        List<Map<String, Object>> experiments = (List<Map<String, Object>>) experimentsResponse.get("experiments");
        if (experiments == null) {
            return Collections.emptyList();
        }
        return experiments.stream()
                .sorted(Comparator.comparing((Map<String, Object> exp) -> (Long) exp.getOrDefault("creation_time", 0L)).reversed())
                .limit(5)
                .collect(Collectors.toList());
    }

    private List<Map<String, Object>> getRecentModels(Map<String, Object> modelsResponse) {
        List<Map<String, Object>> models = (List<Map<String, Object>>) modelsResponse.get("registered_models");
        if (models == null) {
            return Collections.emptyList();
        }
        return models.stream()
                .sorted(Comparator.comparing((Map<String, Object> model) -> (Long) model.getOrDefault("creation_timestamp", 0L)).reversed())
                .limit(5)
                .collect(Collectors.toList());
    }
}
