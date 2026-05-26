"""
IP address detection for both local and public IPs.
Local IP uses socket; public IP uses external HTTP services with fallbacks.
"""

import asyncio
import socket
import urllib.request
import logging

logger = logging.getLogger(__name__)


def get_local_ip() -> str | None:
    """
    Get the local IP address by creating a UDP socket to an external host.
    Does not actually send any data.
    """
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.settimeout(2)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return None


async def get_public_ip() -> str | None:
    """
    Get the public IP address using external HTTP services with fallbacks.
    Runs synchronous HTTP calls in an executor to avoid blocking the event loop.
    """
    services = [
        "https://api.ipify.org",
        "https://icanhazip.com",
        "https://ifconfig.me/ip",
    ]

    loop = asyncio.get_event_loop()

    for url in services:
        try:
            def fetch(u=url):
                return urllib.request.urlopen(u, timeout=5).read().decode().strip()

            ip = await loop.run_in_executor(None, fetch)
            if ip and len(ip) < 46:  # Basic validation (max IPv6 length)
                return ip
        except Exception as e:
            logger.debug(f"Failed to get public IP from {url}: {e}")
            continue

    return None
