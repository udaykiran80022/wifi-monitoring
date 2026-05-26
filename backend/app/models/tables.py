"""
SQLAlchemy ORM models for all database tables.
"""

from datetime import datetime
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


class InternetStatusLog(Base):
    """Stores periodic internet connectivity and WiFi status snapshots."""

    __tablename__ = "internet_status_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    timestamp = Column(DateTime, nullable=False, server_default=func.now())
    is_connected = Column(Boolean, nullable=False)
    ping_ms = Column(Float, nullable=True)
    packet_loss = Column(Float, nullable=True)
    wifi_ssid = Column(String(100), nullable=True)
    wifi_signal = Column(Integer, nullable=True)
    local_ip = Column(String(45), nullable=True)
    public_ip = Column(String(45), nullable=True)
    jitter_ms = Column(Float, nullable=True)
    ipv6_address = Column(String(45), nullable=True)
    adapter_name = Column(String(100), nullable=True)


class SpeedTestLog(Base):
    """Stores results from Ookla speedtest runs."""

    __tablename__ = "speed_test_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    timestamp = Column(DateTime, nullable=False, server_default=func.now())
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
    timestamp = Column(DateTime, nullable=False, server_default=func.now())
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
    speed_test_interval_sec = Column(Integer, nullable=False, default=3600)
    smtp_server = Column(String(200), nullable=True)
    smtp_user = Column(String(100), nullable=True)
    smtp_pass = Column(String(100), nullable=True)
    webhook_url = Column(String(500), nullable=True)
    speed_provider = Column(String(50), nullable=False, default="ookla")
    updated_at = Column(DateTime, nullable=True)
