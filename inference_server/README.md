 # Inference Server

FastAPI service for text classification using HuggingFace Transformers with models loaded from MLflow.

## Setup

Conda (recommended):

```bash
conda env create -f environment.yml
conda activate mlops_hub
```

Pip (alternative):

```bash
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
```

Environment variables (optional, prefix `INFER_`):

- `INFER_MLFLOW_TRACKING_URI` – MLflow tracking URI
- `INFER_MLFLOW_REGISTRY_URI` – MLflow registry URI
- `INFER_DEVICE` – `cpu` or `cuda:0`
- `INFER_HF_TASK` – HF pipeline task (default `text-classification`)

## Run

### Using the dev script (recommended):

```bash
# Start the inference server
./dev.sh start

# Register a model to MLflow
./dev.sh register cardiffnlp/twitter-roberta-base-emotion emotion-classifier 1.0

# Load a model from MLflow
./dev.sh load emotion-classifier 1

# Test inference
./dev.sh test emotion-classifier

# Show help
./dev.sh help
```

### Manual start:

```bash
conda activate mlops_hub  # if using conda
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

## Quick Start

Run the complete workflow:

```bash
# Terminal 1: Start the inference server
./dev.sh start

# Terminal 2: Register a model to MLflow
./dev.sh register cardiffnlp/twitter-roberta-base-emotion emotion-classifier 1.0

# Terminal 2: Load the model into the server
./dev.sh load emotion-classifier 1

# Terminal 2: Test inference
./dev.sh test emotion-classifier
```

Or use the manual approach:

```bash
# Terminal 1: Start server
./dev.sh start

# Terminal 2: Register model
python register_hf_model_to_mlflow.py \
  --model-id "cardiffnlp/twitter-roberta-base-emotion" \
  --model-name "emotion-classifier" \
  --version "1.0" \
  --mlflow-uri "http://localhost:5000"

# Terminal 2: Load model
curl -X POST http://localhost:8000/load \
  -H "Content-Type: application/json" \
  -d '{
        "model_type": "text-classification",
        "registered_model_name": "emotion-classifier",
        "registered_model_version": "1"
      }'

# Terminal 2: Test inference
curl -X POST http://localhost:8000/infer/text-classification/emotion-classifier \
  -H "Content-Type: application/json" \
  -d '{
        "texts": ["I love this!", "This is terrible"],
        "top_k": 3
      }'
```

## MLflow Model Registration

Register Hugging Face models to MLflow for use with the inference server:

```bash
# Register a model to MLflow
python register_hf_model_to_mlflow.py \
  --model-id "cardiffnlp/twitter-roberta-base-emotion" \
  --model-name "emotion-classifier" \
  --version "1.0" \
  --mlflow-uri "http://localhost:5000" \
  --description "Emotion classification model for Twitter text"

# Register with custom tags
python register_hf_model_to_mlflow.py \
  --model-id "distilbert-base-uncased-finetuned-sst-2-english" \
  --model-name "sentiment-classifier" \
  --version "1.0" \
  --tags "task=sentiment,domain=nlp,framework=transformers"

# Register private model with auth token
python register_hf_model_to_mlflow.py \
  --model-id "your-org/private-model" \
  --model-name "private-classifier" \
  --version "1.0" \
  --auth-token "hf_your_token_here"
```

Then load the registered model:

```bash
curl -X POST http://localhost:8000/load \
  -H "Content-Type: application/json" \
  -d '{
        "model_type": "text-classification",
        "registered_model_name": "emotion-classifier",
        "registered_model_version": "1.0"
      }'
```

## APIs

- `GET /health` – server status and current model info
- `POST /load` – load model from MLflow registry by name/version

  Request body:
  ```json
  {
    "model_type": "text-classification",
    "registered_model_name": "my-text-model",
    "registered_model_version": "Production",
    "model_kwargs": {"truncation": true}
  }
  ```

  Or load from a local path (overrides registry params):
  ```json
  {
    "model_type": "text-classification",
    "local_model_path": "/models/distilbert-sst2",
    "model_kwargs": {"truncation": true}
  }
  ```

  Or load directly from Hugging Face Hub:
  ```json
  {
    "model_type": "text-classification",
    "huggingface_model_id": "distilbert-base-uncased-finetuned-sst-2-english",
    "huggingface_revision": null,
    "huggingface_token": null,
    "model_kwargs": {"truncation": true}
  }
  ```

### Quick test with cardiffnlp/twitter-roberta-base-emotion

Load from HF:

```bash
curl -X POST http://localhost:8000/load \
  -H "Content-Type: application/json" \
  -d '{
        "model_type": "text-classification",
        "huggingface_model_id": "cardiffnlp/twitter-roberta-base-emotion"
      }'
```

Infer:

```bash
curl -X POST http://localhost:8000/infer/text-classification/twitter-roberta-base-emotion \
  -H "Content-Type: application/json" \
  -d '{
        "texts": ["I love this!", "This is terrible."],
        "top_k": 2                                                       
      }'
```

- `POST /infer/{model_type}/{model_name}` – run inference

  Request body:
  ```json
  {
    "texts": ["I love this!", "This is terrible."],
    "top_k": 2
  }
  ```

- `POST /stop` – unload model from memory

## MinIO Configuration

The inference server is configured to work with MinIO (S3-compatible storage) for MLflow model storage. The following environment variables are automatically set:

```bash
export AWS_ACCESS_KEY_ID=minioadmin
export AWS_SECRET_ACCESS_KEY=minioadmin
export MLFLOW_S3_ENDPOINT_URL=http://localhost:9000
```

These are set automatically in the application code, so no manual configuration is required.

## Complete Working Example

Here's a complete working example that demonstrates the full workflow:

```bash
# 1. Start the inference server
./dev.sh

# 2. In another terminal, register a model
python register_hf_model_to_mlflow.py \
  --model-id "cardiffnlp/twitter-roberta-base-emotion" \
  --model-name "emotion-classifier" \
  --version "1.0" \
  --mlflow-uri "http://localhost:5000"

# 3. Load the model
curl -X POST http://localhost:8000/load \
  -H "Content-Type: application/json" \
  -d '{
        "model_type": "text-classification",
        "registered_model_name": "emotion-classifier",
        "registered_model_version": "1"
      }'

# 4. Run inference
curl -X POST http://localhost:8000/infer/text-classification/emotion-classifier \
  -H "Content-Type: application/json" \
  -d '{
        "texts": ["I love this!", "This is terrible"],
        "top_k": 3
      }'
```

This will:
1. Register a Hugging Face model to MLflow with the transformers flavor
2. Load the model from MLflow into the inference server
3. Run text classification inference on the loaded model


