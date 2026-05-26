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

        def extract(pattern: str) -> str | None:
            """Extract first capture group matching pattern from output."""
            m = re.search(pattern, output, re.IGNORECASE | re.MULTILINE)
            return m.group(1).strip() if m else None

        # SSID needs special handling to not match BSSID
        ssid = extract(r"^\s+SSID\s*:\s*(.+)$")
        bssid = extract(r"BSSID\s*:\s*(.+)")
        signal = extract(r"Signal\s*:\s*(\d+)%")
        radio = extract(r"Radio type\s*:\s*(.+)")
        auth = extract(r"Authentication\s*:\s*(.+)")
        state = extract(r"State\s*:\s*(.+)")
        adapter = extract(r"Name\s*:\s*(.+)")
        channel = extract(r"Channel\s*:\s*(\d+)")
        band = extract(r"Band\s*:\s*(.+)")

        return {
            "ssid": ssid,
            "bssid": bssid,
            "signal_pct": int(signal) if signal else None,
            "radio_type": radio,
            "authentication": auth,
            "state": state,
            "adapter_name": adapter,
            "channel": channel,
            "band": band,
            "connected": state is not None and state.lower() == "connected",
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
