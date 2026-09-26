from uuid import UUID, uuid4

import asyncio
from fastapi import APIRouter, HTTPException, Response

from app.models.schemas import BisectRequest, BisectResponse, RunRequest, RunResponse, RunResultResponse, RunStatusResponse
from app.orchestrator.pipeline import run_bisection
from app.orchestrator.run_manager import manager

router = APIRouter(prefix="/rehearsal", tags=["rehearsal"])


@router.post("/run", response_model=RunResponse, status_code=202)
async def start_rehearsal(request: RunRequest) -> RunResponse:
    run_id = manager.create(request)
    return RunResponse(run_id=run_id, status="queued")


@router.post("/{run_id}/bisect", response_model=BisectResponse)
async def bisect_rehearsal(run_id: UUID, request: BisectRequest) -> BisectResponse:
    record = manager.get(run_id)
    if record is None:
        raise HTTPException(status_code=404, detail="run_not_found")
    if record.result is None:
        raise HTTPException(status_code=409, detail="result_not_ready")

    query = next((item for item in record.result.queries if item.id == request.query_id), None)
    if query is None:
        raise HTTPException(status_code=404, detail="query_not_found")
    if query.verdict != "regressed":
        raise HTTPException(status_code=409, detail="query_not_regressed")

    cached = manager.get_bisection(run_id, request.query_id)
    if cached is not None:
        return cached[0]

    manager.publish(run_id, "bisecting", 86, f"Starting root-cause bisection for {query.id}")
    try:
        outcome = await asyncio.to_thread(
            run_bisection,
            manager.repo_root,
            record.request.corruption_profile.model_dump(),
            query.id,
            query.sql,
            query.plan_before,
            query.plan_after,
            lambda stage, progress, message: manager.publish(run_id, stage, progress, message),
        )
    except Exception as exc:
        manager.publish(run_id, "done", 100, f"Bisection failed: {exc}", level="error")
        raise HTTPException(status_code=500, detail="bisect_failed") from exc

    response = BisectResponse(
        query_id=query.id,
        minimal_condition=outcome.minimal_condition,
        minimal_row_count=outcome.minimal_row_count,
        bisection_trail=list(outcome.bisection_trail),
        repro_script_url=f"/api/rehearsal/{run_id}/cause/{query.id}/repro.sql",
    )
    manager.store_bisection(run_id, query.id, response, outcome.repro_script)
    manager.publish(run_id, "done", 100, f"Bisection complete for {query.id}")
    return response


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


@router.get("/{run_id}/cause/{query_id}/repro.sql")
async def repro_script(run_id: UUID, query_id: str) -> Response:
    if manager.get(run_id) is None:
        raise HTTPException(status_code=404, detail="run_not_found")
    artifact = manager.get_bisection(run_id, query_id)
    if artifact is None:
        raise HTTPException(status_code=404, detail="repro_not_found")
    return Response(
        content=artifact[1],
        media_type="application/sql",
        headers={"Content-Disposition": 'attachment; filename="repro.sql"'},
    )