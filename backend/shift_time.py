from sqlalchemy import create_engine, text

engine = create_engine('postgresql://postgres:admin123@localhost:5432/postgres')

with engine.begin() as conn:
    conn.execute(text("UPDATE internet_status_logs SET timestamp = timestamp + interval '5 hours 30 minutes'"))
    conn.execute(text("UPDATE speed_test_logs SET timestamp = timestamp + interval '5 hours 30 minutes'"))
    conn.execute(text("UPDATE alerts SET timestamp = timestamp + interval '5 hours 30 minutes'"))
    conn.execute(text("UPDATE settings SET updated_at = updated_at + interval '5 hours 30 minutes' WHERE updated_at IS NOT NULL"))

print('Historic data updated to IST')
