"""
WiFi Monitor — Entry Point
Starts the FastAPI backend server and opens the dashboard in the default browser.
"""

import uvicorn
import webbrowser
import threading
import time
from app.config import settings


def open_browser():
    """Open the dashboard in the default browser after a short delay."""
    time.sleep(2)
    webbrowser.open(f"http://localhost:5173")


if __name__ == "__main__":
    threading.Thread(target=open_browser, daemon=True).start()
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=False,
        log_level="info",
    )
