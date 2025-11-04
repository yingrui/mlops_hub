#!/bin/bash

# MLOps Hub - Development Mode
# Infrastructure in Kubernetes + Backend locally
# 
# Note: Uses ObjectStorage abstraction (MinIO) and separate MLflow database

set -e

echo "🚀 MLOps Hub - Development Mode"
echo "==============================="
echo "Infrastructure: Kubernetes"
echo "Backend: Local Terminal"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Port forwarding functions
start_port_forwarding() {
    # Kill existing port forwards
    pkill -f "kubectl port-forward" 2>/dev/null || true
    sleep 1
    
    # Start port forwarding for all services
    kubectl port-forward svc/postgres-service 5432:5432 -n mlops-hub > /dev/null 2>&1 &
    kubectl port-forward svc/minio-service 9000:9000 -n mlops-hub > /dev/null 2>&1 &
    kubectl port-forward svc/minio-service 9001:9001 -n mlops-hub > /dev/null 2>&1 &
    kubectl port-forward svc/mlflow-service 5000:5000 -n mlops-hub > /dev/null 2>&1 &
    kubectl port-forward svc/ray-head-service 8265:8265 -n mlops-hub > /dev/null 2>&1 &
    kubectl port-forward svc/keycloak-service 8081:8080 -n mlops-hub > /dev/null 2>&1 &
    
    sleep 2
}

wait_for_interrupt() {
    # Wait for interrupt signal
    while true; do
        sleep 1
    done
}

# Handle script arguments
case "${1:-}" in
    "delete")
        print_status "Deleting MLOps Hub infrastructure from Kubernetes..."
        kubectl delete namespace mlops-hub --ignore-not-found=true
        print_success "Infrastructure deleted successfully"
        exit 0
        ;;
    "status")
        print_status "Checking infrastructure status..."
        kubectl get all -n mlops-hub
        exit 0
        ;;
    "logs")
        print_status "Showing infrastructure logs..."
        kubectl logs -f deployment/postgres -n mlops-hub
        exit 0
        ;;
    "port-forward")
        print_status "Starting port forwarding for all services..."
        start_port_forwarding
        print_success "Port forwarding started!"
        echo ""
        echo "📋 Service URLs:"
        echo "  PostgreSQL: localhost:5432"
        echo "  Object Storage API: http://localhost:9000"
        echo "  Object Storage Console: http://localhost:9001 (minioadmin/minioadmin)"
        echo "  MLflow: http://localhost:5000"
        echo "  Ray Dashboard: http://localhost:8265"
        echo "  Keycloak: http://localhost:8081 (admin/admin)"
        echo ""
        echo "Press Ctrl+C to stop port forwarding"
        wait_for_interrupt
        exit 0
        ;;
    "stop-forwarding")
        print_status "Stopping all port forwarding..."
        pkill -f "kubectl port-forward" 2>/dev/null || true
        print_success "Port forwarding stopped"
        exit 0
        ;;
    "help"|"-h"|"--help")
        echo "MLOps Hub Development Script"
        echo ""
        echo "Usage: $0 [command]"
        echo ""
        echo "Commands:"
        echo "  (no args)    Deploy infrastructure and start backend locally"
        echo "  port-forward  Start port forwarding for all services only"
        echo "  stop-forwarding  Stop all port forwarding"
        echo "  status       Check infrastructure status"
        echo "  logs         Show infrastructure logs"
        echo "  delete       Delete all infrastructure"
        echo "  help         Show this help message"
        echo ""
        echo "Service URLs (when port forwarding is active):"
        echo "  PostgreSQL: localhost:5432"
        echo "  Object Storage API: http://localhost:9000"
        echo "  Object Storage Console: http://localhost:9001 (minioadmin/minioadmin)"
        echo "  MLflow: http://localhost:5000"
        echo "  Ray Dashboard: http://localhost:8265"
        echo "  Keycloak: http://localhost:8081 (admin/admin)"
        exit 0
        ;;
esac

# Check kubectl
if ! command -v kubectl &> /dev/null; then
    print_error "kubectl not found. Install with: brew install kubectl"
    exit 1
fi

if ! kubectl cluster-info &> /dev/null; then
    print_error "No Kubernetes cluster found."
    print_status "Start your cluster:"
    echo "  Kind: kind create cluster --name mlops-hub"
    echo "  OrbStack: Enable Kubernetes in settings"
    exit 1
fi

# Deploy infrastructure if not exists
if ! kubectl get namespace mlops-hub &> /dev/null; then
    print_status "Deploying infrastructure to Kubernetes..."
    
    # Install ingress if needed
    if ! kubectl get pods -n ingress-nginx &> /dev/null; then
        print_status "Installing NGINX Ingress..."
        kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/kind/deploy.yaml 2>/dev/null || \
        kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.2/deploy/static/provider/cloud/deploy.yaml
        kubectl wait --namespace ingress-nginx --for=condition=ready pod --selector=app.kubernetes.io/component=controller --timeout=90s
    fi
    
    # Deploy infrastructure
    kubectl apply -f k8s/namespace.yaml
    kubectl apply -f k8s/configmaps/
    kubectl apply -f k8s/secrets/
    kubectl apply -f k8s/deployments/postgres.yaml
    kubectl apply -f k8s/deployments/minio.yaml
    kubectl apply -f k8s/deployments/mlflow.yaml
    kubectl apply -f k8s/deployments/ray.yaml
    kubectl apply -f k8s/deployments/keycloak.yaml
    
    # Wait for services
    kubectl wait --for=condition=available --timeout=300s deployment/postgres -n mlops-hub
    kubectl wait --for=condition=available --timeout=300s deployment/minio -n mlops-hub
    kubectl wait --for=condition=available --timeout=300s deployment/mlflow -n mlops-hub
    kubectl wait --for=condition=available --timeout=300s deployment/ray-head -n mlops-hub
    kubectl wait --for=condition=available --timeout=300s deployment/keycloak -n mlops-hub
    
    print_success "Infrastructure deployed!"
else
    print_status "Infrastructure already deployed"
fi

# Setup Java
if [ -n "$JAVA_HOME" ]; then
    JAVA_VERSION=$(java -version 2>&1 | head -n 1 | grep -o 'version "25')
    if [ -z "$JAVA_VERSION" ]; then
        export JAVA_HOME=/opt/homebrew/opt/openjdk
        export PATH=$JAVA_HOME/bin:$PATH
    fi
else
    export JAVA_HOME=/opt/homebrew/opt/openjdk
    export PATH=$JAVA_HOME/bin:$PATH
fi

# Start port forwarding
print_status "Starting port forwarding..."
start_port_forwarding

# Cleanup function
cleanup() {
    echo ""
    print_status "Stopping port forwarding..."
    pkill -f "kubectl port-forward" 2>/dev/null || true
    exit 0
}
trap cleanup SIGINT SIGTERM

print_success "🎉 Ready! Starting backend locally..."
echo ""
echo "📋 Service URLs:"
echo "  Backend API: http://localhost:8080"
echo "  Keycloak: http://localhost:8081 (admin/admin)"
echo "  MLflow: http://localhost:5000"
echo "  Ray: http://localhost:8265"
echo "  Object Storage: http://localhost:9001 (minioadmin/minioadmin)"
echo ""
echo "Press Ctrl+C to stop"
echo ""

# Run backend
mvn spring-boot:run -Dspring-boot.run.profiles=local
