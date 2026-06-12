from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    openai_api_key: str
    openai_model: str = "gpt-4.1-mini"
    supabase_url: str
    supabase_service_role_key: str
    supabase_anon_key: str
    app_env: str = "local"
    trustbridge_debug: bool = False
    default_country: str = "Finland"
    default_language: str = "en"

    class Config:
        env_file = ".env"


settings = Settings()
