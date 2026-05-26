"""
SQLAlchemy ORM models for all database tables.
"""

from datetime import datetime
from zoneinfo import ZoneInfo
from sqlalchemy import (
    Column,
    Integer,
    Float,
    String,
    Boolean,
    DateTime,
    Text,
    func,
)

from app.db.engine import Base

def now_ist():
    return datetime.now(ZoneInfo("Asia/Kolkata"))


class InternetStatusLog(Base):
    """Stores periodic internet connectivity and WiFi status snapshots."""

    __tablename__ = "internet_status_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    timestamp = Column(DateTime, nullable=False, default=now_ist)
    is_connected = Column(Boolean, nullable=False)
    ping_ms = Column(Float, nullable=True)
    packet_loss = Column(Float, nullable=True)
    wifi_ssid = Column(String(100), nullable=True)
    wifi_signal = Column(Integer, nullable=True)
    local_ip = Column(String(45), nullable=True)
    public_ip = Column(String(45), nullable=True)


class SpeedTestLog(Base):
    """Stores results from Ookla speedtest runs."""

    __tablename__ = "speed_test_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    timestamp = Column(DateTime, nullable=False, default=now_ist)
    download_mbps = Column(Float, nullable=False)
    upload_mbps = Column(Float, nullable=False)
    ping_ms = Column(Float, nullable=False)
    server_name = Column(String(200), nullable=True)
    server_location = Column(String(200), nullable=True)
    result_url = Column(String(500), nullable=True)


class Alert(Base):
    """Stores generated alerts when thresholds are breached or connectivity changes."""

    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, autoincrement=True)
    timestamp = Column(DateTime, nullable=False, default=now_ist)
    alert_type = Column(String(50), nullable=False)
    message = Column(Text, nullable=False)
    severity = Column(String(20), nullable=False)
    is_read = Column(Boolean, nullable=False, default=False)


class Settings(Base):
    """Stores user-configurable thresholds. Only one row (id=1) ever exists."""

    __tablename__ = "settings"

    id = Column(Integer, primary_key=True, default=1)
    low_download_mbps = Column(Float, nullable=False, default=10.0)
    low_upload_mbps = Column(Float, nullable=False, default=2.0)
    high_ping_ms = Column(Float, nullable=False, default=150.0)
    high_packet_loss_pct = Column(Float, nullable=False, default=5.0)
    ping_interval_sec = Column(Integer, nullable=False, default=5)
    speed_test_interval_sec = Column(Integer, nullable=False, default=900)
    updated_at = Column(DateTime, nullable=True)
