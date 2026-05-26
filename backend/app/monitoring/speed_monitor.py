"""
Speed test monitor using Ookla's official speedtest.exe CLI.
Runs the binary with JSON output and parses the results.
"""

import asyncio
import json
import logging
import subprocess

from app.config import settings

logger = logging.getLogger(__name__)


async def run_speed_test() -> dict | None:
    """
    Run Ookla speedtest.exe and return parsed results.

    Returns:
        Dict with speed metrics or None if test fails or exe not found.
    """
    if not settings.SPEEDTEST_EXE.exists():
        logger.warning(f"speedtest.exe not found at {settings.SPEEDTEST_EXE}")
        return None

    try:
        proc = await asyncio.to_thread(
            subprocess.run,
            [
                str(settings.SPEEDTEST_EXE),
                "--format=json",
                "--accept-license",
                "--accept-gdpr",
            ],
            capture_output=True,
            text=True,
            timeout=120,
        )
        output = proc.stdout

        if proc.returncode != 0:
            logger.error(f"speedtest.exe returned code {proc.returncode}: {proc.stderr}")
            return None

        data = json.loads(output)

        # Ookla reports bandwidth in bytes/sec, convert to Mbps
        download_bps = data.get("download", {}).get("bandwidth", 0)
        upload_bps = data.get("upload", {}).get("bandwidth", 0)
        ping_latency = data.get("ping", {}).get("latency", 0)

        server = data.get("server", {})
        result = data.get("result", {})

        return {
            "download_mbps": round(download_bps * 8 / 1_000_000, 2),
            "upload_mbps": round(upload_bps * 8 / 1_000_000, 2),
            "ping_ms": round(ping_latency, 2),
            "server_name": server.get("name"),
            "server_location": f"{server.get('location', '')}, {server.get('country', '')}".strip(", "),
            "result_url": result.get("url"),
        }

    except subprocess.TimeoutExpired:
        logger.error("Speed test timed out after 120 seconds")
        return None
    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse speedtest output: {e}")
        return None
    except Exception as e:
        logger.error(f"Speed test error: {e}")
        return None
