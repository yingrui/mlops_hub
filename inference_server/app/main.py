import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional, Any, Dict

import mlflow
from .config import settings
from .model_manager import manager

# Set up MLflow tracking URI
mlflow.set_tracking_uri("http://localhost:5000")


class LoadModelRequest(BaseModel):
    model_type: str = Field(..., description="Model type, e.g., text-classification")
    registered_model_name: Optional[str] = Field(default=None, description="MLflow registered model name")
    registered_model_version: Optional[str] = Field(default=None, description="MLflow registered model version, e.g., '1' or 'Production'")
    local_model_path: Optional[str] = Field(default=None, description="Local filesystem path to a HF model directory")
    huggingface_model_id: Optional[str] = Field(default=None, description="Hugging Face model id, e.g., 'distilbert-base-uncased-finetuned-sst-2-english'")
    huggingface_revision: Optional[str] = Field(default=None, description="Optional HF revision/tag")
    huggingface_token: Optional[str] = Field(default=None, description="Optional HF auth token for private models")
    model_kwargs: Optional[Dict[str, Any]] = Field(default=None, description="Optional kwargs passed to HF pipeline")


class InferRequest(BaseModel):
    texts: List[str]
    top_k: Optional[int] = None


app = FastAPI(title=settings.app_name)


@app.get("/health")
def health() -> dict:
    return {"status": "ok", "loaded": manager.is_loaded(), "model": manager.info()}


@app.get("/models")
def list_loaded_models() -> dict:
    """List all currently loaded models"""
    try:
        if not manager.is_loaded():
            return {"models": [], "count": 0}
        
        model_info = manager.info()
        if not model_info:
            return {"models": [], "count": 0}
        
        # Return the currently loaded model info
        # Determine the correct version based on source
        version = "latest"
        if model_info.get("source") == "mlflow" and model_info.get("registered_model_version"):
            version = model_info.get("registered_model_version")
        elif model_info.get("source") == "huggingface" and model_info.get("revision"):
            version = model_info.get("revision")
        elif model_info.get("source") == "local":
            version = "local"
        
        # Map source to user-friendly display
        source_type = "Unknown"
        if model_info.get("source") == "mlflow":
            source_type = "MLflow"
        elif model_info.get("source") == "huggingface":
            source_type = "Hugging Face"
        elif model_info.get("source") == "local":
            source_type = "Local"
        
        model_type = model_info.get("task", "unknown")
        model_name = model_info.get("registered_model_name") or model_info.get("source_uri", "unknown")
        # Generate the inference API URI
        uri = f"/infer/{model_type}/{model_name}"
        
        models = [{
            "name": model_name,
            "version": version,
            "type": model_type,
            "source": model_info.get("source_uri", "unknown"),
            "source_type": source_type,
            "loaded_at": model_info.get("loaded_at", "unknown"),
            "status": "loaded",
            "uri": uri  # Full inference API URI
        }]
        
        return {"models": models, "count": len(models)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/load")
def load_model(req: LoadModelRequest) -> dict:
    try:
        if req.model_type != "text-classification":
            raise ValueError("Unsupported model_type. Supported: text-classification")

        if req.local_model_path:
            info = manager.load_from_local(
                local_path=req.local_model_path,
                model_type=req.model_type,
                model_kwargs=req.model_kwargs,
            )
        elif req.huggingface_model_id:
            info = manager.load_from_hf(
                model_id=req.huggingface_model_id,
                revision=req.huggingface_revision,
                auth_token=req.huggingface_token,
                model_type=req.model_type,
                model_kwargs=req.model_kwargs,
            )
        else:
            if not req.registered_model_name or not req.registered_model_version:
                raise ValueError("Either local_model_path must be provided, or both registered_model_name and registered_model_version must be set.")
            model_uri = f"models:/{req.registered_model_name}/{req.registered_model_version}"
            info = manager.load_from_mlflow(
                model_uri=model_uri,
                model_revision=None,
                model_kwargs=req.model_kwargs,
                model_type=req.model_type,
                registered_model_name=req.registered_model_name,
                registered_model_version=req.registered_model_version,
            )
        return {"status": "loaded", "model": info}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/infer/{model_type}/{model_name}")
def infer(model_type: str, model_name: str, req: InferRequest) -> dict:
    # Validate request
    if not req.texts:
        return {"status": "error", "message": "Texts array cannot be empty"}
    
    for text in req.texts:
        if not text or not text.strip():
            return {"status": "error", "message": "Text cannot be empty"}
    
    try:
        
        if model_type != "text-classification":
            return {"status": "error", "message": "Unsupported model_type. Supported: text-classification"}
        
        # Optional sanity check: ensure currently loaded model matches
        info = manager.info()
        if not info or info.get("task") != model_type:
            return {"status": "error", "message": "Requested model not loaded. Load the model first via /load."}
        
        # Check if the model name matches either registered_model_name or source_uri
        model_name_matches = (
            info.get("registered_model_name") == model_name or 
            info.get("source_uri") == model_name or
            info.get("source_uri", "").endswith(f"/{model_name}")
        )
        
        if not model_name_matches:
            return {"status": "error", "message": f"Requested model '{model_name}' does not match loaded model. Load the correct model first via /load."}

        outputs = manager.predict(req.texts, top_k=req.top_k)
        return {"status": "success", "predictions": outputs}
    except Exception as e:
        return {"status": "error", "message": str(e)}


@app.post("/stop")
def stop_model() -> dict:
    manager.unload()
    return {"status": "stopped"}