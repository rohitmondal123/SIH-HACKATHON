import os
from pydantic import BaseModel

class Settings(BaseModel):
    PROJECT_NAME: str = "MPLADS AI Monitor"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "mplads-sih-2026-super-secret-key-ai-monitor")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./mplads_monitor.db")
    ALLOWED_ORIGINS: list[str] = ["*"]

settings = Settings()
