#!/usr/bin/env python3
"""
Script to download a Hugging Face model and register it to MLflow.
Simplified version that only supports the parameters used by dev.sh.
"""

import argparse
import os
import tempfile
from pathlib import Path

import mlflow
from transformers import AutoModelForSequenceClassification, AutoTokenizer

# Set up MinIO credentials for MLflow
os.environ['AWS_ACCESS_KEY_ID'] = 'minioadmin'
os.environ['AWS_SECRET_ACCESS_KEY'] = 'minioadmin'
os.environ['MLFLOW_S3_ENDPOINT_URL'] = 'http://localhost:9000'


def download_hf_model(model_id: str, output_dir: str) -> None:
    """Download a Hugging Face model and tokenizer to local directory."""
    print(f"Downloading model {model_id} to {output_dir}")
    
    # Create output directory
    Path(output_dir).mkdir(parents=True, exist_ok=True)
    
    # Download tokenizer
    print("Downloading tokenizer...")
    tokenizer = AutoTokenizer.from_pretrained(model_id)
    tokenizer.save_pretrained(output_dir)
    
    # Download model
    print("Downloading model...")
    model = AutoModelForSequenceClassification.from_pretrained(model_id)
    model.save_pretrained(output_dir)
    
    print(f"Model downloaded successfully to {output_dir}")


def register_to_mlflow(
    model_path: str,
    model_name: str,
    version: str,
    model_id: str
) -> None:
    """Register the downloaded model to MLflow as artifacts."""
    print(f"Registering model to MLflow: {model_name} v{version}")
    
    # Set default tags
    tags = {
        "framework": "transformers",
        "task": "text-classification",
        "source": "huggingface"
    }
    
    # Register the model using MLflow artifacts with local storage
    with mlflow.start_run() as run:
        # Log the model directory as artifacts
        mlflow.log_artifacts(model_path, artifact_path="model")
        
        # Create a transformers pipeline from the downloaded model
        from transformers import pipeline
        pipe = pipeline("text-classification", model=model_path, tokenizer=model_path)
        
        # Log the model using transformers flavor
        model_info = mlflow.transformers.log_model(
            transformers_model=pipe,
            artifact_path="model",
            registered_model_name=model_name,
            tags=tags
        )
        
        # Add metadata
        mlflow.set_tag("mlflow.runName", f"{model_name}-v{version}")
        mlflow.set_tag("version", version)
        mlflow.set_tag("original_model_id", model_id)
        mlflow.set_tag("model_type", "huggingface_transformers")
        
        for key, value in tags.items():
            mlflow.set_tag(key, value)
        
        print(f"Model registered successfully!")
        print(f"Model URI: {model_info.model_uri}")
        print(f"Run ID: {run.info.run_id}")


def main():
    parser = argparse.ArgumentParser(description="Download HF model and register to MLflow")
    parser.add_argument("--model-id", required=True, help="Hugging Face model ID")
    parser.add_argument("--model-name", required=True, help="MLflow registered model name")
    parser.add_argument("--version", default="1.0", help="Model version (default: 1.0)")
    parser.add_argument("--mlflow-uri", help="MLflow tracking URI (default: from environment)")
    
    args = parser.parse_args()
    
    # Set MLflow tracking URI if provided
    if args.mlflow_uri:
        mlflow.set_tracking_uri(args.mlflow_uri)
        print(f"Using MLflow tracking URI: {args.mlflow_uri}")
    
    # Create temporary directory
    temp_dir = tempfile.mkdtemp(prefix="hf_model_")
    model_dir = os.path.join(temp_dir, "model")
    
    try:
        # Download the model
        download_hf_model(
            model_id=args.model_id,
            output_dir=model_dir
        )
        
        # Register to MLflow
        register_to_mlflow(
            model_path=model_dir,
            model_name=args.model_name,
            version=args.version,
            model_id=args.model_id
        )
        
        print(f"\n✅ Successfully registered model '{args.model_name}' v{args.version}")
        print(f"📁 Model files location: {model_dir}")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return 1
    
    finally:
        # Cleanup temporary directory
        import shutil
        if os.path.exists(temp_dir):
            shutil.rmtree(temp_dir)
            print(f"🗑️  Cleaned up temporary directory: {temp_dir}")
    
    return 0


if __name__ == "__main__":
    exit(main())
