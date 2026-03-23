from fastapi import APIRouter, HTTPException
from app.core.database import get_db
import logging

router = APIRouter(tags=["Health"])
logger = logging.getLogger(__name__)

@router.get("/health")
async def health_check():
    pool = await get_db()

    if not pool:
        raise HTTPException(
            status_code=503,
            detail="Database connection pool not initialized"
        )

    try:
        async with pool.acquire() as conn:
            await conn.execute("SELECT 1")

        return {
            "status": "healthy",
            "database": "connected"
        }

    except Exception as e:
        logger.error(f"Health check failed: {e}")
        raise HTTPException(
            status_code=500,
            detail="Database connection failed"
        )