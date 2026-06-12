"""
Supabase REST client for TrustBridge.

Uses httpx directly against the Supabase PostgREST API — no Supabase SDK required.

Security rules:
- Only the backend uses supabase_server_key (service role / secret key).
- That key is never forwarded to the frontend or included in any response.
- If credentials are missing, all functions no-op and return None.
- If a Supabase request fails, a warning is printed but the assessment is never blocked.
"""

import httpx
from app.config import settings


def is_supabase_configured() -> bool:
    return bool(settings.supabase_url and settings.supabase_server_key)


def _headers() -> dict[str, str]:
    key = settings.supabase_server_key
    return {
        "apikey": key,
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
        "Prefer": "return=representation",
    }


def _url(table: str) -> str:
    return f"{settings.supabase_url}/rest/v1/{table}"


async def create_session(
    country: str | None = None,
    language: str = "en",
    channel: str = "web",
    debug: bool = False,
    external_user_id: str | None = None,
) -> str | None:
    """Insert a row in tb_sessions and return its UUID."""
    if not is_supabase_configured():
        return None
    payload = {
        "channel": channel,
        "country": country,
        "language": language,
        "debug": debug,
    }
    if external_user_id:
        payload["external_user_id"] = external_user_id
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.post(_url("tb_sessions"), headers=_headers(), json=payload)
            resp.raise_for_status()
            rows = resp.json()
            if isinstance(rows, list) and rows:
                return rows[0].get("id")
            return None
    except Exception as exc:
        print(f"[TrustBridge] Supabase create_session failed: {type(exc).__name__}: {exc}")
        return None


async def log_assessment(
    session_id: str,
    request_payload: dict,
    result_payload: dict,
) -> str | None:
    """Insert a row in tb_assessments and return its UUID."""
    if not is_supabase_configured():
        return None
    row = {
        "session_id": session_id,
        # inputs
        "child_age": request_payload.get("child_age"),
        "first_smartphone": request_payload.get("first_smartphone"),
        "main_use": request_payload.get("main_use"),
        "existing_apps": request_payload.get("existing_apps"),
        "main_concerns": request_payload.get("main_concerns"),
        "independence_level": request_payload.get("independence_level"),
        "parent_confidence_before": request_payload.get("parent_confidence_before"),
        # scoring outputs
        "readiness_score": result_payload.get("readiness_score"),
        "readiness_level": result_payload.get("readiness_level"),
        "readiness_display_label": result_payload.get("readiness_display_label"),
        "confidence_level": result_payload.get("confidence_level"),
        "recommended_parenting_approach": result_payload.get("recommended_parenting_approach"),
        "fuse_recommendation_level": result_payload.get("fuse_recommendation_level"),
        "risk_profile": result_payload.get("risk_profile"),
        "strategy_focus": result_payload.get("strategy_focus"),
        "score_drivers": result_payload.get("score_drivers"),
    }
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.post(_url("tb_assessments"), headers=_headers(), json=row)
            resp.raise_for_status()
            rows = resp.json()
            if isinstance(rows, list) and rows:
                return rows[0].get("id")
            return None
    except Exception as exc:
        print(f"[TrustBridge] Supabase log_assessment failed: {type(exc).__name__}: {exc}")
        return None


async def get_active_prompt(name: str) -> str | None:
    """Fetch an active prompt text from tb_prompt_versions by name."""
    if not is_supabase_configured():
        return None
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get(
                _url("tb_prompt_versions"),
                headers=_headers(),
                params={"name": f"eq.{name}", "is_active": "eq.true", "select": "prompt", "limit": "1"},
            )
            resp.raise_for_status()
            rows = resp.json()
            if isinstance(rows, list) and rows:
                return rows[0].get("prompt")
        return None
    except Exception as exc:
        print(f"[TrustBridge] Supabase get_active_prompt({name!r}) failed: {type(exc).__name__}")
        return None


async def log_agent_step(
    session_id: str | None,
    assessment_id: str | None,
    step_name: str,
    input_payload: dict | None = None,
    output_payload: dict | None = None,
    status: str = "success",
    error: str | None = None,
    model: str | None = None,
    latency_ms: int | None = None,
    prompt_tokens: int | None = None,
    completion_tokens: int | None = None,
    total_tokens: int | None = None,
) -> None:
    """Insert a row in tb_agent_steps. Failures are silently swallowed after a warning."""
    if not is_supabase_configured():
        return
    row: dict = {"step_name": step_name, "status": status}
    if session_id:
        row["session_id"] = session_id
    if assessment_id:
        row["assessment_id"] = assessment_id
    if input_payload is not None:
        row["input"] = input_payload
    if output_payload is not None:
        row["output"] = output_payload
    if error:
        row["error"] = error
    if model:
        row["model"] = model
    if latency_ms is not None:
        row["latency_ms"] = latency_ms
    if prompt_tokens is not None:
        row["prompt_tokens"] = prompt_tokens
    if completion_tokens is not None:
        row["completion_tokens"] = completion_tokens
    if total_tokens is not None:
        row["total_tokens"] = total_tokens
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.post(_url("tb_agent_steps"), headers=_headers(), json=row)
            resp.raise_for_status()
    except Exception as exc:
        print(f"[TrustBridge] Supabase log_agent_step({step_name!r}) failed: {type(exc).__name__}: {exc}")
