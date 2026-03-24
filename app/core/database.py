import os
import asyncpg
import logging 

from app.core.config import get_settings
logger = logging.getLogger(__name__)
settings = get_settings()

pool = None

async def connect_db():
    print("USING DB:", settings.DATABASE_URL)
    global pool
    try:
        pool = await asyncpg.create_pool(
            dsn=settings.DATABASE_URL,
            min_size=10,
            max_size=50,
            statement_cache_size=0  
        )
        logger.info("Database connection pool established.") 
    except Exception as e:
        logger.error(f"Failed to create database pool: {e}") 
        raise e
    
async def get_db():
   return pool

async def close_db():
    global pool
    if pool:
        await pool.close()
        logger.info("Database connection pool closed.") 