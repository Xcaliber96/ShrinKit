import asyncio
import asyncpg

async def test():
    dsn = 'postgresql://postgres:REMOVED@localhost:5432/postgres'
    print(f"Attempting to connect with: {dsn}")
    try:
        conn = await asyncpg.connect(dsn)
        print("✅ Success: Connected to Local DB!")
        await conn.close()
    except Exception as e:
        print(f"❌ Connection Failed: {e}")

if __name__ == "__main__":
    asyncio.run(test())