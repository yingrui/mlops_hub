package com.mlops.hub.controller;

import com.mlops.hub.entity.Entrypoint;
import com.mlops.hub.entity.EntrypointHistory;
import com.mlops.hub.entity.InferenceService;
import com.mlops.hub.service.EntrypointService;
import com.mlops.hub.service.EntrypointHistoryService;
import com.mlops.hub.service.InferenceServiceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/entrypoints")
@CrossOrigin(origins = "*")
public class EntrypointController {
    
    @Autowired
    private EntrypointService entrypointService;
    
    @Autowired
    private InferenceServiceService inferenceServiceService;
    
    @Autowired
    private EntrypointHistoryService historyService;
    
    private final RestTemplate restTemplate = new RestTemplate();
    
    @GetMapping
    public ResponseEntity<List<Entrypoint>> getAllEntrypoints() {
        List<Entrypoint> entrypoints = entrypointService.getAllEntrypoints();
        return ResponseEntity.ok(entrypoints);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getEntrypointById(@PathVariable Long id) {
        Optional<Entrypoint> entrypoint = entrypointService.getEntrypointById(id);
        if (entrypoint.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        Entrypoint ep = entrypoint.get();
        
        // Create response map with all entrypoint fields plus links (excluding endpoint)
        Map<String, Object> response = new java.util.HashMap<>();
        response.put("id", ep.getId());
        response.put("name", ep.getName());
        response.put("description", ep.getDescription());
        response.put("version", ep.getVersion());
        response.put("type", ep.getType());
        response.put("status", ep.getStatus());
        response.put("method", ep.getMethod());
        response.put("modelId", ep.getModelId());
        response.put("modelName", ep.getModelName());
        response.put("modelType", ep.getModelType());
        response.put("inferenceServiceId", ep.getInferenceServiceId());
        response.put("inferenceServiceName", ep.getInferenceServiceName());
        response.put("path", ep.getPath());
        response.put("fullInferencePath", ep.getFullInferencePath());
        response.put("tags", ep.getTags());
        response.put("visibility", ep.getVisibility());
        response.put("ownerId", ep.getOwnerId());
        response.put("ownerUsername", ep.getOwnerUsername());
        response.put("createdAt", ep.getCreatedAt());
        response.put("updatedAt", ep.getUpdatedAt());
        response.put("lastDeployed", ep.getLastDeployed());
        response.put("deploymentConfig", ep.getDeploymentConfig());
        response.put("metricsData", ep.getMetricsData());
        
        // Add links
        response.put("_links", Map.of(
            "self", String.format("/api/entrypoints/%d", id),
            "infer", String.format("/api/entrypoints/%d/infer", id),
            "update", String.format("/api/entrypoints/%d", id),
            "delete", String.format("/api/entrypoints/%d", id),
            "status", String.format("/api/entrypoints/%d/status", id)
        ));
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/name/{name}")
    public ResponseEntity<Entrypoint> getEntrypointByName(@PathVariable String name) {
        Optional<Entrypoint> entrypoint = entrypointService.getEntrypointByName(name);
        return entrypoint.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/status/{status}")
    public ResponseEntity<List<Entrypoint>> getEntrypointsByStatus(@PathVariable String status) {
        List<Entrypoint> entrypoints = entrypointService.getEntrypointsByStatus(status);
        return ResponseEntity.ok(entrypoints);
    }
    
    @GetMapping("/type/{type}")
    public ResponseEntity<List<Entrypoint>> getEntrypointsByType(@PathVariable String type) {
        List<Entrypoint> entrypoints = entrypointService.getEntrypointsByType(type);
        return ResponseEntity.ok(entrypoints);
    }
    
    @GetMapping("/search")
    public ResponseEntity<List<Entrypoint>> searchEntrypoints(@RequestParam String query) {
        List<Entrypoint> entrypoints = entrypointService.searchEntrypoints(query);
        return ResponseEntity.ok(entrypoints);
    }
    
    @GetMapping("/model/{modelId}")
    public ResponseEntity<List<Entrypoint>> getEntrypointsByModelId(@PathVariable Long modelId) {
        List<Entrypoint> entrypoints = entrypointService.getEntrypointsByModelId(modelId);
        return ResponseEntity.ok(entrypoints);
    }
    
    @GetMapping("/inference-service/{serviceId}")
    public ResponseEntity<List<Entrypoint>> getEntrypointsByInferenceServiceId(@PathVariable Long serviceId) {
        List<Entrypoint> entrypoints = entrypointService.getEntrypointsByInferenceServiceId(serviceId);
        return ResponseEntity.ok(entrypoints);
    }
    
    @PostMapping
    public ResponseEntity<?> createEntrypoint(@RequestBody Entrypoint entrypoint) {
        try {
            Entrypoint createdEntrypoint = entrypointService.createEntrypoint(entrypoint);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdEntrypoint);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to create entrypoint: " + e.getMessage()));
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<?> updateEntrypoint(@PathVariable Long id, @RequestBody Entrypoint entrypoint) {
        try {
            Entrypoint updatedEntrypoint = entrypointService.updateEntrypoint(id, entrypoint);
            return ResponseEntity.ok(updatedEntrypoint);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to update entrypoint: " + e.getMessage()));
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteEntrypoint(@PathVariable Long id) {
        try {
            entrypointService.deleteEntrypoint(id);
            return ResponseEntity.ok(Map.of("message", "Entrypoint deleted successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to delete entrypoint: " + e.getMessage()));
        }
    }
    
    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> request) {
        try {
            String status = request.get("status");
            if (status == null || status.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Status is required"));
            }
            
            Entrypoint updatedEntrypoint = entrypointService.updateStatus(id, status);
            return ResponseEntity.ok(updatedEntrypoint);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to update status: " + e.getMessage()));
        }
    }
    
    /**
     * Call endpoint - this is the gateway that forwards requests to the inference service
     */
    @PostMapping("/{id}/infer")
    public ResponseEntity<?> callEntrypoint(@PathVariable Long id, @RequestBody Map<String, Object> request) {
        try {
            Optional<Entrypoint> entrypointOpt = entrypointService.getEntrypointById(id);
            if (entrypointOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            Entrypoint entrypoint = entrypointOpt.get();
            
            // Check if entrypoint is active
            if (!"active".equals(entrypoint.getStatus()) && !"deployed".equals(entrypoint.getStatus())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("status", "error", "message", "Entrypoint is not active"));
            }
            
            // Request body validation is handled by inference server
            // Backend only forwards the request
            
            // Get inference service
            if (entrypoint.getInferenceServiceId() == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "Entrypoint does not have an inference service configured"));
            }
            
            Optional<InferenceService> serviceOpt = inferenceServiceService.getInferenceServiceById(entrypoint.getInferenceServiceId());
            if (serviceOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "Inference service not found"));
            }
            
            InferenceService service = serviceOpt.get();
            if (service.getBaseUrl() == null || service.getBaseUrl().trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "Inference service does not have a base URL configured"));
            }
            
            // Build the target URL - use full_inference_path if available, otherwise use path
            String baseUrl = service.getBaseUrl().endsWith("/") ? service.getBaseUrl() : service.getBaseUrl() + "/";
            String inferencePath = entrypoint.getFullInferencePath() != null ? 
                entrypoint.getFullInferencePath() : entrypoint.getPath();
            String path = inferencePath != null ? inferencePath : "predict";
            // Remove leading slash if present
            path = path.startsWith("/") ? path.substring(1) : path;
            String targetUrl = baseUrl + path;
            
            // Forward the request to the inference service and save history
            long startTime = System.currentTimeMillis();
            try {
                Object response = restTemplate.postForObject(targetUrl, request, Object.class);
                long elapsedTime = System.currentTimeMillis() - startTime;
                
                // Check if the inference server returned an error status
                if (response instanceof Map) {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> responseMap = (Map<String, Object>) response;
                    
                    String status = (String) responseMap.get("status");
                    if ("error".equals(status)) {
                        // Inference server returned error
                        String errorMsg = (String) responseMap.get("message");
                        historyService.saveHistory(id, request, response, 400, "error", errorMsg, elapsedTime);
                        
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                .body(response);
                    } else {
                        // Success
                        responseMap.putIfAbsent("status", "success");
                        historyService.saveHistory(id, request, response, 200, "success", null, elapsedTime);
                        
                        return ResponseEntity.ok(response);
                    }
                } else {
                    // Non-map response, treat as success
                    historyService.saveHistory(id, request, response, 200, "success", null, elapsedTime);
                    return ResponseEntity.ok(response);
                }
            } catch (Exception e) {
                long elapsedTime = System.currentTimeMillis() - startTime;
                String errorMsg = "Failed to forward request to inference service: " + e.getMessage();
                
                // Save error history
                historyService.saveHistory(id, request, null, 502, "error", errorMsg, elapsedTime);
                
                return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                        .body(Map.of("status", "error", "message", errorMsg));
            }
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to call entrypoint: " + e.getMessage()));
        }
    }
    
