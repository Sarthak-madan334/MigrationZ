# api_spec.md — Backend API Contract

Base URL (local): `http://localhost:8000/api`

All responses are JSON. All timestamps are ISO 8601 UTC.

## 1. Auth / Repo connection

### `POST /auth/github/callback`
Exchanges GitHub OAuth code for an access token (read-only repo scope).

**Body**
```json
{ "code": "string" }
```
**Response**
```json
{ "access_token": "string", "user": { "login": "string", "avatar_url": "string" } }
```

### `GET /repos`
Lists repos accessible to the authenticated user.

**Response**
```json
{ "repos": [ { "id": "string", "full_name": "org/repo", "default_branch": "main" } ] }
```

### `GET /repos/:id/migrations`
Detects candidate migration files under common paths (`migrations/`, `db/migrate/`, `alembic/versions/`) on the default branch.

**Response**
```json
{
  "migrations": [
    { "path": "migrations/0042_add_index.sql", "diff_preview": "string", "detected_dialect": "postgres" }
  ]
}
```

## 2. Rehearsal runs

### `POST /rehearsal/run`
Starts a new rehearsal run.

**Body**
```json
{
  "repo_id": "string",
  "migration_path": "migrations/0042_add_index.sql",
  "query_manifest": "string | null",      // raw YAML/SQL; null = use sample manifest
  "corruption_profile": {
    "null_pressure": 0.15,
    "duplication_rate": 0.05,
    "legacy_format_rate": 0.02,
    "row_count_per_table": 500000
  }
}
```
**Response**
```json
{ "run_id": "uuid", "status": "queued" }
```

### `GET /rehearsal/:run_id/status`
Poll or SSE endpoint for live progress (drives the pipeline UI in `ui_ux.md` §4.3).

**Response**
```json
{
  "run_id": "uuid",
  "stage": "provisioning | seeding | migrating | querying | analyzing | done | failed",
  "log": [
    { "ts": "2026-09-25T10:03:11Z", "level": "info", "message": "Seeded 500,000 rows into orders" },
    { "ts": "2026-09-25T10:03:42Z", "level": "warn", "message": "Query 4 latency: 38ms -> 1612ms" }
  ],
  "progress_pct": 62
}
```

`GET /rehearsal/:run_id/stream` provides the same data as Server-Sent Events for real-time push instead of polling.

### `GET /rehearsal/:run_id/result`
Full results once `stage == done`.

**Response**
```json
{
  "run_id": "uuid",
  "verdict": "regressed | clean",
  "queries": [
    {
      "id": "q4",
      "sql": "SELECT * FROM orders WHERE status IS NULL",
      "latency_before_ms": 41,
      "latency_after_ms": 1612,
      "regression_factor": 39.3,
      "verdict": "regressed",
      "plan_before": "string (EXPLAIN output)",
      "plan_after": "string (EXPLAIN output)"
    }
  ]
}
```

### `POST /rehearsal/:run_id/bisect`
Triggers (or re-triggers) root-cause bisection for a specific regressed query. Normally auto-triggered by the orchestrator, exposed here for manual re-run / debugging.

**Body**
```json
{ "query_id": "q4" }
```
**Response**
```json
{
  "query_id": "q4",
  "minimal_condition": "legacy_format = TRUE AND created_at < '2019-03-01'",
  "minimal_row_count": 183,
  "bisection_trail": [500000, 61204, 8010, 1140, 183],
  "repro_script_url": "/api/rehearsal/uuid/cause/q4/repro.sql"
}
```

### `GET /rehearsal/:run_id/cause/:query_id/repro.sql`
Downloads the minimal reproducible SQL script (schema + minimal seed data + the failing query).

### `GET /rehearsal/history`
Lists past runs for the History screen.

**Response**
```json
{
  "runs": [
    { "run_id": "uuid", "repo": "org/repo", "migration": "0042_add_index.sql", "verdict": "regressed", "created_at": "2026-09-25T10:00:00Z" }
  ]
}
```

## 3. Error format

All errors follow:
```json
{ "error": { "code": "string", "message": "human-readable string" } }
```

Common codes: `repo_not_found`, `migration_not_found`, `provisioning_failed`, `manifest_invalid`, `run_not_found`.

## 4. Query manifest format

A small YAML file the user supplies (or the sample manifest for demo purposes):

```yaml
queries:
  - id: q1
    sql: "SELECT COUNT(*) FROM orders"
  - id: q4
    sql: "SELECT * FROM orders WHERE status IS NULL"
```
