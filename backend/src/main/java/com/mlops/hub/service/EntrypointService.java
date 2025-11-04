package com.mlops.hub.service;

import com.mlops.hub.entity.Entrypoint;
import com.mlops.hub.entity.InferenceService;
import com.mlops.hub.repository.EntrypointRepository;
import com.mlops.hub.repository.InferenceServiceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class EntrypointService {
    
    @Autowired
    private EntrypointRepository entrypointRepository;
    
    @Autowired
    private InferenceServiceRepository inferenceServiceRepository;
    
    public List<Entrypoint> getAllEntrypoints() {
        return entrypointRepository.findAll();
    }
    
    public Optional<Entrypoint> getEntrypointById(Long id) {
        return entrypointRepository.findById(id);
    }
    
    public Optional<Entrypoint> getEntrypointByName(String name) {
        return entrypointRepository.findByName(name);
    }
    
    public List<Entrypoint> getEntrypointsByStatus(String status) {
        return entrypointRepository.findByStatus(status);
    }
    
    public List<Entrypoint> getEntrypointsByType(String type) {
        return entrypointRepository.findByType(type);
    }
    
    public List<Entrypoint> getEntrypointsByModelId(Long modelId) {
        return entrypointRepository.findByModelId(modelId);
    }
    
    public List<Entrypoint> getEntrypointsByInferenceServiceId(Long serviceId) {
        return entrypointRepository.findByInferenceServiceId(serviceId);
    }
    
    public List<Entrypoint> getEntrypointsByOwnerId(Long ownerId) {
        return entrypointRepository.findByOwnerId(ownerId);
    }
    
    public List<Entrypoint> searchEntrypoints(String query) {
        return entrypointRepository.searchByNameOrDescription(query);
    }
    
    public Entrypoint createEntrypoint(Entrypoint entrypoint) {
        // Validate that name is unique
        if (entrypointRepository.findByName(entrypoint.getName()).isPresent()) {
            throw new IllegalArgumentException("Entrypoint with name '" + entrypoint.getName() + "' already exists");
        }
        
        // Set default values
        if (entrypoint.getVersion() == null || entrypoint.getVersion().isEmpty()) {
            entrypoint.setVersion("1.0.0");
        }
        if (entrypoint.getType() == null || entrypoint.getType().isEmpty()) {
            entrypoint.setType("api");
        }
        if (entrypoint.getStatus() == null || entrypoint.getStatus().isEmpty()) {
            entrypoint.setStatus("inactive");
        }
        if (entrypoint.getVisibility() == null || entrypoint.getVisibility().isEmpty()) {
            entrypoint.setVisibility("private");
        }
        
        // Validate inference service exists if provided
        if (entrypoint.getInferenceServiceId() != null) {
            Optional<InferenceService> service = inferenceServiceRepository.findById(entrypoint.getInferenceServiceId());
            if (service.isEmpty()) {
                throw new IllegalArgumentException("Inference service with id '" + entrypoint.getInferenceServiceId() + "' not found");
            }
            entrypoint.setInferenceServiceName(service.get().getName());
        }
        
        // Generate endpoint URL if not provided
        if (entrypoint.getEndpoint() == null || entrypoint.getEndpoint().isEmpty()) {
            entrypoint.setEndpoint("/api/entrypoints/" + entrypoint.getName());
        }
        
        return entrypointRepository.save(entrypoint);
    }
    
    public Entrypoint updateEntrypoint(Long id, Entrypoint updatedEntrypoint) {
        Optional<Entrypoint> existing = entrypointRepository.findById(id);
        if (existing.isEmpty()) {
            throw new IllegalArgumentException("Entrypoint with id '" + id + "' not found");
        }
        
        Entrypoint entrypoint = existing.get();
        
        // Update fields
        if (updatedEntrypoint.getName() != null) {
            // Check if new name is unique (excluding current entrypoint)
            Optional<Entrypoint> existingWithName = entrypointRepository.findByName(updatedEntrypoint.getName());
            if (existingWithName.isPresent() && !existingWithName.get().getId().equals(id)) {
                throw new IllegalArgumentException("Entrypoint with name '" + updatedEntrypoint.getName() + "' already exists");
            }
            entrypoint.setName(updatedEntrypoint.getName());
        }
        
        if (updatedEntrypoint.getDescription() != null) {
            entrypoint.setDescription(updatedEntrypoint.getDescription());
        }
        if (updatedEntrypoint.getVersion() != null) {
            entrypoint.setVersion(updatedEntrypoint.getVersion());
        }
        if (updatedEntrypoint.getType() != null) {
            entrypoint.setType(updatedEntrypoint.getType());
        }
        if (updatedEntrypoint.getStatus() != null) {
            entrypoint.setStatus(updatedEntrypoint.getStatus());
        }
        if (updatedEntrypoint.getEndpoint() != null) {
            entrypoint.setEndpoint(updatedEntrypoint.getEndpoint());
        }
        if (updatedEntrypoint.getMethod() != null) {
            entrypoint.setMethod(updatedEntrypoint.getMethod());
        }
        if (updatedEntrypoint.getInferenceServiceId() != null) {
            entrypoint.setInferenceServiceId(updatedEntrypoint.getInferenceServiceId());
            // Update inference service name
            Optional<InferenceService> service = inferenceServiceRepository.findById(updatedEntrypoint.getInferenceServiceId());
            if (service.isPresent()) {
                entrypoint.setInferenceServiceName(service.get().getName());
            }
        }
        if (updatedEntrypoint.getPath() != null) {
            entrypoint.setPath(updatedEntrypoint.getPath());
        }
        if (updatedEntrypoint.getModelType() != null) {
            entrypoint.setModelType(updatedEntrypoint.getModelType());
        }
        if (updatedEntrypoint.getFullInferencePath() != null) {
            entrypoint.setFullInferencePath(updatedEntrypoint.getFullInferencePath());
        }
        if (updatedEntrypoint.getTags() != null) {
            entrypoint.setTags(updatedEntrypoint.getTags());
        }
        if (updatedEntrypoint.getVisibility() != null) {
            entrypoint.setVisibility(updatedEntrypoint.getVisibility());
        }
        if (updatedEntrypoint.getDeploymentConfig() != null) {
            entrypoint.setDeploymentConfig(updatedEntrypoint.getDeploymentConfig());
        }
        if (updatedEntrypoint.getMetricsData() != null) {
            entrypoint.setMetricsData(updatedEntrypoint.getMetricsData());
        }
        
        return entrypointRepository.save(entrypoint);
    }
    
    public void deleteEntrypoint(Long id) {
        if (!entrypointRepository.existsById(id)) {
            throw new IllegalArgumentException("Entrypoint with id '" + id + "' not found");
        }
        entrypointRepository.deleteById(id);
    }
    
    public Entrypoint updateStatus(Long id, String status) {
        Optional<Entrypoint> entrypoint = entrypointRepository.findById(id);
        if (entrypoint.isEmpty()) {
            throw new IllegalArgumentException("Entrypoint with id '" + id + "' not found");
        }
        
        Entrypoint ep = entrypoint.get();
        ep.setStatus(status);
        if (status.equals("deployed") || status.equals("active")) {
            ep.setLastDeployed(java.time.LocalDateTime.now());
        }
        return entrypointRepository.save(ep);
    }
}

