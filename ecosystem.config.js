module.exports = {
  apps: [
    {
      name: "wifi-monitor-backend",

      script: "venv/Scripts/python.exe",
      args: "-m uvicorn app.main:app --host 127.0.0.1 --port 8765",

      cwd: "D:/Projects/wifi-monitoring/backend",

      interpreter: "none",

      autorestart: true,

      watch: false,
      max_memory_restart: "1G",

      env: {
        PYTHONUNBUFFERED: "1",
      }
    },

    {
      name: "wifi-monitor-frontend",

      script: "node",
      args: "node_modules/vite/bin/vite.js",

      cwd: "D:/Projects/wifi-monitoring/frontend",

      autorestart: true,
      watch: false,
      max_memory_restart: "1G",

      env: {
        NODE_ENV: "development",
      }
    }
  ]
};