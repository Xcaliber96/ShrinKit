from fastapi import APIRouter, Request, BackgroundTasks, HTTPException, status, Path
from fastapi.responses import RedirectResponse

from app.services.url_service import handle_redirect, create_short_link
from app.schema.url_schema import ShortenRequest

router = APIRouter(tags=["URL"])

@router.get("/{short_code}")
async def redirect_to_original(
    request: Request,
    background_tasks: BackgroundTasks,
    short_code: str = Path(..., min_length=3, max_length=20)
):
    url = await handle_redirect(short_code, request, background_tasks)

    if not url:
        raise HTTPException(status_code=404)

    return RedirectResponse(url=url, status_code=status.HTTP_302_FOUND)


@router.post("/shorten", status_code=status.HTTP_201_CREATED)
async def shorten_url(request: Request, payload: ShortenRequest):
    return await create_short_link(payload)