import re
import asyncpg
import logging
from typing import Optional

from fastapi import Request, BackgroundTasks, HTTPException, status

from app.core.config import get_settings
from app.utils.generator import generate_short_string

from app.crud.url_crud import (
    get_and_increment_url,
    create_short_url,
    get_existing_url_data,
    check_short_code_exists,
)
from app.crud.analytics_crud import log_analytics

logger = logging.getLogger(__name__)
settings = get_settings()

RESERVED_PATHS = {
    "docs", "openapi", "health", "stats", "shorten",
    "recent", "admin", "api", "login", "static", "assets"
}



async def handle_redirect(
    short_code: str,
    request: Request,
    background_tasks: BackgroundTasks
) -> Optional[str]:

    ip = request.client.host
    user_agent = request.headers.get("user-agent", "unknown")
    referrer = request.headers.get("referer", "direct")

    result = await get_and_increment_url(short_code)

    if not result:
        return None

    url_id, original_url = result  

    background_tasks.add_task(
        log_analytics,
        url_id,   
        ip,
        user_agent,
        referrer
    )

    return original_url



async def create_short_link(payload):

    original_url = str(payload.url)

    
    if not payload.custom_code:
        existing = await get_existing_url_data(original_url)
        if existing:
            return {
                "short_url": f"{settings.BASE_URL}/{existing['short_code']}",
                "code": existing["short_code"],
                "created_at": existing["created_at"],
                "expires_at": existing["expires_at"]
            }

 
    if payload.custom_code:
        code = payload.custom_code.lower()

        if not re.match(r'^[a-zA-Z0-9]{3,20}$', payload.custom_code):
            raise HTTPException(
                status_code=400,
                detail="Custom code must be 3-20 alphanumeric characters"
            )

        if code in RESERVED_PATHS:
            raise HTTPException(
                status_code=400,
                detail="Custom code is reserved"
            )

        if await check_short_code_exists(code):
            raise HTTPException(
                status_code=400,
                detail="Custom code already in use"
            )

        try:
            db_row = await create_short_url(original_url, code)

            return {
                "short_url": f"{settings.BASE_URL}/{code}",
                "code": code,
                "created_at": db_row["created_at"],
                "expires_at": db_row["expires_at"]
            }

        except asyncpg.exceptions.UniqueViolationError:
            raise HTTPException(
                status_code=400,
                detail="Custom code already in use"
            )

 
    max_retries = 3

    for attempt in range(max_retries):
        code = generate_short_string().lower()

        if code in RESERVED_PATHS or await check_short_code_exists(code):
            continue

        try:
            db_row = await create_short_url(original_url, code)

            return {
                "short_url": f"{settings.BASE_URL}/{code}",
                "code": code,
                "created_at": db_row["created_at"],
                "expires_at": db_row["expires_at"]
            }

        except asyncpg.exceptions.UniqueViolationError:
            logger.warning(f"Collision on attempt {attempt + 1}: {code}")
            continue

    logger.error("Failed to generate unique short code after retries")

    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="Could not generate unique short URL"
    )