package com.mlops.hub.controller;

import com.mlops.hub.entity.InferenceService;
import com.mlops.hub.service.InferenceServiceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.RestClientException;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/inference-services")
@CrossOrigin(origins = "*")
public class InferenceServiceController {
    
    @Autowired
    private InferenceServiceService inferenceServiceService;
    
    private final RestTemplate restTemplate = new RestTemplate();
    
    @GetMapping
    public ResponseEntity<List<InferenceService>> getAllInferenceServices() {
        List<InferenceService> services = inferenceServiceService.getAllInferenceServices();
        return ResponseEntity.ok(services);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<InferenceService> getInferenceServiceById(@PathVariable Long id) {
        Optional<InferenceService> service = inferenceServiceService.getInferenceServiceById(id);
        return service.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/name/{name}")
    public ResponseEntity<InferenceService> getInferenceServiceByName(@PathVariable String name) {
        Optional<InferenceService> service = inferenceServiceService.getInferenceServiceByName(name);
        return service.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/status/{status}")
    public ResponseEntity<List<InferenceService>> getInferenceServicesByStatus(@PathVariable String status) {
        List<InferenceService> services = inferenceServiceService.getInferenceServicesByStatus(status);
        return ResponseEntity.ok(services);
    }
    
    @GetMapping("/namespace/{namespace}")
    public ResponseEntity<List<InferenceService>> getInferenceServicesByNamespace(@PathVariable String namespace) {
        List<InferenceService> services = inferenceServiceService.getInferenceServicesByNamespace(namespace);
        return ResponseEntity.ok(services);
    }
    
    @GetMapping("/search")
    public ResponseEntity<List<InferenceService>> searchInferenceServices(@RequestParam String query) {
        List<InferenceService> services = inferenceServiceService.searchInferenceServices(query);
        return ResponseEntity.ok(services);
    }
    
    @PostMapping
    public ResponseEntity<?> createInferenceService(@RequestBody InferenceService inferenceService) {
        try {
            InferenceService createdService = inferenceServiceService.createInferenceService(inferenceService);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdService);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to create inference service: " + e.getMessage()));
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<?> updateInferenceService(@PathVariable Long id, @RequestBody InferenceService inferenceService) {
        try {
            InferenceService updatedService = inferenceServiceService.updateInferenceService(id, inferenceService);
            return ResponseEntity.ok(updatedService);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to update inference service: " + e.getMessage()));
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteInferenceService(@PathVariable Long id) {
        try {
            inferenceServiceService.deleteInferenceService(id);
            return ResponseEntity.ok(Map.of("message", "Inference service deleted successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to delete inference service: " + e.getMessage()));
        }
    }
    
    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> request) {
        try {
            String status = request.get("status");
            if (status == null || status.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Status is required"));
            }
            
            InferenceService updatedService = inferenceServiceService.updateStatus(id, status);
            return ResponseEntity.ok(updatedService);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to update status: " + e.getMessage()));
        }
    }
    
    @GetMapping("/{id}/models")
    public ResponseEntity<?> getLoadedModels(@PathVariable Long id) {
        try {
            Optional<InferenceService> serviceOpt = inferenceServiceService.getInferenceServiceById(id);
            if (serviceOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            InferenceService service = serviceOpt.get();
            if (service.getBaseUrl() == null || service.getBaseUrl().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Inference service does not have a base URL configured"));
            }
            
            // Call the inference service's /models endpoint
            String modelsUrl = service.getBaseUrl().endsWith("/") ? 
                service.getBaseUrl() + "models" : 
                service.getBaseUrl() + "/models";
            
            try {
                Map<String, Object> response = restTemplate.getForObject(modelsUrl, Map.class);
                return ResponseEntity.ok(response);
            } catch (RestClientException e) {
                return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                        .body(Map.of("error", "Failed to connect to inference service: " + e.getMessage()));
            }
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to get loaded models: " + e.getMessage()));
        }
    }
}
