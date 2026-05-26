"""
Simple boolean internet connectivity check.
Uses a quick TCP connection attempt to well-known hosts.
"""

import asyncio
import socket


async def is_internet_available() -> bool:
    """
    Quick check if internet is available by attempting TCP connections
    to reliable hosts on port 53 (DNS).
    """
    hosts = [("8.8.8.8", 53), ("1.1.1.1", 53), ("208.67.222.222", 53)]
    loop = asyncio.get_event_loop()

    for host, port in hosts:
        try:
            def check(h=host, p=port):
                s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                s.settimeout(3)
                s.connect((h, p))
                s.close()
                return True

            result = await loop.run_in_executor(None, check)
            if result:
                return True
        except Exception:
            continue

    return False
