# MLOps Hub Backend API Documentation

## Overview

The MLOps Hub Backend provides a comprehensive REST API for managing machine learning experiments, models, datasets, and distributed computing resources.

## Base URL
```
http://localhost:8080/api
```

## Authentication
The API uses Keycloak for authentication and authorization. All endpoints except health checks require a valid JWT token.

### Getting an Access Token

#### 1. Direct Token Request
```bash
curl -X POST http://localhost:8081/realms/mlops-hub/protocol/openid-connect/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=password&client_id=mlops-backend&client_secret=mlops-backend-secret&username=admin&password=admin"
```

#### 2. Using Authorization Code Flow
1. Redirect user to: `http://localhost:8081/realms/mlops-hub/protocol/openid-connect/auth?client_id=mlops-backend&response_type=code&redirect_uri=http://localhost:8080/login/oauth2/code/keycloak`
2. User authenticates and gets redirected back with authorization code
3. Exchange code for token

### Using the Token
Include the token in the Authorization header:
```bash
curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" http://localhost:8080/api/experiments
```

### Keycloak Admin Console
- URL: http://localhost:8081
- Username: admin
- Password: admin
- Realm: mlops-hub

## API Endpoints

### Authentication

#### Get Current User Information
```http
GET /api/auth/user
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Response:**
```json
{
  "sub": "user-uuid",
  "preferred_username": "admin",
  "email": "admin@example.com",
  "given_name": "Admin",
  "family_name": "User",
  "realm_access": {
    "roles": ["admin", "user"]
  }
}
```

#### Get Token Information
```http
GET /api/auth/token-info
Authorization: Bearer YOUR_ACCESS_TOKEN
```

#### Logout
```http
POST /api/auth/logout
Authorization: Bearer YOUR_ACCESS_TOKEN
```

#### Get Keycloak Configuration
```http
GET /api/auth/keycloak-info
```

### Health & Monitoring

#### Get Backend Health Status
```http
GET /api/health
```

**Response:**
```json
{
  "status": "UP",
  "service": "MLOps Hub Backend",
  "timestamp": 1703123456789
}
```

#### Get MLflow Health Status
```http
GET /api/health/mlflow
```

#### Get Ray Cluster Health Status
```http
GET /api/health/ray
```

#### Get All Services Health Status
```http
GET /api/health/all
```

### Experiments

#### Get All Experiments
```http
GET /api/experiments
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "Image Classification",
    "description": "CNN model for image classification",
    "mlflowExperimentId": "1234567890",
    "createdAt": "2023-12-21T10:30:00",
    "updatedAt": "2023-12-21T10:30:00"
  }
]
```

#### Get Experiment by ID
```http
GET /api/experiments/{id}
```

#### Create New Experiment
```http
POST /api/experiments
Content-Type: application/json

{
  "name": "New Experiment",
  "description": "Experiment description"
}
```

#### Update Experiment
```http
PUT /api/experiments/{id}
Content-Type: application/json

{
  "name": "Updated Experiment",
  "description": "Updated description"
}
```

#### Delete Experiment
```http
DELETE /api/experiments/{id}
```

#### Search Experiments
```http
GET /api/experiments/search?name=classification
```

#### Get Runs for Experiment
```http
GET /api/experiments/{id}/runs
```

#### Create Run for Experiment
```http
POST /api/experiments/{id}/runs
Content-Type: application/json

{
  "name": "Run 1",
  "status": "RUNNING"
}
```

#### Get MLflow Experiment Details
```http
GET /api/experiments/{id}/mlflow
```

#### Log Metric for Run
```http
POST /api/experiments/runs/{runId}/metrics
Content-Type: application/json

{
  "key": "accuracy",
  "value": 0.95
}
```

#### Log Parameter for Run
```http
POST /api/experiments/runs/{runId}/parameters
Content-Type: application/json

{
  "key": "learning_rate",
  "value": "0.001"
}
```

#### Get Run Details
```http
GET /api/experiments/runs/{runId}
```

### Models

#### Get All Models
```http
GET /api/models
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "ResNet50",
    "description": "ResNet50 model for image classification",
    "version": "1.0.0",
    "modelPath": "models/resnet50/v1/model.pkl",
    "modelType": "CNN",
    "createdAt": "2023-12-21T10:30:00",
    "updatedAt": "2023-12-21T10:30:00"
  }
]
```

#### Get Model by ID
```http
GET /api/models/{id}
```

#### Create New Model
```http
POST /api/models
Content-Type: application/json

