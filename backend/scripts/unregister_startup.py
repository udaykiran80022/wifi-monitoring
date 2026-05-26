"""
Unregister WiFi Monitor from Windows Task Scheduler.
Removes the scheduled task created by register_startup.py.
"""

import subprocess


def unregister():
    """Remove the WiFi Monitor task from Windows Task Scheduler."""
    cmd = [
        "schtasks", "/delete",
        "/tn", "WiFiMonitor",
        "/f",  # force delete without confirmation
    ]

    result = subprocess.run(cmd, capture_output=True, text=True)

    if result.returncode == 0:
        print("✅ WiFi Monitor removed from startup.")
    else:
        print(f"❌ Failed to unregister: {result.stderr}")
        print("   The task may not exist, or try running as Administrator.")


if __name__ == "__main__":
    unregister()
