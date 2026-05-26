"""
WiFi information monitor using Windows 'netsh wlan show interfaces'.
Parses output with regex to extract SSID, signal strength, and adapter info.
"""

import asyncio
import re


async def get_wifi_info() -> dict:
    """
    Get current WiFi connection information via netsh.

    Returns:
        Dict with keys: ssid, bssid, signal_pct, radio_type, authentication,
                        state, adapter_name, connected
    """
    try:
        proc = await asyncio.create_subprocess_exec(
            "netsh", "wlan", "show", "interfaces",
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        stdout, _ = await asyncio.wait_for(proc.communicate(), timeout=10)
        output = stdout.decode("utf-8", errors="ignore")

        # In non-English Windows, "State" or "Signal" might be translated.
        # However, "SSID", "BSSID", and "%" are almost universally maintained.
        ssid_match = re.search(r"^\s+SSID\s*:\s*(.+)$", output, re.MULTILINE)
        bssid_match = re.search(r"BSSID\s*:\s*(.+)", output, re.IGNORECASE)
        signal_match = re.search(r"(\d+)\s*%", output)
        adapter_match = re.search(r"Name\s*:\s*(.+)", output, re.IGNORECASE) # "Name" might be translated, but it's a best-effort

        ssid = ssid_match.group(1).strip() if ssid_match else None
        bssid = bssid_match.group(1).strip() if bssid_match else None
        signal = int(signal_match.group(1)) if signal_match else None
        adapter = adapter_match.group(1).strip() if adapter_match else None

        # If we have a BSSID and signal %, we are definitely connected to a network
        is_connected = bool(bssid and signal is not None)

        return {
            "ssid": ssid,
            "bssid": bssid,
            "signal_pct": signal,
            "radio_type": None,
            "authentication": None,
            "state": "connected" if is_connected else "disconnected",
            "adapter_name": adapter,
            "channel": None,
            "band": None,
            "connected": is_connected,
        }

    except (asyncio.TimeoutError, Exception):
        return {
            "ssid": None,
            "bssid": None,
            "signal_pct": None,
            "radio_type": None,
            "authentication": None,
            "state": "unknown",
            "adapter_name": None,
            "channel": None,
            "band": None,
            "connected": False,
        }
