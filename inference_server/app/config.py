from pydantic import Field
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    app_name: str = Field(default="inference-server")
    environment: str = Field(default="development")

    host: str = Field(default="0.0.0.0")
    port: int = Field(default=8000)

    # MLflow
    mlflow_tracking_uri: Optional[str] = Field(default=None)
    mlflow_registry_uri: Optional[str] = Field(default=None)

    # HuggingFace
    hf_task: str = Field(default="text-classification")

    # Runtime
    device: str = Field(default="cpu")  # "cpu" or like "cuda:0"
    model_max_length: Optional[int] = Field(default=None)

    class Config:
        env_prefix = "INFER_"
        case_sensitive = False
        protected_namespaces = ('settings_',)


settings = Settings()


