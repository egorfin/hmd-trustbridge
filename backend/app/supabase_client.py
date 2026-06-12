"""
Supabase client — used only for session logs, debug data, and anonymous records.
No long-term child profiles are stored.
"""

from supabase import create_client, Client
from app.config import settings

_client: Client | None = None


def get_client() -> Client:
    global _client
    if _client is None:
        _client = create_client(settings.supabase_url, settings.supabase_service_role_key)
    return _client


async def log_session(session_id: str, payload: dict) -> None:
    client = get_client()
    client.table("assessment_logs").insert({
        "session_id": session_id,
        "payload": payload,
    }).execute()
