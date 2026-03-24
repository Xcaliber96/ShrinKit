from app.core.database import get_db

async def create_short_url(original_url: str, short_code: str, days_valid: int = 30):
    pool = await get_db() 
    query = """
        INSERT INTO urls (original_url, short_code, expires_at) 
        VALUES ($1, $2, NOW() + make_interval(days => $3))
        RETURNING created_at, expires_at
    """
    async with pool.acquire() as connection:
        return await connection.fetchrow(query, original_url, short_code, days_valid)
    

async def get_and_increment_url(short_code: str):
    pool = await get_db()

    async with pool.acquire() as connection:
        row = await connection.fetchrow("""
            UPDATE urls 
            SET clicks = clicks + 1 
            WHERE short_code = $1 
            AND (expires_at IS NULL OR expires_at > NOW())
            RETURNING id, original_url
        """, short_code)

        if not row:
            return None

    
        return row["id"], row["original_url"]


async def get_existing_url_data(original_url: str):
    pool = await get_db()
    query = """
        SELECT short_code, created_at, expires_at 
        FROM urls 
        WHERE original_url = $1 
        AND (expires_at IS NULL OR expires_at > NOW())
    """
    async with pool.acquire() as connection:
        return await connection.fetchrow(query, original_url)
    

async def check_short_code_exists(short_code: str):
    pool = await get_db()
    query = "SELECT 1 FROM urls WHERE short_code = $1"
    async with pool.acquire() as connection:
        return await connection.fetchval(query, short_code) is not None