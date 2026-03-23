from fastapi import FastAPI
from contextlib import asynccontextmanager

from app.core.database import connect_db, close_db
from app.core.config import get_settings

from app.api.routes import url, stats, health
from fastapi.middleware.cors import CORSMiddleware

settings = get_settings()

@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_db()
    yield
    await close_db()

app = FastAPI(title=settings.APP_NAME, lifespan=lifespan)

app.include_router(url.router)
app.include_router(stats.router)
app.include_router(health.router)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)