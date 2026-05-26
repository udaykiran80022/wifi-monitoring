"""
Ping monitor using Windows ping.exe via asyncio subprocess.
Pings multiple hosts concurrently and returns aggregated results.
"""

import asyncio
import re
from app.config import settings


async def ping_host(host: str, count: int = 4) -> dict:
    """
    Ping a single host using Windows ping.exe.

    Args:
        host: IP address or hostname to ping.
        count: Number of ping packets to send.

    Returns:
        Dict with keys: host, avg_ms, min_ms, max_ms, packet_loss_pct, success
    """
    try:
        proc = await asyncio.create_subprocess_exec(
            "ping", "-n", str(count), "-w", "2000", host,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        stdout, _ = await asyncio.wait_for(proc.communicate(), timeout=30)
        output = stdout.decode("utf-8", errors="ignore")

        # Parse packet loss percentage
        loss_match = re.search(r"(\d+)% loss", output)
        packet_loss = float(loss_match.group(1)) if loss_match else 100.0

        # Parse latency statistics
        avg_match = re.search(r"Average = (\d+)ms", output)
        avg_ms = float(avg_match.group(1)) if avg_match else None

        min_match = re.search(r"Minimum = (\d+)ms", output)
        max_match = re.search(r"Maximum = (\d+)ms", output)

        return {
            "host": host,
            "avg_ms": avg_ms,
            "min_ms": float(min_match.group(1)) if min_match else None,
            "max_ms": float(max_match.group(1)) if max_match else None,
            "packet_loss_pct": packet_loss,
            "success": packet_loss < 100.0,
        }

    except (asyncio.TimeoutError, Exception) as e:
        return {
            "host": host,
            "avg_ms": None,
            "min_ms": None,
            "max_ms": None,
            "packet_loss_pct": 100.0,
            "success": False,
        }


async def check_internet_ping() -> dict:
    """
    Ping all configured hosts concurrently and return aggregated connectivity result.

    Returns:
        Dict with keys: is_connected, avg_ms, packet_loss_pct
    """
    tasks = [ping_host(h, count=2) for h in settings.PING_HOSTS]
    results = await asyncio.gather(*tasks, return_exceptions=True)

    successful = [r for r in results if isinstance(r, dict) and r["success"]]

    if not successful:
        return {
            "is_connected": False,
            "avg_ms": None,
            "packet_loss_pct": 100.0,
        }

    # Use the best (lowest) average ping among successful hosts
    best = min(successful, key=lambda r: r["avg_ms"] or float("inf"))

    # Average packet loss across all hosts that returned valid results
    valid_results = [r for r in results if isinstance(r, dict)]
    avg_loss = sum(r["packet_loss_pct"] for r in valid_results) / len(valid_results)

    return {
        "is_connected": True,
        "avg_ms": best["avg_ms"],
        "packet_loss_pct": round(avg_loss, 2),
    }