    /**
     * Get inference history for an entrypoint
     */
    @GetMapping("/{id}/history")
    public ResponseEntity<List<EntrypointHistory>> getEntrypointHistory(@PathVariable Long id) {
        try {
            List<EntrypointHistory> history = historyService.getHistoryByEntrypointId(id);
            return ResponseEntity.ok(history);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(List.of());
        }
    }
    
    /**
     * Get metrics for an entrypoint
     */
    @GetMapping("/{id}/metrics")
    public ResponseEntity<Map<String, Object>> getEntrypointMetrics(@PathVariable Long id, 
                                                                     @RequestParam(defaultValue = "24") int hours) {
        try {
            Map<String, Object> metrics = historyService.getMetrics(id, hours);
            return ResponseEntity.ok(metrics);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to get metrics: " + e.getMessage()));
        }
    }
    
    /**
     * Get daily metrics for an entrypoint
     */
    @GetMapping("/{id}/metrics/daily")
    public ResponseEntity<Map<String, Object>> getEntrypointDailyMetrics(@PathVariable Long id, 
                                                                          @RequestParam(defaultValue = "30") int days) {
        try {
            Map<String, Object> metrics = historyService.getDailyMetrics(id, days);
            return ResponseEntity.ok(metrics);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to get daily metrics: " + e.getMessage()));
        }
    }
}

