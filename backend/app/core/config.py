from pydantic_settings import BaseSettings
from typing import List
import os
from pathlib import Path

# Get the backend directory path
BASE_DIR = Path(__file__).resolve().parent.parent.parent
ENV_FILE = BASE_DIR / ".env"


class Settings(BaseSettings):
    PROJECT_NAME: str = "AI Assessment Platform"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    # Security
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # Database - MUST be set in .env file
    DATABASE_URL: str
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "https://kpc-frontend-6tjoxshz5a-du.a.run.app",
        "https://kpc-frontend-480497851489.asia-northeast3.run.app"
    ]
    
    # AI APIs
    OPENAI_API_KEY: str = ""
    ANTHROPIC_API_KEY: str = ""
    GEMINI_API_KEY: str = ""
    # 여러 Gemini API 키 지원 (콤마로 구분)
    GEMINI_API_KEYS: str = ""  # 예: "key1,key2,key3"
    
    # Default AI Provider
    DEFAULT_AI_PROVIDER: str = "gemini"  # Options: openai, anthropic, gemini
    
    # AI Usage Limits
    AI_USAGE_LIMIT_PER_QUESTION: int = 10
    
    # Rate Limiting (requests per minute per key)
    GEMINI_RATE_LIMIT_PER_KEY: int = 15
    
    # Redis (Optional)
    REDIS_URL: str = ""
    
    class Config:
        env_file = str(ENV_FILE)
        env_file_encoding = 'utf-8'
        case_sensitive = True


settings = Settings()


