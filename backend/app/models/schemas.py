from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel


class HealthResponse(BaseModel):
    status: Literal["ok"]
    phase: Literal["0", "1"]


class QueryManifestItem(BaseModel):
    id: str
    sql: str


class QueryManifest(BaseModel):
    queries: list[QueryManifestItem]


class CorruptionProfile(BaseModel):
    null_pressure: float = 0.15
    duplication_rate: float = 0.05
    legacy_format_rate: float = 0.02
    row_count_per_table: int = 50_000


class RunRequest(BaseModel):
    repo_id: str = "phase-0-demo"
    migration_path: str = "phase0/add_status_index.sql"
    query_manifest: str | None = None
    corruption_profile: CorruptionProfile = CorruptionProfile()


class RunResponse(BaseModel):
    run_id: UUID
    status: Literal["queued"]


class LogEntry(BaseModel):
    ts: datetime
    level: Literal["info", "warn", "error"]
    message: str


class RunStatusResponse(BaseModel):
    run_id: UUID
    stage: Literal["queued", "provisioning", "seeding", "migrating", "querying", "analyzing", "done", "failed"]
    log: list[LogEntry]
    progress_pct: int


class QueryResult(BaseModel):
    id: str
    sql: str
    latency_before_ms: float
    latency_after_ms: float
    regression_factor: float
    verdict: Literal["regressed", "passed"]
    plan_before: str
    plan_after: str


class RunResultResponse(BaseModel):
    run_id: UUID
    verdict: Literal["regressed", "clean"]
    queries: list[QueryResult]