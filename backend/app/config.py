from dataclasses import dataclass
import os


@dataclass(frozen=True)
class Settings:
    postgres_host: str = os.getenv("POSTGRES_HOST", "localhost")
    postgres_port: int = int(os.getenv("POSTGRES_PORT", "5433"))
    postgres_db: str = os.getenv("POSTGRES_DB", "migration_rehearsal")
    postgres_user: str = os.getenv("POSTGRES_USER", "rehearsal")
    postgres_password: str = os.getenv("POSTGRES_PASSWORD", "rehearsal")

    @property
    def postgres_dsn(self) -> str:
        return (
            f"host={self.postgres_host} port={self.postgres_port} "
            f"dbname={self.postgres_db} user={self.postgres_user} "
            f"password={self.postgres_password}"
        )


settings = Settings()