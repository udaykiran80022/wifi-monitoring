"""
Timezone utilities for the application.
All timestamps are stored and displayed in IST (Indian Standard Time, UTC+5:30).
"""

from datetime import datetime, timezone, timedelta

IST = timezone(timedelta(hours=5, minutes=30))


def now_ist() -> datetime:
    """Return the current time in IST as a naive datetime (no tzinfo).
    
    We strip tzinfo so that SQLAlchemy stores it as a plain TIMESTAMP
    without timezone confusion. The convention is: all timestamps in the
    database and API responses are IST.
    """
    return datetime.now(IST).replace(tzinfo=None)
