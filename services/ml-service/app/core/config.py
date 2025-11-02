from pydantic_settings import BaseSettings
from functools import lru_cache
import os
from pathlib import Path

class Settings(BaseSettings):
    # Environment
    ENV: str = "development"
    LOG_LEVEL: str = "info"
    
    # Model configuration - Use proper path handling for Windows
    MODEL_PATH: str = "app/models"  # Relative path for development
    MAX_SEQUENCE_LENGTH: int = 100
    
    # Server configuration
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    @property
    def model_path_resolved(self) -> Path:
        """Get resolved absolute path for models"""
        return Path(self.MODEL_PATH).resolve()
    
    class Config:
        env_file = ".env"
        case_sensitive = True

@lru_cache()
def get_settings():
    return Settings()

settings = get_settings()
