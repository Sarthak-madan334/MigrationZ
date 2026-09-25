from uuid import UUID, uuid4

from fastapi import APIRouter, HTTPException

from app.models.schemas import RunRequest, RunResponse, RunResultResponse, RunStatusResponse
from app.orchestrator.run_manager import manager

router = APIRouter(prefix="/rehearsal", tags=["rehearsal"])


@router.post("/run", response_model=RunResponse, status_code=202)
async def start_rehearsal(request: RunRequest) -> RunResponse:
    run_id = manager.create(request)
    return RunResponse(run_id=run_id, status="queued")


@router.get("/{run_id}/status")
async def rehearsal_status(run_id: UUID) -> RunStatusResponse:
    record = manager.get(run_id)
    if record is None:
        raise HTTPException(status_code=404, detail="run_not_found")
    return record.status


@router.get("/{run_id}/result", response_model=RunResultResponse)
async def rehearsal_result(run_id: UUID) -> RunResultResponse:
    record = manager.get(run_id)
    if record is None:
        raise HTTPException(status_code=404, detail="run_not_found")
    if record.result is None:
        raise HTTPException(status_code=409, detail="result_not_ready")
    return record.result