from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # OpenAI — required for report generation (Task 3); optional for scoring-only mode
    openai_api_key: str = ""
    openai_model: str = "gpt-4.1-mini"

    # Supabase — required for session logging (Task 4); optional in scoring-only mode
    supabase_url: str = ""
    supabase_service_role_key: str = ""
    supabase_anon_key: str = ""

    app_env: str = "local"
    trustbridge_debug: bool = False
    default_country: str = "Finland"
    default_language: str = "en"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