{
  "name": "New Model",
  "description": "Model description",
  "version": "1.0.0",
  "modelPath": "models/new-model/v1/model.pkl",
  "modelType": "CNN"
}
```

#### Update Model
```http
PUT /api/models/{id}
Content-Type: application/json

{
  "name": "Updated Model",
  "description": "Updated description",
  "version": "1.1.0"
}
```

#### Delete Model
```http
DELETE /api/models/{id}
```

#### Search Models
```http
GET /api/models/search?name=resnet
```

#### Get Models by Type
```http
GET /api/models/type/{type}
```

### Datasets

#### Get All Datasets
```http
GET /api/datasets
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "CIFAR-10",
    "description": "CIFAR-10 image dataset",
    "filePath": "datasets/cifar10/train.zip",
    "fileSize": 162000000,
    "fileType": "application/zip",
    "createdAt": "2023-12-21T10:30:00",
    "updatedAt": "2023-12-21T10:30:00"
  }
]
```

#### Get Dataset by ID
```http
GET /api/datasets/{id}
```

#### Create New Dataset
```http
POST /api/datasets
Content-Type: application/json

{
  "name": "New Dataset",
  "description": "Dataset description",
  "fileType": "application/zip"
}
```

#### Upload Dataset File
```http
POST /api/datasets/upload
Content-Type: multipart/form-data

file: [binary file data]
name: "Dataset Name"
description: "Dataset description"
```

#### Update Dataset
```http
PUT /api/datasets/{id}
Content-Type: application/json

{
  "name": "Updated Dataset",
  "description": "Updated description"
}
```

#### Delete Dataset
```http
DELETE /api/datasets/{id}
```

#### Search Datasets
```http
GET /api/datasets/search?name=cifar
```

#### Get Datasets by Type
```http
GET /api/datasets/type/{type}
```

### Storage (MinIO)

#### Upload File
```http
POST /api/storage/upload
Content-Type: multipart/form-data

file: [binary file data]
path: "models/my-model/v1/model.pkl"
```

#### Download File
```http
GET /api/storage/download/{path}
```

#### Delete File
```http
DELETE /api/storage/{path}
```

#### List Files
```http
GET /api/storage/list?prefix=models/
```

### Ray Cluster

#### Get Cluster Status
```http
GET /api/ray/cluster/status
```

**Response:**
```json
{
  "num_nodes": 2,
  "num_workers": 4,
  "cluster_resources": {
    "CPU": 8,
    "GPU": 2,
    "memory": 32000000000
  }
}
```

#### Get All Jobs
```http
GET /api/ray/jobs
```

#### Get Job by ID
```http
GET /api/ray/jobs/{jobId}
```

#### Get All Actors
```http
GET /api/ray/actors
```

#### Get Actor by ID
```http
GET /api/ray/actors/{actorId}
```

#### Get All Tasks
```http
GET /api/ray/tasks
```

#### Get Task by ID
```http
GET /api/ray/tasks/{taskId}
```

#### Get All Nodes
```http
GET /api/ray/nodes
```

## Error Responses

### 400 Bad Request
```json
{
  "error": "Bad Request",
  "message": "Invalid request parameters",
  "timestamp": "2023-12-21T10:30:00"
}
```

### 404 Not Found
```json
{
  "error": "Not Found",
  "message": "Resource not found",
  "timestamp": "2023-12-21T10:30:00"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred",
  "timestamp": "2023-12-21T10:30:00"
}
```

## Rate Limiting

Currently, there are no rate limits implemented. In production, rate limiting should be added to prevent abuse.

## CORS

The API supports CORS for all origins (`*`). In production, this should be restricted to specific domains.

## Examples

### Complete Workflow Example

1. **Create an experiment:**
```bash
curl -X POST http://localhost:8080/api/experiments \
  -H "Content-Type: application/json" \
  -d '{"name": "Image Classification", "description": "CNN experiment"}'
```

2. **Upload a dataset:**
```bash
curl -X POST http://localhost:8080/api/datasets/upload \
  -F "file=@dataset.zip" \
  -F "name=CIFAR-10" \
  -F "description=CIFAR-10 dataset"
```

3. **Create a run:**
```bash
curl -X POST http://localhost:8080/api/experiments/1/runs \
  -H "Content-Type: application/json" \
  -d '{"name": "Run 1", "status": "RUNNING"}'
```

4. **Log metrics:**
```bash
curl -X POST http://localhost:8080/api/experiments/runs/run-id-123/metrics \
  -H "Content-Type: application/json" \
  -d '{"key": "accuracy", "value": 0.95}'
```

5. **Check Ray cluster status:**
```bash
curl http://localhost:8080/api/ray/cluster/status
```
