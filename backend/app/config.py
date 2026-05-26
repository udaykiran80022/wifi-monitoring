"""
Application settings loaded from environment variables and .env file.
Uses pydantic-settings for validation and type coercion.
"""

from pydantic_settings import BaseSettings
from pathlib import Path
import os


class Settings(BaseSettings):
    """All application configuration with sensible defaults."""

    # Paths
    APP_DATA_DIR: Path = Path(os.environ.get("APPDATA", ".")) / "WiFiMonitor"
    DB_PATH: Path = Path(os.environ.get("APPDATA", ".")) / "WiFiMonitor" / "monitor.db"
    SPEEDTEST_EXE: Path = Path(os.environ.get("APPDATA", ".")) / "WiFiMonitor" / "speedtest.exe"
    LOG_FILE: Path = Path(os.environ.get("APPDATA", ".")) / "WiFiMonitor" / "monitor.log"

    # Server
    HOST: str = "127.0.0.1"
    PORT: int = 8765

    # Monitoring intervals (seconds)
    PING_INTERVAL: int = 5
    WIFI_CHECK_INTERVAL: int = 10
    SPEED_TEST_INTERVAL: int = 900  # 15 minutes

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

# Ensure app data dir exists
settings.APP_DATA_DIR.mkdir(parents=True, exist_ok=True)
