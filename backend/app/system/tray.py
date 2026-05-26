import pystray
from PIL import Image, ImageDraw

def create_image(color):
    """Create a simple colored circle icon."""
    image = Image.new('RGBA', (64, 64), (0, 0, 0, 0))
    dc = ImageDraw.Draw(image)
    dc.ellipse(
        (8, 8, 56, 56),
        fill=color
    )
    return image

_icon = None

def setup_tray(on_open, on_quit):
    global _icon
    
    menu = pystray.Menu(
        pystray.MenuItem("Open Dashboard", on_open, default=True),
        pystray.MenuItem("Quit", on_quit)
    )
    
    _icon = pystray.Icon(
        "wifi_monitor",
        create_image("green"),
        "WiFi Monitor",
        menu=menu
    )

def run_tray():
    global _icon
    if _icon:
        _icon.run()

def update_tray_status(is_connected: bool):
    """Update tray icon color based on connection status."""
    global _icon
    if _icon:
        color = "green" if is_connected else "red"
        _icon.icon = create_image(color)
