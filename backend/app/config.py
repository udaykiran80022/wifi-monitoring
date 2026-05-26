"""
Application settings loaded from environment variables and .env file.
Uses pydantic-settings for validation and type coercion.
"""

from pydantic_settings import BaseSettings
from pathlib import Path
import os


class Settings(BaseSettings):
    """All application configuration with sensible defaults."""

    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql+asyncpg://postgres:admin123@localhost:5432/postgres",
    )
    SPEEDTEST_EXE: Path = Path(os.environ.get("APPDATA", ".")) / "WiFiMonitor" / "speedtest.exe"
    LOG_FILE: Path = Path(os.environ.get("APPDATA", ".")) / "WiFiMonitor" / "monitor.log"

    # Server config
    HOST: str = os.getenv("HOST", "127.0.0.1")
    PORT: int = int(os.getenv("PORT", "8765"))
    API_TOKEN: str = os.getenv("API_TOKEN", "changeme")

    # Monitoring intervals (seconds)
    PING_INTERVAL: int = 5
    WIFI_CHECK_INTERVAL: int = 10
    SPEED_TEST_INTERVAL: int = 3600

    # Ping targets
    PING_HOSTS: list[str] = ["8.8.8.8", "1.1.1.1", "8.8.4.4"]

    # Thresholds (defaults, user can override via settings API)
    LOW_DOWNLOAD_MBPS: float = 10.0
    LOW_UPLOAD_MBPS: float = 2.0
    HIGH_PING_MS: float = 150.0
    HIGH_PACKET_LOSS_PCT: float = 5.0

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
    }


settings = Settings()

# Ensure log directory exists
settings.LOG_FILE.parent.mkdir(parents=True, exist_ok=True)
