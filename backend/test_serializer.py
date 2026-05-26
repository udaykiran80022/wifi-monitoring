from datetime import datetime, timezone
from typing import Annotated
from pydantic import BaseModel, PlainSerializer

UtcDatetime = Annotated[
    datetime, 
    PlainSerializer(lambda dt: (dt.isoformat() + 'Z') if dt.tzinfo is None else dt.isoformat(), return_type=str)
]

class MyModel(BaseModel):
    dt: UtcDatetime

m = MyModel(dt=datetime.utcnow())
print("Result:", m.model_dump_json())
