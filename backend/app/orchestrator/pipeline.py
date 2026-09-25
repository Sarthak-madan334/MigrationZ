from pathlib import Path
from typing import Final

import psycopg

from app.config import settings
from app.generator.corrupt import OrderRow, generate_orders
from app.generator.schema_introspect import get_phase0_schema
from app.harness.manifest_parser import load_manifest, parse_manifest
from app.harness.query_runner import QueryMeasurement, explain_query, run_query
from app.shadow_db.provision import provision
from app.shadow_db.teardown import teardown


PHASE0_MIGRATION: Final[str] = "CREATE INDEX orders_status_idx ON orders (status)"
PHASE1_MIGRATION: Final[str] = "DROP INDEX orders_created_at_idx; CREATE INDEX orders_status_idx ON orders (status)"
PHASE0_QUERY: Final[str] = "SELECT COUNT(*) FROM orders WHERE status IS NULL"


def seed_orders(connection: psycopg.Connection, rows: list[OrderRow]) -> None:
    with connection.cursor() as cursor:
        cursor.executemany(
            "INSERT INTO orders (customer_email, status, total_cents, created_at, legacy_format) VALUES (%s, %s, %s, %s, %s)",
            [(row.customer_email, row.status, row.total_cents, row.created_at, row.legacy_format) for row in rows],
        )
    connection.commit()


def run_phase0(repo_root: Path, row_count: int = 50_000) -> tuple[QueryMeasurement, QueryMeasurement]:
    compose_file = repo_root / "infra" / "docker-compose.yml"
    connection = provision(settings, compose_file)
    try:
        with connection.cursor() as cursor:
            cursor.execute(get_phase0_schema())
        connection.commit()

        rows = list(generate_orders(row_count=row_count, null_pressure=0.15))
        seed_orders(connection, rows)
        before = run_query(connection, PHASE0_QUERY)

        with connection.cursor() as cursor:
            cursor.execute(PHASE0_MIGRATION)
        connection.commit()
        connection.execute("ANALYZE orders")
        after = run_query(connection, PHASE0_QUERY)
        return before, after
    finally:
        connection.close()
        teardown(compose_file)


def sample_manifest_path(repo_root: Path) -> Path:
    return repo_root / "backend" / "sample_manifests" / "sample_query_manifest.yaml"


def validate_sample_manifest(repo_root: Path) -> None:
    load_manifest(sample_manifest_path(repo_root))


def run_rehearsal(
    repo_root: Path,
    corruption_profile: dict[str, float | int],
    raw_manifest: str | None,
    publish: callable,
) -> list[dict[str, object]]:
    """Run one measured rehearsal while publishing state transitions to the API."""
    compose_file = repo_root / "infra" / "docker-compose.yml"
    connection: psycopg.Connection | None = None
    try:
        publish("provisioning", 10, "Provisioning isolated Postgres shadow database")
        connection = provision(settings, compose_file)
        with connection.cursor() as cursor:
            cursor.execute(get_phase0_schema())
        connection.commit()

        row_count = int(corruption_profile.get("row_count_per_table", 50_000))
        publish("seeding", 25, f"Generating and seeding {row_count:,} rows into orders")
        rows = list(generate_orders(
            row_count=row_count,
            null_pressure=float(corruption_profile.get("null_pressure", 0.15)),
            duplication_rate=float(corruption_profile.get("duplication_rate", 0.05)),
            legacy_format_rate=float(corruption_profile.get("legacy_format_rate", 0.02)),
        ))
        seed_orders(connection, rows)

        manifest = parse_manifest(raw_manifest) if raw_manifest else load_manifest(sample_manifest_path(repo_root))
        with connection.cursor() as cursor:
            cursor.execute("CREATE INDEX orders_created_at_idx ON orders (created_at)")
        connection.commit()
        publish("migrating", 45, "Applying phase0/add_status_index.sql")
        measurements_before = [(item, run_query(connection, item.sql), explain_query(connection, item.sql)) for item in manifest.queries]
        with connection.cursor() as cursor:
            cursor.execute(PHASE1_MIGRATION)
        connection.commit()
        connection.execute("ANALYZE orders")

        publish("querying", 65, f"Running query manifest ({len(manifest.queries)} queries)")
        measurements_after = [(item, run_query(connection, item.sql), explain_query(connection, item.sql)) for item in manifest.queries]
        publish("analyzing", 85, "Comparing latency and query plans")
        results: list[dict[str, object]] = []
        for (item, before, before_plan), (_, after, after_plan) in zip(measurements_before, measurements_after):
            factor = after.latency_ms / max(before.latency_ms, 0.01)
            results.append({
                "id": item.id,
                "sql": item.sql,
                "latency_before_ms": round(before.latency_ms, 2),
                "latency_after_ms": round(after.latency_ms, 2),
                "regression_factor": round(factor, 2),
                "verdict": "regressed" if factor >= 3 else "passed",
                "plan_before": before_plan,
                "plan_after": after_plan,
            })
        return results
    finally:
        if connection is not None:
            connection.close()
        teardown(compose_file)