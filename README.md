# WiFi Monitor

**Real-time WiFi and Internet connectivity monitoring dashboard for Windows.**

WiFi Monitor runs silently in the background, continuously tracking your internet connection quality. It monitors download/upload speeds, ping latency, packet loss, WiFi signal strength, and detects outages — all visualized in a sleek dark-themed dashboard.

---

## Features

- 📡 **Real-time monitoring** — Connectivity, ping, and WiFi status checked every 5 seconds
- 🚀 **Speed tests** — Automated speed tests via Ookla CLI every 15 minutes
- 📊 **Live dashboard** — Dark-themed React dashboard with real-time charts via WebSocket
- ⏱ **Downtime tracking** — Automatic detection and logging of internet outages
- 🔔 **Smart alerts** — Configurable thresholds for speed, ping, and packet loss
- 📈 **Historical analytics** — Daily and hourly trends with interactive charts
- 🔧 **Auto-start** — Optional Windows Task Scheduler integration for startup on login
- 💾 **Local storage** — All data stored in SQLite (no cloud dependency)

---

## Prerequisites

- **Python 3.11+** — [Download Python](https://www.python.org/downloads/)
- **Node.js 20+** — [Download Node.js](https://nodejs.org/)
- **Windows 10/11** — This application uses Windows-specific commands (`netsh`, `ping.exe`)

---

## Installation

### 1. Clone / Download

```bash
cd D:\Projects
git clone <repo-url> wifi-monitoring
cd wifi-monitoring
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Download Speedtest CLI (Optional but recommended)

```bash
python scripts\download_speedtest.py
```

This downloads Ookla's official `speedtest.exe` to `%APPDATA%\WiFiMonitor\`. Without it, speed tests will be skipped.

You can also manually download from [speedtest.net/apps/cli](https://www.speedtest.net/apps/cli) and place `speedtest.exe` in `%APPDATA%\WiFiMonitor\`.

### 4. Frontend Setup

```bash
cd ..\frontend
npm install
```

---

## Running

### Start the Backend

```bash
cd backend
venv\Scripts\activate
python run.py
```

The backend starts on `http://127.0.0.1:8765` and opens the dashboard in your browser automatically.

### Start the Frontend (Development)

```bash
cd frontend
npm run dev
```

The dashboard is available at **http://localhost:5173**.

---

## Windows Startup Registration

### Register (start on login)

```bash
cd backend
python scripts\register_startup.py
```

This creates a Windows Task Scheduler task that runs the monitor on login.

> **Note:** Requires Administrator privileges.

### Unregister

```bash
cd backend
python scripts\unregister_startup.py
```

---

## Configuration

### Environment Variables

Edit `backend/.env` to customize:

| Variable | Default | Description |
|---|---|---|
| `HOST` | `127.0.0.1` | Backend server host |
| `PORT` | `8765` | Backend server port |
| `PING_INTERVAL` | `5` | Seconds between connectivity checks |
| `SPEED_TEST_INTERVAL` | `900` | Seconds between speed tests (15 min) |
| `LOW_DOWNLOAD_MBPS` | `10.0` | Alert threshold for low download speed |
| `LOW_UPLOAD_MBPS` | `2.0` | Alert threshold for low upload speed |
| `HIGH_PING_MS` | `150.0` | Alert threshold for high latency |
| `HIGH_PACKET_LOSS_PCT` | `5.0` | Alert threshold for packet loss % |

### Dashboard Settings

Thresholds can also be configured from the **Settings** page in the dashboard. Changes take effect immediately.

---

## Data Storage

All data is stored locally in:

```
%APPDATA%\WiFiMonitor\
├── monitor.db        # SQLite database with all monitoring data
├── speedtest.exe     # Ookla speed test binary (downloaded)
└── monitor.log       # Application logs
```

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/status/current` | Latest connectivity status |
| `GET` | `/api/status/history?hours=24` | Status history |
| `GET` | `/api/status/uptime?hours=24` | Uptime percentage |
| `GET` | `/api/speed/latest` | Latest speed test |
| `GET` | `/api/speed/history?days=7` | Speed test history |
| `GET` | `/api/speed/averages?days=7` | Daily speed averages |
| `GET` | `/api/alerts?limit=50` | Alert list |
| `POST` | `/api/alerts/{id}/read` | Mark alert as read |
| `POST` | `/api/alerts/read-all` | Mark all alerts read |
| `DELETE` | `/api/alerts/{id}` | Delete an alert |
| `GET` | `/api/downtime/logs?days=30` | Outage periods |
| `GET` | `/api/downtime/summary?days=30` | Downtime statistics |
| `GET` | `/api/analytics/daily?days=30` | Daily analytics |
| `GET` | `/api/analytics/hourly?hours=24` | Hourly analytics |
| `GET` | `/api/settings` | Current settings |
| `PUT` | `/api/settings` | Update settings |
| `WS` | `/ws` | WebSocket for live data |

---

## Troubleshooting

### speedtest.exe not found

Run `python scripts\download_speedtest.py` or manually download from [speedtest.net/apps/cli](https://www.speedtest.net/apps/cli) and place `speedtest.exe` in `%APPDATA%\WiFiMonitor\`.

### Ping not working

Ensure Windows Firewall allows ICMP (ping) requests. The app uses the built-in `ping.exe` command.

### WebSocket not connecting

- Verify the backend is running on port 8765
- Check that no firewall is blocking localhost connections
- The dashboard shows "Reconnecting..." in the sidebar when WebSocket is disconnected

### Task Scheduler registration fails

Run the registration script as Administrator:
```bash
runas /user:Administrator "python scripts\register_startup.py"
```

### Database issues

Delete `%APPDATA%\WiFiMonitor\monitor.db` to reset all data. A fresh database will be created on next startup.

---

## Tech Stack

**Backend:** Python 3.11+, FastAPI, SQLAlchemy (async), aiosqlite, APScheduler, WebSockets

**Frontend:** React 18, TypeScript, Vite 5, Tailwind CSS v3, Recharts, Zustand, Axios

---

## License

MIT
