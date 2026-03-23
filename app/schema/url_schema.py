from pydantic import BaseModel, HttpUrl
from typing import Optional
from datetime import datetime

class ShortenRequest(BaseModel):
    url: HttpUrl
    custom_code: Optional[str] = None


class ShortenResponse(BaseModel):
    short_url: str
    code: str
    created_at: datetime
    expires_at: datetime


class StatsResponse(BaseModel):
    total_clicks: int
    created_at: datetime
    top_referrers: list