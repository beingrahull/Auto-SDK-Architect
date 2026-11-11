import logging
from uuid import uuid4

from fastapi import APIRouter, BackgroundTasks, HTTPException, Response, status

from app.database import get_compiled_graph
from app.graph.state import initial_state
from app.schemas.api import (
    GenerateRequest,
    GenerateResponse,
    JobStatusResponse,
)

log = logging.getLogger(__name__)
router = APIRouter()


@router.post(
    "/generate",
    response_model=GenerateResponse,
    status_code=status.HTTP_202_ACCEPTED,
)
async def generate(req: GenerateRequest, background_tasks: BackgroundTasks):
    job_id = str(uuid4())
    background_tasks.add_task(invoke_graph, job_id, str(req.url))
    return GenerateResponse(job_id=job_id)


@router.get("/jobs/{job_id}", response_model=JobStatusResponse)
async def get_job(job_id: str):
    snapshot = await get_compiled_graph().aget_state(
        {"configurable": {"thread_id": job_id}}
    )
    values = snapshot.values
    if not values:
        raise HTTPException(status_code=404, detail="job not found")
    return JobStatusResponse(
        job_id=job_id,
        status=values.get("status", "pending"),
        sdk_url=f"/jobs/{job_id}/sdk" if values.get("status") == "success" else None,
        scratchpad=values.get("scratchpad", []),
    )


@router.get("/jobs/{job_id}/sdk")
async def download_sdk(job_id: str):
    snapshot = await get_compiled_graph().aget_state(
        {"configurable": {"thread_id": job_id}}
    )
    values = snapshot.values
    if not values:
        raise HTTPException(status_code=404, detail="job not found")
    if values.get("status") != "success":
        raise HTTPException(status_code=409, detail="SDK not ready")
    return Response(
        content=values.get("sdk_code") or "",
        media_type="text/x-python",
        headers={"Content-Disposition": f'attachment; filename="{job_id}_sdk.py"'},
    )


async def invoke_graph(job_id: str, url: str):
    try:
        await get_compiled_graph().ainvoke(
            initial_state(url),
            config={"configurable": {"thread_id": job_id}},
        )
    except Exception:
        log.exception("job %s failed", job_id)