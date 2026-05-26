"""
Register WiFi Monitor in Windows Task Scheduler to start on login.
Uses schtasks command to create a ONLOGON trigger task.
"""

import subprocess
import sys
from pathlib import Path


def register():
    """Register the WiFi Monitor to start automatically on Windows login."""
    # Use pythonw.exe for windowless execution
    python_dir = Path(sys.executable).parent
    pythonw = python_dir / "pythonw.exe"

    # Fall back to python.exe if pythonw doesn't exist
    if not pythonw.exists():
        pythonw = Path(sys.executable)

    script = Path(__file__).parent.parent / "run.py"

    if not script.exists():
        print(f"❌ Error: run.py not found at {script}")
        return

    cmd = [
        "schtasks", "/create",
        "/tn", "WiFiMonitor",
        "/tr", f'"{pythonw}" "{script}"',
        "/sc", "ONLOGON",
        "/rl", "HIGHEST",
        "/f",  # overwrite if exists
    ]

    result = subprocess.run(cmd, capture_output=True, text=True)

    if result.returncode == 0:
        print("✅ WiFi Monitor registered to start on login.")
        print(f"   Python: {pythonw}")
        print(f"   Script: {script}")
    else:
        print(f"❌ Failed to register: {result.stderr}")
        print("   Try running this script as Administrator.")


if __name__ == "__main__":
    register()
