"""
Download Ookla's official speedtest CLI for Windows.
Extracts speedtest.exe to the WiFiMonitor app data folder.
"""

import urllib.request
import zipfile
import io
import os
from pathlib import Path


SPEEDTEST_URL = "https://install.speedtest.net/app/cli/ookla-speedtest-1.2.0-win64.zip"
DEST_DIR = Path(os.environ.get("APPDATA", ".")) / "WiFiMonitor"
DEST_EXE = DEST_DIR / "speedtest.exe"


def download():
    """Download and extract the Ookla speedtest.exe CLI binary."""
    DEST_DIR.mkdir(parents=True, exist_ok=True)

    if DEST_EXE.exists():
        print(f"✅ speedtest.exe already exists at {DEST_EXE}")
        overwrite = input("   Overwrite? (y/N): ").strip().lower()
        if overwrite != "y":
            return

    print("Downloading Ookla speedtest CLI...")
    print(f"   URL: {SPEEDTEST_URL}")

    try:
        data = urllib.request.urlopen(SPEEDTEST_URL, timeout=30).read()
        print(f"   Downloaded {len(data) / 1024 / 1024:.1f} MB")

        with zipfile.ZipFile(io.BytesIO(data)) as z:
            # Find speedtest.exe in the archive
            exe_found = False
            for name in z.namelist():
                if name.endswith("speedtest.exe"):
                    # Extract to temp location then move
                    z.extract(name, DEST_DIR)
                    extracted = DEST_DIR / name

                    # Move to final destination if needed
                    if extracted != DEST_EXE:
                        if DEST_EXE.exists():
                            DEST_EXE.unlink()
                        extracted.rename(DEST_EXE)

                    exe_found = True
                    break

            if not exe_found:
                # Try extracting all and check for speedtest.exe
                z.extractall(DEST_DIR)
                # Search for the exe
                for root, dirs, files in os.walk(DEST_DIR):
                    for f in files:
                        if f == "speedtest.exe":
                            src = Path(root) / f
                            if src != DEST_EXE:
                                if DEST_EXE.exists():
                                    DEST_EXE.unlink()
                                src.rename(DEST_EXE)
                            exe_found = True
                            break
                    if exe_found:
                        break

        if DEST_EXE.exists():
            print(f"✅ speedtest.exe installed to {DEST_EXE}")
        else:
            print("speedtest.exe not found in the downloaded archive.")
            print("   Please download manually from https://www.speedtest.net/apps/cli")

    except urllib.error.URLError as e:
        print(f"Download failed: {e}")
        print("   Please download manually from https://www.speedtest.net/apps/cli")
        print(f"Successfully downloaded and extracted speedtest to {DEST_EXE}")
    except Exception as e:
        print(f"Error: {e}")


if __name__ == "__main__":
    download()
