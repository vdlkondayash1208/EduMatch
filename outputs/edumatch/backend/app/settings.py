from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_env: str = "development"
    frontend_origin: str = "http://localhost:5173,https://vdlkondayash1208.github.io"
    openrouter_api_key: str | None = None
    openrouter_model: str = "openai/gpt-4o-mini"
    openrouter_site_url: str = "http://localhost:5173"
    openrouter_app_name: str = "EduMatch"
    supabase_url: str | None = None
    supabase_service_role_key: str | None = None
    mysql_dsn: str | None = None

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    @property
    def frontend_origins(self) -> list[str]:
        """Parse comma-separated frontend_origin into a list."""
        return [o.strip() for o in self.frontend_origin.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
