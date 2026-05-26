"""
IP address detection for both local and public IPs.
Local IP uses socket; public IP uses external HTTP services with fallbacks.
"""

import asyncio
import socket
import urllib.request
import logging
import psutil

logger = logging.getLogger(__name__)


def get_local_ip() -> tuple[str | None, str | None, str | None]:
    """
    Get the local IPv4, IPv6, and active adapter name.
    Returns: (ipv4, ipv6, adapter_name)
    """
    try:
        # Get active IPv4 by connecting UDP socket
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.settimeout(2)
        s.connect(("8.8.8.8", 80))
        ipv4 = s.getsockname()[0]
        s.close()
        
        # Try to find the adapter name and IPv6 matching this IPv4
        ipv6 = None
        adapter_name = None
        
        # Iterate over all network interfaces
        for interface_name, addrs in psutil.net_if_addrs().items():
            has_ipv4 = False
            temp_ipv6 = None
            
            for addr in addrs:
                if addr.family == socket.AF_INET and addr.address == ipv4:
                    has_ipv4 = True
                elif addr.family == socket.AF_INET6:
                    temp_ipv6 = addr.address.split('%')[0]  # Remove zone index if present
            
            if has_ipv4:
                adapter_name = interface_name
                ipv6 = temp_ipv6
                break

        return ipv4, ipv6, adapter_name
    except Exception as e:
        logger.error(f"Failed to get local IPs: {e}")
        return None, None, None


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
