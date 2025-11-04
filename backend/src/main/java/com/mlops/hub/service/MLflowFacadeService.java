package com.mlops.hub.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class MLflowFacadeService {

    @Autowired
    private WebClient mlflowWebClient;

    @Value("${mlflow.experiment-name}")
    private String experimentName;

    // ==================== BASIC MLFLOW OPERATIONS ====================

    // Experiment methods
    public Mono<String> createExperiment(String name) {
        return mlflowWebClient.post()
                .uri("/api/2.0/mlflow/experiments/create")
                .bodyValue(Map.of("name", name))
                .retrieve()
                .bodyToMono(Map.class)
                .map(response -> (String) response.get("experiment_id"));
    }

    public Mono<Map> getExperiment(String experimentId) {
        return mlflowWebClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/api/2.0/mlflow/experiments/get")
                        .queryParam("experiment_id", experimentId)
                        .build())
                .retrieve()
                .bodyToMono(Map.class);
    }

    public Mono<Map> getExperimentByName(String experimentName) {
        return mlflowWebClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/api/2.0/mlflow/experiments/get-by-name")
                        .queryParam("experiment_name", experimentName)
                        .build())
                .retrieve()
                .bodyToMono(Map.class);
    }

    public Mono<Map> listExperiments() {
        return mlflowWebClient.post()
                .uri("/api/2.0/mlflow/experiments/search")
                .bodyValue(Map.of("max_results", 100))
                .retrieve()
                .bodyToMono(Map.class)
                .doOnError(error -> System.err.println("MLflow API Error: " + error.getMessage()));
    }

    public Mono<Map> searchExperiments(String filter) {
        return mlflowWebClient.post()
                .uri("/api/2.0/mlflow/experiments/search")
                .bodyValue(Map.of(
                    "max_results", 100,
                    "filter", filter != null ? filter : ""
                ))
                .retrieve()
                .bodyToMono(Map.class);
    }

    public Mono<Map> updateExperiment(String experimentId, String newName) {
        return mlflowWebClient.post()
                .uri("/api/2.0/mlflow/experiments/update")
                .bodyValue(Map.of(
                        "experiment_id", experimentId,
                        "new_name", newName
                ))
                .retrieve()
                .bodyToMono(Map.class);
    }

    public Mono<Map> deleteExperiment(String experimentId) {
        return mlflowWebClient.post()
                .uri("/api/2.0/mlflow/experiments/delete")
                .bodyValue(Map.of("experiment_id", experimentId))
                .retrieve()
                .bodyToMono(Map.class);
    }

    public Mono<Map> restoreExperiment(String experimentId) {
        return mlflowWebClient.post()
                .uri("/api/2.0/mlflow/experiments/restore")
                .bodyValue(Map.of("experiment_id", experimentId))
                .retrieve()
                .bodyToMono(Map.class);
    }

    // Run methods
    public Mono<String> createRun(String experimentId) {
        return mlflowWebClient.post()
                .uri("/api/2.0/mlflow/runs/create")
                .bodyValue(Map.of("experiment_id", experimentId))
                .retrieve()
                .bodyToMono(Map.class)
                .map(response -> (String) response.get("run_id"));
    }

    public Mono<Map> getRun(String runId) {
        return mlflowWebClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/api/2.0/mlflow/runs/get")
                        .queryParam("run_id", runId)
                        .build())
                .retrieve()
                .bodyToMono(Map.class);
    }

    public Mono<Map> searchRuns(String experimentIds, String filter, String runViewType) {
        return mlflowWebClient.post()
                .uri("/api/2.0/mlflow/runs/search")
                .bodyValue(Map.of(
                        "experiment_ids", experimentIds != null ? java.util.Arrays.asList(experimentIds.split(",")) : java.util.Collections.emptyList(),
                        "filter", filter != null ? filter : "",
                        "max_results", 100
                ))
                .retrieve()
                .bodyToMono(Map.class);
    }

    public Mono<Map> updateRun(String runId, String status, String endTime) {
        return mlflowWebClient.post()
                .uri("/api/2.0/mlflow/runs/update")
                .bodyValue(Map.of(
                        "run_id", runId,
                        "status", status,
                        "end_time", endTime
                ))
                .retrieve()
                .bodyToMono(Map.class);
    }

    public Mono<Map> deleteRun(String runId) {
        return mlflowWebClient.post()
                .uri("/api/2.0/mlflow/runs/delete")
                .bodyValue(Map.of("run_id", runId))
                .retrieve()
                .bodyToMono(Map.class);
    }

    public Mono<Map> restoreRun(String runId) {
        return mlflowWebClient.post()
                .uri("/api/2.0/mlflow/runs/restore")
                .bodyValue(Map.of("run_id", runId))
                .retrieve()
                .bodyToMono(Map.class);
    }

    // Metric methods
    public Mono<Void> logMetric(String runId, String key, double value) {
        return mlflowWebClient.post()
                .uri("/api/2.0/mlflow/runs/log-metric")
                .bodyValue(Map.of(
                        "run_id", runId,
                        "key", key,
                        "value", value
                ))
                .retrieve()
                .bodyToMono(Void.class);
    }

    public Mono<Map> getMetricHistory(String runId, String metricKey) {
        return mlflowWebClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/api/2.0/mlflow/runs/get-metric-history")
                        .queryParam("run_id", runId)
                        .queryParam("metric_key", metricKey)
                        .build())
                .retrieve()
                .bodyToMono(Map.class);
    }

    // Parameter methods
    public Mono<Void> logParameter(String runId, String key, String value) {
        return mlflowWebClient.post()
                .uri("/api/2.0/mlflow/runs/log-parameter")
                .bodyValue(Map.of(
                        "run_id", runId,
                        "key", key,
                        "value", value
                ))
                .retrieve()
                .bodyToMono(Void.class);
    }

    // Artifact methods
    public Mono<Map> listArtifacts(String runId, String path, String pageToken) {
        return mlflowWebClient.get()
                .uri(uriBuilder -> {
                    var builder = uriBuilder
                            .path("/api/2.0/mlflow/artifacts/list")
                            .queryParam("run_id", runId);
                    
                    if (path != null && !path.isEmpty()) {
                        builder.queryParam("path", path);
                    }
                    
                    if (pageToken != null && !pageToken.isEmpty()) {
                        builder.queryParam("page_token", pageToken);
                    }
                    
                    return builder.build();
                })
                .retrieve()
                .bodyToMono(Map.class);
    }

    public Mono<byte[]> downloadArtifact(String runId, String path) {
        return mlflowWebClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/get-artifact")
                        .queryParam("run_id", runId)
                        .queryParam("path", path)
                        .build())
                .retrieve()
                .bodyToMono(byte[].class);
    }

    // Tag methods
    public Mono<Void> setTag(String runId, String key, String value) {
        return mlflowWebClient.post()
                .uri("/api/2.0/mlflow/runs/set-tag")
                .bodyValue(Map.of(
                        "run_id", runId,
                        "key", key,
                        "value", value
                ))
                .retrieve()
                .bodyToMono(Void.class);
    }

    public Mono<Void> deleteTag(String runId, String key) {
        return mlflowWebClient.post()
                .uri("/api/2.0/mlflow/runs/delete-tag")
                .bodyValue(Map.of(
                        "run_id", runId,
                        "key", key
                ))
                .retrieve()
                .bodyToMono(Void.class);
    }

    // Model Registry methods
    public Mono<Map> createModelVersion(String name, String source, String runId) {
        return mlflowWebClient.post()
                .uri("/api/2.0/mlflow/model-versions/create")
                .bodyValue(Map.of(
                        "name", name,
                        "source", source,
                        "run_id", runId
                ))
                .retrieve()
                .bodyToMono(Map.class);
    }

    public Mono<Map> getModelVersion(String name, String version) {
        return mlflowWebClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/api/2.0/mlflow/model-versions/get")
                        .queryParam("name", name)
                        .queryParam("version", version)
                        .build())
                .retrieve()
                .bodyToMono(Map.class);
    }

    public Mono<Map> listModelVersions(String name) {
        return mlflowWebClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/api/2.0/mlflow/model-versions/search")
                        .queryParam("filter", "name='" + name + "'")
                        .build())
                .retrieve()
                .bodyToMono(Map.class);
    }

    public Mono<Map> searchModelVersions(String filter) {
        return mlflowWebClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/api/2.0/mlflow/model-versions/search")
                        .queryParam("filter", filter)
                        .build())
                .retrieve()
                .bodyToMono(Map.class);
    }

    public Mono<Map> updateModelVersion(String name, String version, String description, String stage) {
        return mlflowWebClient.post()
                .uri("/api/2.0/mlflow/model-versions/update")
                .bodyValue(Map.of(
                        "name", name,
                        "version", version,
                        "description", description,
                        "stage", stage
                ))
                .retrieve()
                .bodyToMono(Map.class);
    }

    public Mono<Map> transitionModelVersionStage(String name, String version, String stage, String archiveExistingVersions) {
        return mlflowWebClient.post()
                .uri("/api/2.0/mlflow/model-versions/transition-stage")
                .bodyValue(Map.of(
                        "name", name,
                        "version", version,
                        "stage", stage,
                        "archive_existing_versions", archiveExistingVersions
                ))
                .retrieve()
                .bodyToMono(Map.class);
    }

    public Mono<Map> deleteModelVersion(String name, String version) {
        return mlflowWebClient.post()
                .uri("/api/2.0/mlflow/model-versions/delete")
                .bodyValue(Map.of(
                        "name", name,
                        "version", version
                ))
                .retrieve()
                .bodyToMono(Map.class);
    }

    public Mono<Map> getLatestModelVersions(String name, String stages) {
        return mlflowWebClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/api/2.0/mlflow/model-versions/get-latest-versions")
                        .queryParam("name", name)
                        .queryParam("stages", stages)
                        .build())
                .retrieve()
                .bodyToMono(Map.class);
    }

    // Registered Model methods
    public Mono<Map> createRegisteredModel(String name) {
        return mlflowWebClient.post()
                .uri("/api/2.0/mlflow/registered-models/create")
                .bodyValue(Map.of("name", name))
                .retrieve()
                .bodyToMono(Map.class);
    }

    public Mono<Map> getRegisteredModel(String name) {
        return mlflowWebClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/api/2.0/mlflow/registered-models/get")
                        .queryParam("name", name)
                        .build())
                .retrieve()
                .bodyToMono(Map.class)
                .map(response -> {
                    // Unwrap the registered_model from the MLflow response
                    return (Map) response.get("registered_model");
                });
    }

    public Mono<Map> listRegisteredModels() {
        return mlflowWebClient.get()
                .uri("/api/2.0/mlflow/registered-models/search?max_results=100")
                .retrieve()
                .bodyToMono(Map.class);
    }

    public Mono<Map> searchRegisteredModels(String filter) {
        return mlflowWebClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/api/2.0/mlflow/registered-models/search")
                        .queryParam("filter", filter)
                        .queryParam("max_results", "100")
                        .build())
                .retrieve()
                .bodyToMono(Map.class);
    }

    public Mono<Map> updateRegisteredModel(String name, String description) {
        return mlflowWebClient.post()
                .uri("/api/2.0/mlflow/registered-models/update")
                .bodyValue(Map.of(
                        "name", name,
                        "description", description
                ))
                .retrieve()
                .bodyToMono(Map.class);
    }

    public Mono<Map> deleteRegisteredModel(String name) {
        return mlflowWebClient.post()
                .uri("/api/2.0/mlflow/registered-models/delete")
                .bodyValue(Map.of("name", name))
                .retrieve()
                .bodyToMono(Map.class);
    }

    // ==================== ENHANCED DATA OPERATIONS ====================

    // Cached methods for better performance
    @Cacheable(value = "experiments", key = "#root.methodName")
    public Mono<Map> getCachedExperiments() {
        return listExperiments();
    }

    @Cacheable(value = "registeredModels", key = "#root.methodName")
    public Mono<Map> getCachedRegisteredModels() {
        return listRegisteredModels();
    }

    // Enhanced data transformation methods
    public Mono<Map> getExperimentsWithSummary() {
        return listExperiments()
                .map(this::transformExperimentsWithSummary);
    }

    public Mono<Map> getRunsWithMetrics(String experimentId) {
        return searchRuns(experimentId, null, null)
                .map(runsResponse -> {
                    List<Map> runs = (List<Map>) runsResponse.get("runs");
                    if (runs != null) {
                        List<Map> enhancedRuns = runs.stream()
                                .map(this::enhanceRunWithMetrics)
                                .collect(Collectors.toList());
                        runsResponse.put("runs", enhancedRuns);
                    }
                    return runsResponse;
                });
    }

    public Mono<Map> getModelVersionsWithDetails(String modelName) {
        return listModelVersions(modelName)
                .map(this::transformModelVersionsWithDetails);
    }

    // Data transformation helper methods
    private Map transformExperimentsWithSummary(Map experimentsResponse) {
        List<Map> experiments = (List<Map>) experimentsResponse.get("experiments");
        if (experiments != null) {
            List<Map> enhancedExperiments = experiments.stream()
                    .map(experiment -> {
                        Map<String, Object> enhanced = new HashMap<>();
                        enhanced.put("experiment_id", experiment.get("experiment_id"));
                        enhanced.put("name", experiment.get("name"));
                        enhanced.put("lifecycle_stage", experiment.get("lifecycle_stage"));
                        enhanced.put("artifact_location", experiment.get("artifact_location"));
                        enhanced.put("creation_time", experiment.get("creation_time"));
                        enhanced.put("last_update_time", experiment.get("last_update_time"));
                        enhanced.put("tags", experiment.get("tags"));
                        enhanced.put("run_count", getRunCountForExperiment((String) experiment.get("experiment_id")));
                        return enhanced;
                    })
                    .collect(Collectors.toList());
            experimentsResponse.put("experiments", enhancedExperiments);
        }
        return experimentsResponse;
    }

    private Map enhanceRunWithMetrics(Map run) {
        // Add computed fields for better frontend display
        Map<String, Object> enhanced = new HashMap<>();
        enhanced.put("run_id", run.get("run_id"));
        enhanced.put("experiment_id", run.get("experiment_id"));
        enhanced.put("name", run.get("name"));
        enhanced.put("status", run.get("status"));
        enhanced.put("start_time", run.get("start_time"));
        enhanced.put("end_time", run.get("end_time"));
        enhanced.put("lifecycle_stage", run.get("lifecycle_stage"));
        enhanced.put("artifact_uri", run.get("artifact_uri"));
        enhanced.put("data", run.get("data"));
        enhanced.put("tags", run.get("tags"));
        enhanced.put("duration", calculateRunDuration(run));
        enhanced.put("has_metrics", hasMetrics(run));
        enhanced.put("has_parameters", hasParameters(run));
        return enhanced;
    }

    private Map transformModelVersionsWithDetails(Map modelVersionsResponse) {
        List<Map> modelVersions = (List<Map>) modelVersionsResponse.get("model_versions");
        if (modelVersions != null) {
            List<Map> enhancedVersions = modelVersions.stream()
                    .map(version -> {
                        Map<String, Object> enhanced = new HashMap<>();
                        enhanced.put("name", version.get("name"));
                        enhanced.put("version", version.get("version"));
                        enhanced.put("creation_timestamp", version.get("creation_timestamp"));
                        enhanced.put("last_updated_timestamp", version.get("last_updated_timestamp"));
                        enhanced.put("current_stage", version.get("current_stage"));
                        enhanced.put("description", version.get("description"));
                        enhanced.put("source", version.get("source"));
                        enhanced.put("run_id", version.get("run_id"));
                        enhanced.put("status", version.get("status"));
                        enhanced.put("status_message", version.get("status_message"));
                        enhanced.put("tags", version.get("tags"));
                        enhanced.put("run_link", version.get("run_link"));
                        enhanced.put("is_latest", isLatestVersion(version));
                        return enhanced;
                    })
                    .collect(Collectors.toList());
            modelVersionsResponse.put("model_versions", enhancedVersions);
        }
        return modelVersionsResponse;
    }

    // Helper methods
    private Long getRunCountForExperiment(String experimentId) {
        // This would typically make an async call to get run count
        // For now, return 0 as placeholder
        return 0L;
    }

    private Long calculateRunDuration(Map run) {
        Object startTime = run.get("start_time");
        Object endTime = run.get("end_time");
        
        if (startTime != null && endTime != null) {
            try {
                long start = Long.parseLong(startTime.toString());
                long end = Long.parseLong(endTime.toString());
                return end - start;
            } catch (NumberFormatException e) {
                return 0L;
            }
        }
        return 0L;
    }

    private boolean hasMetrics(Map run) {
        Map data = (Map) run.get("data");
        if (data != null) {
            List metrics = (List) data.get("metrics");
            return metrics != null && !metrics.isEmpty();
        }
        return false;
    }

    private boolean hasParameters(Map run) {
        Map data = (Map) run.get("data");
        if (data != null) {
            List parameters = (List) data.get("params");
            return parameters != null && !parameters.isEmpty();
        }
        return false;
    }

    private boolean isLatestVersion(Map version) {
        // This would need to be determined based on the version number
        // For now, return false as placeholder
        return false;
    }

    // Search and filter methods
    public Mono<Map> searchExperimentsByName(String namePattern) {
        return searchExperiments("name ILIKE '%" + namePattern + "%'");
    }

    public Mono<Map> searchRunsByStatus(String experimentId, String status) {
        String filter = "status = '" + status + "'";
        return searchRuns(experimentId, filter, null);
    }

    public Mono<Map> searchRunsByTag(String experimentId, String tagKey, String tagValue) {
        String filter = "tags." + tagKey + " = '" + tagValue + "'";
        return searchRuns(experimentId, filter, null);
    }

    public Mono<Map> searchModelVersionsByStage(String modelName, String stage) {
        String filter = "current_stage = '" + stage + "'";
        return searchModelVersions(filter);
    }
}
