from pathlib import Path
import subprocess
import time

import psycopg

from app.config import Settings


def provision(settings: Settings, compose_file: Path) -> psycopg.Connection:
    if settings.database_url:
        # Render Postgres is a dedicated shadow database. Keep each run in a
        # disposable schema so app metadata in the database's public schema survives.
        connection = psycopg.connect(settings.postgres_dsn, connect_timeout=45)
        try:
            with connection.cursor() as cursor:
                cursor.execute("DROP SCHEMA IF EXISTS mra_shadow CASCADE")
                cursor.execute("CREATE SCHEMA mra_shadow")
                cursor.execute("SET search_path TO mra_shadow")
            connection.commit()
            return connection
        except Exception:
            connection.close()
            raise

    subprocess.run(["docker", "compose", "-f", str(compose_file), "up", "-d", "postgres"], check=True)
    deadline = time.monotonic() + 45
    while time.monotonic() < deadline:
        try:
            return psycopg.connect(settings.postgres_dsn)
        except psycopg.OperationalError:
            time.sleep(1)
    raise RuntimeError("Postgres did not become ready within 45 seconds")
