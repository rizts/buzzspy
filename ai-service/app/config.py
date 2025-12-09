from pydantic_settings import BaseSettings
from functools import lru_cache
import os


class Settings(BaseSettings):
    # Server
    app_name: str = "BuzzSpy AI Service"
    app_version: str = "1.0.0"
    debug: bool = False
    
    # Replit detection
    is_replit: bool = os.getenv("REPL_ID") is not None
    repl_slug: str = os.getenv("REPL_SLUG", "")
    repl_owner: str = os.getenv("REPL_OWNER", "")
    
    # ML Model settings
    buzzer_threshold: float = 0.7
    min_account_age_days: int = 90
    high_frequency_threshold: int = 50  # tweets per day
    similarity_threshold: float = 0.85
    
    # NLP settings
    max_text_length: int = 500
    min_text_length: int = 10
    
    # Cache settings
    cache_ttl_seconds: int = 300  # 5 minutes
    
    class Config:
        env_file = ".env"


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()