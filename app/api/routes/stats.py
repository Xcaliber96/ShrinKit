from fastapi import APIRouter, HTTPException, Path
from app.crud.analytics_crud import get_stats_data, get_click_timeline

router = APIRouter(prefix="/stats", tags=["Statistics"])

@router.get("/{short_code}")
async def get_link_stats(
    short_code: str = Path(..., min_length=3, max_length=20)
):
    data = await get_stats_data(short_code)

    if not data:
        raise HTTPException(status_code=404, detail="Stats not found")

    return data


@router.get("/{short_code}/timeline")
async def get_timeline_stats(
    short_code: str = Path(..., min_length=3, max_length=20)
):
    timeline = await get_click_timeline(short_code)

    return {"timeline": timeline or []}