"""
WiFi Monitor — Entry Point
Starts the FastAPI backend server and opens the dashboard in the default browser.
"""

import uvicorn
import webbrowser
import threading
import time
import sys
import os
import logging
from app.config import settings

logger = logging.getLogger("uvicorn")


def open_browser():
    """Open the dashboard in the default browser after a short delay."""
    time.sleep(2)
    webbrowser.open(f"http://localhost:5173")


def start_server():
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=False,
        log_level="info",
    )

def on_open(icon, item):
    webbrowser.open(f"http://localhost:5173")

def on_quit(icon, item):
    icon.stop()
    os._exit(0)

if __name__ == "__main__":
    from app.system.tray import setup_tray, run_tray
    
    logger.info("Initializing application setup...")
    
    # Simple file lock to prevent multiple instances
    lock_file = settings.LOG_FILE.parent / "wifi_monitor.lock"
    try:
        if os.name == "nt":
            import msvcrt
            fd = os.open(lock_file, os.O_CREAT | os.O_RDWR)
            msvcrt.locking(fd, msvcrt.LK_NBLCK, 1)
        else:
            import fcntl
            fd = os.open(lock_file, os.O_CREAT | os.O_RDWR)
            fcntl.flock(fd, fcntl.LOCK_EX | fcntl.LOCK_NB)
    except Exception:
        logger.error("Another instance is already running. Exiting.")
        sys.exit(1)

    setup_tray(on_open, on_quit)

    server_thread = threading.Thread(target=start_server, daemon=True)
    server_thread.start()
    
    threading.Thread(target=open_browser, daemon=True).start()

    run_tray()
