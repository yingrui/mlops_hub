package com.mlops.hub.service;

import com.mlops.hub.entity.InferenceService;
import com.mlops.hub.repository.InferenceServiceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class InferenceServiceService {
    
    @Autowired
    private InferenceServiceRepository inferenceServiceRepository;
    
    public List<InferenceService> getAllInferenceServices() {
        return inferenceServiceRepository.findAll();
    }
    
    public Optional<InferenceService> getInferenceServiceById(Long id) {
        return inferenceServiceRepository.findById(id);
    }
    
    public Optional<InferenceService> getInferenceServiceByName(String name) {
        return inferenceServiceRepository.findByName(name);
    }
    
    public List<InferenceService> getInferenceServicesByStatus(String status) {
        return inferenceServiceRepository.findByStatus(status);
    }
    
    public List<InferenceService> getInferenceServicesByNamespace(String namespace) {
        return inferenceServiceRepository.findByNamespace(namespace);
    }
    
    public List<InferenceService> searchInferenceServices(String query) {
        return inferenceServiceRepository.findByNameOrDescriptionContaining(query, query);
    }
    
    public InferenceService createInferenceService(InferenceService inferenceService) {
        // Validate that name is unique
        if (inferenceServiceRepository.findByName(inferenceService.getName()).isPresent()) {
            throw new IllegalArgumentException("Inference service with name '" + inferenceService.getName() + "' already exists");
        }
        
        // Set default values
        if (inferenceService.getStatus() == null) {
            inferenceService.setStatus("pending");
        }
        if (inferenceService.getReplicas() == null) {
            inferenceService.setReplicas(1);
        }
        if (inferenceService.getNamespace() == null) {
            inferenceService.setNamespace("default");
        }
        
        return inferenceServiceRepository.save(inferenceService);
    }
    
    public InferenceService updateInferenceService(Long id, InferenceService updatedInferenceService) {
        Optional<InferenceService> existingService = inferenceServiceRepository.findById(id);
        if (existingService.isEmpty()) {
            throw new IllegalArgumentException("Inference service with id '" + id + "' not found");
        }
        
        InferenceService service = existingService.get();
        
        // Update fields
        if (updatedInferenceService.getName() != null) {
            // Check if new name is unique (excluding current service)
            Optional<InferenceService> existingWithName = inferenceServiceRepository.findByName(updatedInferenceService.getName());
            if (existingWithName.isPresent() && !existingWithName.get().getId().equals(id)) {
                throw new IllegalArgumentException("Inference service with name '" + updatedInferenceService.getName() + "' already exists");
            }
            service.setName(updatedInferenceService.getName());
        }
        
        if (updatedInferenceService.getDescription() != null) {
            service.setDescription(updatedInferenceService.getDescription());
        }
        if (updatedInferenceService.getStatus() != null) {
            service.setStatus(updatedInferenceService.getStatus());
        }
        if (updatedInferenceService.getNamespace() != null) {
            service.setNamespace(updatedInferenceService.getNamespace());
        }
        if (updatedInferenceService.getReplicas() != null) {
            service.setReplicas(updatedInferenceService.getReplicas());
        }
        if (updatedInferenceService.getCpu() != null) {
            service.setCpu(updatedInferenceService.getCpu());
        }
        if (updatedInferenceService.getMemory() != null) {
            service.setMemory(updatedInferenceService.getMemory());
        }
        if (updatedInferenceService.getImage() != null) {
            service.setImage(updatedInferenceService.getImage());
        }
        if (updatedInferenceService.getPort() != null) {
            service.setPort(updatedInferenceService.getPort());
        }
        if (updatedInferenceService.getBaseUrl() != null) {
            service.setBaseUrl(updatedInferenceService.getBaseUrl());
        }
        
        return inferenceServiceRepository.save(service);
    }
    
    public void deleteInferenceService(Long id) {
        if (!inferenceServiceRepository.existsById(id)) {
            throw new IllegalArgumentException("Inference service with id '" + id + "' not found");
        }
        inferenceServiceRepository.deleteById(id);
    }
    
    public InferenceService updateStatus(Long id, String status) {
        Optional<InferenceService> service = inferenceServiceRepository.findById(id);
        if (service.isEmpty()) {
            throw new IllegalArgumentException("Inference service with id '" + id + "' not found");
        }
        
        InferenceService inferenceService = service.get();
        inferenceService.setStatus(status);
        return inferenceServiceRepository.save(inferenceService);
    }
}
