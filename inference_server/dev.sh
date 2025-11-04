#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

HOST="${HOST:-0.0.0.0}"
PORT="${PORT:-8000}"

# Function to show usage
show_usage() {
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  start, server, run    Start the FastAPI inference server (default)"
    echo "  register MODEL_ID MODEL_NAME [VERSION] [MLFLOW_URI]"
    echo "                       Register a Hugging Face model to MLflow"
    echo "  load MODEL_NAME [VERSION]"
    echo "                       Load a model from MLflow into the server"
    echo "  test MODEL_NAME       Test inference with sample texts"
    echo "  help                  Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 start"
    echo "  $0 register cardiffnlp/twitter-roberta-base-emotion emotion-classifier 1.0"
    echo "  $0 load emotion-classifier 1"
    echo "  $0 test emotion-classifier"
}

# Function to register a model to MLflow
register_model() {
    local model_id="$1"
    local model_name="$2"
    local version="${3:-1.0}"
    local mlflow_uri="${4:-http://localhost:5000}"
    
    echo "Registering model: $model_id -> $model_name (v$version)"
    python register_hf_model_to_mlflow.py \
        --model-id "$model_id" \
        --model-name "$model_name" \
        --version "$version" \
        --mlflow-uri "$mlflow_uri"
}

# Function to load a model
load_model() {
    local model_name="$1"
    local version="${2:-1}"
    
    echo "Loading model: $model_name (v$version)"
    curl -X POST http://localhost:8000/load \
        -H "Content-Type: application/json" \
        -d "{
            \"model_type\": \"text-classification\",
            \"registered_model_name\": \"$model_name\",
            \"registered_model_version\": \"$version\"
        }"
    echo ""
}

# Function to test inference
test_model() {
    local model_name="$1"
    
    echo "Testing inference with model: $model_name"
    curl -X POST "http://localhost:8000/infer/text-classification/$model_name" \
        -H "Content-Type: application/json" \
        -d '{
            "texts": ["I love this!", "This is terrible", "I am so excited!"],
            "top_k": 3
        }'
    echo ""
}

# Function to check if server is running
check_server() {
    if ! curl -s http://localhost:8000/health > /dev/null 2>&1; then
        echo "Error: Inference server is not running on http://localhost:8000"
        echo "Please start the server first with: $0 start"
        exit 1
    fi
}

# Main command handling
case "${1:-start}" in
    "start"|"server"|"run")
        echo "Starting FastAPI inference server on http://$HOST:$PORT"
        echo "Press Ctrl+C to stop"
        uvicorn app.main:app --host "$HOST" --port "$PORT" --reload
        ;;
    "register")
        if [ $# -lt 3 ]; then
            echo "Error: register command requires MODEL_ID and MODEL_NAME"
            echo "Usage: $0 register MODEL_ID MODEL_NAME [VERSION] [MLFLOW_URI]"
            exit 1
        fi
        register_model "$2" "$3" "${4:-1.0}" "${5:-http://localhost:5000}"
        ;;
    "load")
        if [ $# -lt 2 ]; then
            echo "Error: load command requires MODEL_NAME"
            echo "Usage: $0 load MODEL_NAME [VERSION]"
            exit 1
        fi
        check_server
        load_model "$2" "${3:-1}"
        ;;
    "test")
        if [ $# -lt 2 ]; then
            echo "Error: test command requires MODEL_NAME"
            echo "Usage: $0 test MODEL_NAME"
            exit 1
        fi
        check_server
        test_model "$2"
        ;;
    "help"|"-h"|"--help")
        show_usage
        ;;
    *)
        echo "Error: Unknown command '$1'"
        echo ""
        show_usage
        exit 1
        ;;
esac
