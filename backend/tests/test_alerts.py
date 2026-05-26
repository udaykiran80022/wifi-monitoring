import pytest
import pytest_asyncio
import app.alerts.engine as engine
from app.alerts.engine import evaluate_ping_thresholds, evaluate_speed_thresholds

@pytest.fixture(autouse=True)
def reset_active_alerts():
    engine._active_alerts.clear()
    yield
    engine._active_alerts.clear()

@pytest.mark.asyncio
async def test_evaluate_ping_thresholds_high_ping(mocker):
    mock_create = mocker.patch("app.alerts.engine.check_and_create_alert")
    
    # 1. First time threshold breached -> should create alert
    await evaluate_ping_thresholds(200.0, 0.0, 150.0, 5.0)
    mock_create.assert_called_once_with("HIGH_PING", "Ping is 200.0ms (threshold: 150.0ms)", "warning")
    assert engine._active_alerts.get("HIGH_PING") is True
    
    # 2. Second time threshold breached -> deduplication, should NOT create alert
    mock_create.reset_mock()
    await evaluate_ping_thresholds(210.0, 0.0, 150.0, 5.0)
    mock_create.assert_not_called()
    assert engine._active_alerts.get("HIGH_PING") is True
    
    # 3. Threshold recovered -> should create recovery alert
    mock_create.reset_mock()
    await evaluate_ping_thresholds(100.0, 0.0, 150.0, 5.0)
    mock_create.assert_called_once_with("PING_RECOVERED", "Ping has recovered to normal levels", "info")
    assert engine._active_alerts.get("HIGH_PING") is False

@pytest.mark.asyncio
async def test_evaluate_ping_thresholds_packet_loss(mocker):
    mock_create = mocker.patch("app.alerts.engine.check_and_create_alert")
    
    await evaluate_ping_thresholds(50.0, 10.0, 150.0, 5.0)
    mock_create.assert_called_once_with("HIGH_PACKET_LOSS", "Packet loss is 10.0% (threshold: 5.0%)", "warning")
    assert engine._active_alerts.get("HIGH_PACKET_LOSS") is True

@pytest.mark.asyncio
async def test_evaluate_speed_thresholds_low_download(mocker):
    mock_create = mocker.patch("app.alerts.engine.check_and_create_alert")
    
    # Drop below threshold
    await evaluate_speed_thresholds(5.0, 50.0, 10.0, 20.0)
    mock_create.assert_called_once_with("LOW_DOWNLOAD", "Download speed 5.0 Mbps is below threshold (10.0 Mbps)", "warning")
    
    # Recover
    mock_create.reset_mock()
    await evaluate_speed_thresholds(15.0, 50.0, 10.0, 20.0)
    mock_create.assert_called_once_with("DOWNLOAD_RECOVERED", "Download speed 15.0 Mbps has recovered", "info")
