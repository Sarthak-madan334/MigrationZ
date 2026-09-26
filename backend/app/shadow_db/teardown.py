from pathlib import Path
import subprocess

import psycopg

from app.config import Settings


def teardown(compose_file: Path, settings: Settings) -> None:
    if settings.database_url:
        # This schema is reserved for rehearsals in the dedicated shadow database.
        with psycopg.connect(settings.postgres_dsn, connect_timeout=45) as connection:
            connection.execute("DROP SCHEMA IF EXISTS mra_shadow CASCADE")
        return

    subprocess.run(["docker", "compose", "-f", str(compose_file), "down", "-v"], check=True)
