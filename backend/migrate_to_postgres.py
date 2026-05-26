"""
One-off script to migrate data from existing SQLite database to PostgreSQL.
Reads all rows from the old SQLite monitor.db and inserts them into the new Postgres DB.

Usage:
    python migrate_to_postgres.py
"""

import os
import sqlite3
import psycopg2
from pathlib import Path


# --- Configuration ---
SQLITE_DB_PATH = Path(os.environ.get("APPDATA", ".")) / "WiFiMonitor" / "monitor.db"
POSTGRES_DSN = "postgresql://postgres:admin123@localhost:5432/postgres"


def migrate():
    if not SQLITE_DB_PATH.exists():
        print(f"[SKIP] SQLite database not found at: {SQLITE_DB_PATH}")
        print("  Nothing to migrate. The app will start fresh with PostgreSQL.")
        return

    print(f"[INFO] Reading from SQLite: {SQLITE_DB_PATH}")
    sqlite_conn = sqlite3.connect(str(SQLITE_DB_PATH))
    sqlite_conn.row_factory = sqlite3.Row

    print(f"[INFO] Connecting to PostgreSQL: {POSTGRES_DSN}")
    pg_conn = psycopg2.connect(POSTGRES_DSN)
    pg_cur = pg_conn.cursor()

    # --- Migrate internet_status_logs ---
    print("[INFO] Migrating internet_status_logs...")
    rows = sqlite_conn.execute("SELECT * FROM internet_status_logs ORDER BY id").fetchall()
    count = 0
    for row in rows:
        try:
            pg_cur.execute(
                """INSERT INTO internet_status_logs
                (id, timestamp, is_connected, ping_ms, packet_loss, wifi_ssid,
                 wifi_signal, local_ip, public_ip, jitter_ms, ipv6_address, adapter_name)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (id) DO NOTHING""",
                (
                    row["id"], row["timestamp"], bool(row["is_connected"]),
                    row["ping_ms"], row["packet_loss"], row["wifi_ssid"],
                    row["wifi_signal"], row["local_ip"], row["public_ip"],
                    row["jitter_ms"] if "jitter_ms" in row.keys() else None,
                    row["ipv6_address"] if "ipv6_address" in row.keys() else None,
                    row["adapter_name"] if "adapter_name" in row.keys() else None,
                )
            )
            count += 1
        except Exception as e:
            print(f"  [WARN] Skipping status row {row['id']}: {e}")
    pg_conn.commit()
    print(f"  -> Migrated {count} status logs")

    # Reset sequence
    pg_cur.execute(
        "SELECT setval('internet_status_logs_id_seq', COALESCE((SELECT MAX(id) FROM internet_status_logs), 1))"
    )
    pg_conn.commit()

    # --- Migrate speed_test_logs ---
    print("[INFO] Migrating speed_test_logs...")
    rows = sqlite_conn.execute("SELECT * FROM speed_test_logs ORDER BY id").fetchall()
    count = 0
    for row in rows:
        try:
            pg_cur.execute(
                """INSERT INTO speed_test_logs
                (id, timestamp, download_mbps, upload_mbps, ping_ms,
                 server_name, server_location, result_url)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (id) DO NOTHING""",
                (
                    row["id"], row["timestamp"], row["download_mbps"],
                    row["upload_mbps"], row["ping_ms"], row["server_name"],
                    row["server_location"], row["result_url"],
                )
            )
            count += 1
        except Exception as e:
            print(f"  [WARN] Skipping speed row {row['id']}: {e}")
    pg_conn.commit()
    print(f"  -> Migrated {count} speed test logs")

    # Reset sequence
    pg_cur.execute(
        "SELECT setval('speed_test_logs_id_seq', COALESCE((SELECT MAX(id) FROM speed_test_logs), 1))"
    )
    pg_conn.commit()

    # --- Migrate alerts ---
    print("[INFO] Migrating alerts...")
    rows = sqlite_conn.execute("SELECT * FROM alerts ORDER BY id").fetchall()
    count = 0
    for row in rows:
        try:
            pg_cur.execute(
                """INSERT INTO alerts
                (id, timestamp, alert_type, message, severity, is_read)
                VALUES (%s, %s, %s, %s, %s, %s)
                ON CONFLICT (id) DO NOTHING""",
                (
                    row["id"], row["timestamp"], row["alert_type"],
                    row["message"], row["severity"], bool(row["is_read"]),
                )
            )
            count += 1
        except Exception as e:
            print(f"  [WARN] Skipping alert row {row['id']}: {e}")
    pg_conn.commit()
    print(f"  -> Migrated {count} alerts")

    # Reset sequence
    pg_cur.execute(
        "SELECT setval('alerts_id_seq', COALESCE((SELECT MAX(id) FROM alerts), 1))"
    )
    pg_conn.commit()

    # --- Migrate settings ---
    print("[INFO] Migrating settings...")
    rows = sqlite_conn.execute("SELECT * FROM settings ORDER BY id").fetchall()
    count = 0
    for row in rows:
        try:
            pg_cur.execute(
                """INSERT INTO settings
                (id, low_download_mbps, low_upload_mbps, high_ping_ms,
                 high_packet_loss_pct, ping_interval_sec, speed_test_interval_sec,
                 smtp_server, smtp_user, smtp_pass, webhook_url, speed_provider, updated_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (id) DO UPDATE SET
                    low_download_mbps = EXCLUDED.low_download_mbps,
                    low_upload_mbps = EXCLUDED.low_upload_mbps,
                    high_ping_ms = EXCLUDED.high_ping_ms,
                    high_packet_loss_pct = EXCLUDED.high_packet_loss_pct,
                    ping_interval_sec = EXCLUDED.ping_interval_sec,
                    speed_test_interval_sec = EXCLUDED.speed_test_interval_sec""",
                (
                    row["id"], row["low_download_mbps"], row["low_upload_mbps"],
                    row["high_ping_ms"], row["high_packet_loss_pct"],
                    row["ping_interval_sec"], row["speed_test_interval_sec"],
                    row["smtp_server"] if "smtp_server" in row.keys() else None,
                    row["smtp_user"] if "smtp_user" in row.keys() else None,
                    row["smtp_pass"] if "smtp_pass" in row.keys() else None,
                    row["webhook_url"] if "webhook_url" in row.keys() else None,
                    row["speed_provider"] if "speed_provider" in row.keys() else "ookla",
                    row["updated_at"] if "updated_at" in row.keys() else None,
                )
            )
            count += 1
        except Exception as e:
            print(f"  [WARN] Skipping settings row {row['id']}: {e}")
    pg_conn.commit()
    print(f"  -> Migrated {count} settings rows")

    # Cleanup
    sqlite_conn.close()
    pg_cur.close()
    pg_conn.close()

    print("\n[DONE] Migration complete! All data has been transferred to PostgreSQL.")


if __name__ == "__main__":
    migrate()
