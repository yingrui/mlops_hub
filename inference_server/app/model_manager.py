from __future__ import annotations

import os
import threading
from datetime import datetime
from typing import Any, Dict, List, Optional

import mlflow
from transformers import pipeline, Pipeline

# Set up MinIO credentials for MLflow
os.environ['AWS_ACCESS_KEY_ID'] = 'minioadmin'
os.environ['AWS_SECRET_ACCESS_KEY'] = 'minioadmin'
os.environ['MLFLOW_S3_ENDPOINT_URL'] = 'http://localhost:9000'


class ModelManager:
    """Lifecycle manager for a single text-classification model loaded via MLflow.

    Thread-safe; ensures only one active model at a time.
    """

    def __init__(self, task: str = "text-classification", device: str = "cpu") -> None:
        self._lock = threading.RLock()
        self._pipeline: Optional[Pipeline] = None
        self._model_info: Optional[Dict[str, Any]] = None
        self._task = task
        self._device = 0 if device.startswith("cuda") else -1

    def is_loaded(self) -> bool:
        with self._lock:
            return self._pipeline is not None

    def info(self) -> Optional[Dict[str, Any]]:
        with self._lock:
            return dict(self._model_info) if self._model_info else None

    def unload(self) -> None:
        with self._lock:
            self._pipeline = None
            self._model_info = None

    def load_from_mlflow(self, model_uri: str, model_revision: Optional[str] = None, model_kwargs: Optional[Dict[str, Any]] = None, *, model_type: Optional[str] = None, registered_model_name: Optional[str] = None, registered_model_version: Optional[str] = None) -> Dict[str, Any]:
        """Load a HF pipeline using artifacts from MLflow model registry or run URI.

        model_uri can be:
          - "models:/<name>/<stage>" (registry)
          - "runs:/<run_id>/artifacts/<path>" (run)
          - any MLflow-supported URI pointing to a model export with HF files
        """
        with self._lock:
            try:
                # Try to load as transformers model first
                model = mlflow.transformers.load_model(model_uri)
                self._pipeline = model
            except Exception:
                # Fallback to downloading artifacts and creating pipeline
                local_path = mlflow.artifacts.download_artifacts(model_uri)
                
                # Check if this is a transformers model directory
                import os
                config_path = os.path.join(local_path, "config.json")
                if os.path.exists(config_path):
                    # This is a raw transformers model directory
                    kwargs = model_kwargs or {}
                    task = model_type or self._task
                    pipe = pipeline(task=task, model=local_path, tokenizer=local_path, device=self._device, **kwargs)
                    self._pipeline = pipe
                else:
                    # This might be a pyfunc model, try to load it
                    model = mlflow.pyfunc.load_model(model_uri)
                    if hasattr(model, 'predict'):
                        self._pipeline = model
                    else:
                        raise ValueError("Unsupported model format")

            self._model_info = {
                "source_uri": model_uri,
                "revision": model_revision,
                "task": model_type or self._task,
                "device": self._device,
                "registered_model_name": registered_model_name,
                "registered_model_version": registered_model_version,
                "source": "mlflow",
                "loaded_at": datetime.now().isoformat(),
            }
            return dict(self._model_info)

    def predict(self, texts: List[str], top_k: Optional[int] = None) -> List[Any]:
        with self._lock:
            if self._pipeline is None:
                raise RuntimeError("Model is not loaded")
            return self._pipeline(texts, top_k=top_k) if top_k is not None else self._pipeline(texts)

    def load_from_local(self, local_path: str, *, model_type: Optional[str] = None, model_kwargs: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        with self._lock:
            kwargs = model_kwargs or {}
            task = model_type or self._task
            pipe = pipeline(task=task, model=local_path, tokenizer=local_path, device=self._device, **kwargs)

            self._pipeline = pipe
            self._model_info = {
                "source_uri": local_path,
                "revision": None,
                "task": task,
                "device": self._device,
                "registered_model_name": None,
                "registered_model_version": None,
                "source": "local",
                "loaded_at": datetime.now().isoformat(),
            }
            return dict(self._model_info)

    def load_from_hf(self, model_id: str, *, revision: Optional[str] = None, auth_token: Optional[str] = None, model_type: Optional[str] = None, model_kwargs: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        with self._lock:
            kwargs = model_kwargs or {}
            task = model_type or self._task
            # The HF pipeline can take model and tokenizer identifiers directly
            # Use token parameter instead of use_auth_token for newer transformers versions
            pipeline_kwargs = {"task": task, "model": model_id, "tokenizer": model_id, "device": self._device, **kwargs}
            if revision:
                pipeline_kwargs["revision"] = revision
            if auth_token:
                pipeline_kwargs["token"] = auth_token
            
            pipe = pipeline(**pipeline_kwargs)

            # Try to get the actual model revision/commit hash from the loaded model
            actual_revision = revision
            if hasattr(pipe.model, 'config') and hasattr(pipe.model.config, '_commit_hash'):
                actual_revision = pipe.model.config._commit_hash
            elif hasattr(pipe.model, 'config') and hasattr(pipe.model.config, 'model_type'):
                # For models without specific revision, use the model name as version
                actual_revision = model_id.split('/')[-1] if '/' in model_id else model_id

            self._pipeline = pipe
            self._model_info = {
                "source_uri": model_id,
                "revision": actual_revision,
                "task": task,
                "device": self._device,
                "registered_model_name": None,
                "registered_model_version": None,
                "source": "huggingface",
                "loaded_at": datetime.now().isoformat(),
            }
            return dict(self._model_info)


# Singleton manager for simple usage
manager = ModelManager()