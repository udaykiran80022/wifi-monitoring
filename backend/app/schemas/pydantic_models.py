"""
Pydantic v2 response schemas for all API endpoints.
"""

from datetime import datetime
from typing import Annotated
from pydantic import BaseModel, ConfigDict, Field, PlainSerializer

UtcDatetime = Annotated[
    datetime,
    PlainSerializer(
        lambda dt: (dt.isoformat() + "Z") if dt.tzinfo is None else dt.isoformat(),
        return_type=str,
    )
]


# --- Status Schemas ---


class StatusLogResponse(BaseModel):
    """Response schema for a single internet status log entry."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    timestamp: UtcDatetime
    is_connected: bool
    ping_ms: float | None = None
    packet_loss: float | None = None
    wifi_ssid: str | None = None
    wifi_signal: int | None = None
    local_ip: str | None = None
    public_ip: str | None = None


class UptimeResponse(BaseModel):
    """Response schema for uptime percentage calculation."""

    hours: int
    total_checks: int
    connected_checks: int
    uptime_percent: float


# --- Speed Schemas ---


class SpeedTestResponse(BaseModel):
    """Response schema for a single speed test result."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    timestamp: UtcDatetime
    download_mbps: float
    upload_mbps: float
    ping_ms: float
    server_name: str | None = None
    server_location: str | None = None
    result_url: str | None = None


class SpeedAverageResponse(BaseModel):
    """Response schema for daily speed averages."""

    date: str
    avg_download: float | None = None
    avg_upload: float | None = None
    avg_ping: float | None = None


# --- Alert Schemas ---


class AlertResponse(BaseModel):
    """Response schema for an alert entry."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    timestamp: UtcDatetime
    alert_type: str
    message: str
    severity: str
    is_read: bool


# --- Downtime Schemas ---


class DowntimePeriodResponse(BaseModel):
    """Response schema for a single downtime/outage period."""

    started_at: UtcDatetime
    ended_at: UtcDatetime | None = None
    duration_minutes: float


class DowntimeSummaryResponse(BaseModel):
    """Response schema for downtime summary statistics."""

    days: int
    total_downtime_minutes: float
    outage_count: int


# --- Analytics Schemas ---


class DailyAnalyticsResponse(BaseModel):
    """Response schema for per-day analytics."""

    date: str
    avg_download: float | None = None
    avg_upload: float | None = None
    avg_ping: float | None = None
    downtime_minutes: float = 0.0
    outage_count: int = 0


class HourlyAnalyticsResponse(BaseModel):
    """Response schema for per-hour analytics."""

    hour: str
    avg_ping: float | None = None
    avg_packet_loss: float | None = None
    check_count: int = 0


class BaselineResponse(BaseModel):
    """Response schema for ISP speed baseline."""
    
    download_mbps: float | None = None
    upload_mbps: float | None = None
    ping_ms: float | None = None


class HeatmapResponse(BaseModel):
    """Response schema for 24x7 heatmap grid."""
    
    day_of_week: int
    hour: int
    avg_ping: float | None = None
    disconnected_count: int = 0


# --- Settings Schemas ---


class SettingsResponse(BaseModel):
    """Response schema for current settings."""

    model_config = ConfigDict(from_attributes=True)

    low_download_mbps: float
    low_upload_mbps: float
    high_ping_ms: float
    high_packet_loss_pct: float
    ping_interval_sec: int
    speed_test_interval_sec: int
    updated_at: UtcDatetime | None = None


class SettingsUpdateRequest(BaseModel):
    """Request schema for updating settings. All values must be positive."""

    low_download_mbps: float | None = Field(default=None, ge=1.0)
    low_upload_mbps: float | None = Field(default=None, ge=1.0)
    high_ping_ms: float | None = Field(default=None, ge=1.0)
    high_packet_loss_pct: float | None = Field(default=None, ge=0.0)
    ping_interval_sec: int | None = Field(default=None, ge=1)
    speed_test_interval_sec: int | None = Field(default=None, ge=60)


# --- WebSocket Schemas ---


class StatusUpdateMessage(BaseModel):
    """Schema for WebSocket status update broadcast."""

    type: str = "status_update"
    timestamp: str
    is_connected: bool
    ping_ms: float | None = None
    packet_loss: float | None = None
    wifi_ssid: str | None = None
    wifi_signal: int | None = None
    local_ip: str | None = None
    public_ip: str | None = None


class SpeedUpdateMessage(BaseModel):
    """Schema for WebSocket speed test result broadcast."""

    type: str = "speed_update"
    timestamp: str
    download_mbps: float
    upload_mbps: float
    ping_ms: float
    server_name: str | None = None
    server_location: str | None = None
