# MLOps Hub Backend

This is the backend service for the MLOps Hub, built with Java 25 Spring Boot and integrated with PostgreSQL, MinIO, MLflow, Ray cluster, and Keycloak authentication.

## 🏗️ Architecture

The MLOps Hub Backend is a comprehensive machine learning operations platform that integrates multiple services:

### Core Services
- **Spring Boot Backend** (Port 8080) - Main API service
- **PostgreSQL Database** (Port 5432) - Metadata and application data
- **MinIO Object Storage** (Ports 9000, 9001) - S3-compatible storage for artifacts
- **MLflow Server** (Port 5000) - ML experiment tracking and model registry
- **Ray Cluster** (Ports 8265, 10001, 20000) - Distributed computing for ML workloads
- **Keycloak** (Port 8081) - Enterprise identity and access management

### Technology Stack
- **Backend**: Java 25, Spring Boot 3.4.0
- **Database**: PostgreSQL 15 with Flyway migrations
- **Storage**: MinIO S3-compatible object storage
- **ML Tracking**: MLflow with PostgreSQL backend
- **Distributed Computing**: Ray cluster with head and worker nodes
- **Authentication**: Keycloak with JWT tokens and role-based access
- **Containerization**: Docker and Kubernetes support

## 🔐 Authentication

The backend uses Keycloak for enterprise-grade authentication:

### Security Features
- **JWT Token Validation**: Stateless authentication
- **Role-Based Access Control**: admin, user, ml-engineer, data-scientist roles
- **OAuth2 Integration**: Complete OAuth2 flow support
- **User Management**: Complete user lifecycle management

### Getting Access Token
```bash
curl -X POST http://localhost:8081/realms/mlops-hub/protocol/openid-connect/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=password&client_id=mlops-backend&client_secret=mlops-backend-secret&username=admin&password=admin"
```

### Keycloak Admin Console
- **URL**: http://localhost:8081
- **Username**: admin
- **Password**: admin
- **Realm**: mlops-hub

## 🚀 Services

### Core Services
- **Experiment Management**: Create and manage ML experiments
- **Model Management**: Store and version ML models
- **Dataset Management**: Upload and manage datasets
- **Storage Service**: File upload/download through MinIO
- **Ray Integration**: Monitor and manage Ray cluster

### API Endpoints

#### Experiments
- `POST /api/experiments` - Create a new experiment
- `GET /api/experiments/{id}` - Get experiment details
- `POST /api/experiments/{id}/runs` - Create a new run
- `POST /api/experiments/runs/{id}/metrics` - Log metrics
- `POST /api/experiments/runs/{id}/parameters` - Log parameters

#### Ray Cluster
- `GET /api/ray/cluster/status` - Get cluster status
- `GET /api/ray/jobs` - List all jobs
- `GET /api/ray/jobs/{id}` - Get job details
- `GET /api/ray/actors` - List all actors
- `GET /api/ray/tasks` - List all tasks
- `GET /api/ray/nodes` - List all nodes

#### Storage
- `POST /api/storage/upload` - Upload file
- `GET /api/storage/download/{path}` - Download file
- `DELETE /api/storage/{path}` - Delete file
- `GET /api/storage/list` - List files

## 📋 Prerequisites

- **Java 25+**: Latest Java runtime
- **Maven 3.6+**: Build tool
- **kubectl**: For Kubernetes deployments
- **Kind or OrbStack**: For local Kubernetes cluster

## 🚀 Quick Start

### 🛠️ Development Mode ⭐
**Perfect for daily development work**
- ✅ Infrastructure runs in Kubernetes (PostgreSQL, MinIO, MLflow, Ray, Keycloak)
- ✅ Backend runs locally in your terminal for easy debugging
- ✅ Automatic port forwarding connects everything
- ✅ Hot reloading and IDE debugging work perfectly

```bash
# Start development mode (infrastructure + backend)
./dev.sh

# Or just start port forwarding for services
./dev.sh port-forward

# Stop port forwarding
./dev.sh stop-forwarding

# Check infrastructure status
./dev.sh status

# Delete infrastructure
./dev.sh delete

# Show help
./dev.sh help
```

## 📋 Service URLs

- **Backend API**: http://localhost:8080
- **Keycloak Admin**: http://localhost:8081 (admin/admin)
- **MLflow UI**: http://localhost:5000
- **Ray Dashboard**: http://localhost:8265
- **Ray Client**: localhost:20000
- **MinIO Console**: http://localhost:9001 (minioadmin/minioadmin)

## 📁 Project Structure

```
backend/
├── dev.sh                    # Development mode (K8s + local backend)
├── Dockerfile               # Docker image for backend
├── pom.xml                  # Maven configuration
├── keycloak-realm.json     # Keycloak realm configuration
├── init-multiple-databases.sh # PostgreSQL init script
├── k8s/                     # Kubernetes manifests
│   ├── namespace.yaml
│   ├── configmaps/
│   ├── secrets/
│   ├── deployments/
│   └── ingress/
├── src/                     # Source code
│   └── main/
│       ├── java/
│       └── resources/
└── target/                  # Build output
```

## Configuration

The application configuration is in `src/main/resources/application.yml`:

- Database connection settings
- MinIO endpoint and credentials
- MLflow tracking URI
- Ray cluster URLs
- Keycloak authentication settings

### Local Development Configuration

For local development with Kubernetes infrastructure, create `src/main/resources/application-local.yml`:

```yaml
spring:
  profiles: active: local
  datasource:
    url: jdbc:postgresql://localhost:5432/mlops_hub
    username: mlops_user
    password: mlops_password
minio:
  endpoint: http://localhost:9000
  access-key: minioadmin
  secret-key: minioadmin
mlflow:
  tracking-uri: http://localhost:5000
ray:
  head-node-url: http://localhost:8265
keycloak:
  auth-server-url: http://localhost:8081
  realm: mlops-hub
  client-id: mlops-backend
  client-secret: mlops-backend-secret
```

## Development

### Building
```bash
mvn clean package
```

### Testing
```bash
mvn test
```

### Additional Commands
```bash
# Development mode commands
./dev.sh delete    # Delete infrastructure from Kubernetes
./dev.sh status    # Check infrastructure status
./dev.sh logs      # View infrastructure logs

# Additional commands
./dev.sh help      # Show all available commands
```

### Database Migrations
Database migrations are handled by Flyway and located in `src/main/resources/db/migration/`.

## Monitoring

The application includes Spring Boot Actuator endpoints for monitoring:
- Health check: `/actuator/health`
- Metrics: `/actuator/metrics`
- Info: `/actuator/info`
