from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # OpenAI — required for report generation; optional in scoring-only mode
    openai_api_key: str = ""
    openai_model: str = "gpt-4.1-mini"

    # Supabase — supports both old and new key naming conventions
    supabase_url: str = ""
    supabase_service_role_key: str = ""   # preferred server-side key
    supabase_secret_key: str = ""          # alias accepted by newer Supabase projects
    supabase_anon_key: str = ""            # legacy name
    supabase_publishable_key: str = ""     # alias for anon key in newer projects

    app_env: str = "local"
    trustbridge_debug: bool = False
    default_country: str = "Finland"
    default_language: str = "en"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

    @property
    def supabase_server_key(self) -> str:
        """Server-side key used by the backend only. Never send to the frontend."""
        return self.supabase_service_role_key or self.supabase_secret_key


settings = Settings()
