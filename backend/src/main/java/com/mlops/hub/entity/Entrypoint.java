package com.mlops.hub.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "entrypoints")
public class Entrypoint {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "version")
    private String version = "1.0.0";
    
    @Column(name = "type")
    private String type = "api"; // api, batch, streaming, scheduled, webhook
    
    @Column(name = "status")
    private String status = "inactive"; // active, inactive, deployed, failed
    
    @Column(name = "endpoint")
    private String endpoint;
    
    @Column(name = "method")
    private String method; // GET, POST, PUT, DELETE, PATCH
    
    @Column(name = "model_id")
    private Long modelId;
    
    @Column(name = "model_name")
    private String modelName;
    
    @Column(name = "model_type")
    private String modelType; // e.g., text-classification
    
    @Column(name = "inference_service_id")
    private Long inferenceServiceId;
    
    @Column(name = "inference_service_name")
    private String inferenceServiceName;
    
    @Column(name = "path")
    private String path; // path on the inference service (e.g., /infer/text-classification/emotion-classifier)
    
    @Column(name = "full_inference_path")
    private String fullInferencePath; // full path including model (e.g., /infer/text-classification/emotion-classifier)
    
    @Column(name = "tags", columnDefinition = "TEXT")
    private String tags; // JSON array of tags
    
    @Column(name = "visibility")
    private String visibility = "private"; // public, private, organization
    
    @Column(name = "owner_id")
    private Long ownerId;
    
    @Column(name = "owner_username")
    private String ownerUsername;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @Column(name = "last_deployed")
    private LocalDateTime lastDeployed;
    
    @Column(name = "deployment_config", columnDefinition = "TEXT")
    private String deploymentConfig; // JSON configuration
    
    @Column(name = "metrics_data", columnDefinition = "TEXT")
    private String metricsData; // JSON metrics data
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public String getVersion() { return version; }
    public void setVersion(String version) { this.version = version; }
    
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    
    public String getEndpoint() { return endpoint; }
    public void setEndpoint(String endpoint) { this.endpoint = endpoint; }
    
    public String getMethod() { return method; }
    public void setMethod(String method) { this.method = method; }
    
    public Long getModelId() { return modelId; }
    public void setModelId(Long modelId) { this.modelId = modelId; }
    
    public String getModelName() { return modelName; }
    public void setModelName(String modelName) { this.modelName = modelName; }
    
    public Long getInferenceServiceId() { return inferenceServiceId; }
    public void setInferenceServiceId(Long inferenceServiceId) { this.inferenceServiceId = inferenceServiceId; }
    
    public String getInferenceServiceName() { return inferenceServiceName; }
    public void setInferenceServiceName(String inferenceServiceName) { this.inferenceServiceName = inferenceServiceName; }
    
    public String getPath() { return path; }
    public void setPath(String path) { this.path = path; }
    
    public String getModelType() { return modelType; }
    public void setModelType(String modelType) { this.modelType = modelType; }
    
    public String getFullInferencePath() { return fullInferencePath; }
    public void setFullInferencePath(String fullInferencePath) { this.fullInferencePath = fullInferencePath; }
    
    public String getTags() { return tags; }
    public void setTags(String tags) { this.tags = tags; }
    
    public String getVisibility() { return visibility; }
    public void setVisibility(String visibility) { this.visibility = visibility; }
    
    public Long getOwnerId() { return ownerId; }
    public void setOwnerId(Long ownerId) { this.ownerId = ownerId; }
    
    public String getOwnerUsername() { return ownerUsername; }
    public void setOwnerUsername(String ownerUsername) { this.ownerUsername = ownerUsername; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    
    public LocalDateTime getLastDeployed() { return lastDeployed; }
    public void setLastDeployed(LocalDateTime lastDeployed) { this.lastDeployed = lastDeployed; }
    
    public String getDeploymentConfig() { return deploymentConfig; }
    public void setDeploymentConfig(String deploymentConfig) { this.deploymentConfig = deploymentConfig; }
    
    public String getMetricsData() { return metricsData; }
    public void setMetricsData(String metricsData) { this.metricsData = metricsData; }
}

