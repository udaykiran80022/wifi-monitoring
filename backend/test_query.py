import asyncio
from sqlalchemy import select, func, cast, Integer, case
from app.db.session import engine
from app.models.tables import InternetStatusLog

async def run():
    async with engine.connect() as conn:
        try:
            res = await conn.execute(select(func.sum(1 - cast(InternetStatusLog.is_connected, Integer))))
            print("Query 1 Result:", res.scalar())
        except Exception as e:
            print("Query 1 Error:", e)

asyncio.run(run())
