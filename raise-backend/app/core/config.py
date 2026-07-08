"""Application configuration settings"""
import os
from typing import Optional
from pydantic import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    # Database
    DATABASE_URL: str = ""
    
    # Redis & Celery
    REDIS_URL: str = ""
    CELERY_BROKER_URL: str = ""
    CELERY_RESULT_BACKEND: str = ""
    
    # Security
    SECRET_KEY: str = ""
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    ENCRYPTION_KEY: str = ""  # 32-byte hex string for AES-256-GCM message encryption
    
    # Supabase Authentication
    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = ""
    SUPABASE_JWT_SECRET: str = ""
    
    # Application
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    API_V1_PREFIX: str = "/api/v1"
    PROJECT_NAME: str = "RAISE - Robust AI Steganography Engine"
    
    # File Storage
    UPLOAD_DIR: str = "/app/temp/uploads"
    OUTPUT_DIR: str = "/app/temp/outputs"
    MAX_UPLOAD_SIZE: int = 10 * 1024 * 1024  # 10MB
    ALLOWED_IMAGE_TYPES: list = ["image/jpeg", "image/jpg", "image/png"]
    
    # AI Horde Configuration
    AI_HORDE_API_KEY: str = ""  # Set via environment variable
    AI_HORDE_BASE_URL: str = ""
    AI_HORDE_TIMEOUT: int = 300  # 5 minutes in seconds
    AI_HORDE_POLL_INTERVAL: int = 10  # Poll every 10 seconds
    AI_HORDE_MODEL: str = ""  # Preferred model name (empty = any available model)
    SD_IMAGE_WIDTH: int = 512
    SD_IMAGE_HEIGHT: int = 512
    SD_STEPS: int = 30
    SD_CFG_SCALE: int = 7
    SD_SAMPLER: str = "k_euler"
    
    # Steganalysis Integration
    STEGEXPOSE_JAR_PATH: str = "/app/StegExpose.jar"

    class Config:
        env_file = ".env"
        case_sensitive = True


# Create global settings instance
settings = Settings()

