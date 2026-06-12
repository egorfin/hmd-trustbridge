import time
import uuid

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.models import AssessmentInput, AssessmentResponse
from app.scoring import compute_assessment
from app.supabase_client import (
    is_supabase_configured,
    create_session,
    log_assessment,
    log_agent_step,
)

app = FastAPI(
    title="TrustBridge API",
    version="0.1.0",
    description="Digital Readiness Assessment backend for HMD TrustBridge.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/api/assessment", response_model=AssessmentResponse)
async def create_assessment(body: AssessmentInput) -> AssessmentResponse:
    # ── 1. Create Supabase session (fire-and-forget safe) ─────────────────────
    supabase_session_id = await create_session(
        country=body.country,
        language=body.language,
        debug=body.debug,
        external_user_id=body.session_id,  # caller-supplied ID stored as external ref
    )
    # Fall back to a local UUID if Supabase is unavailable
    session_id = supabase_session_id or body.session_id or str(uuid.uuid4())

    # ── 2. Log incoming request step ─────────────────────────────────────────
    if supabase_session_id:
        await log_agent_step(
            session_id=supabase_session_id,
            assessment_id=None,
            step_name="incoming_assessment_request",
            input_payload=body.model_dump(exclude={"session_id", "debug"}),
        )

    # ── 3. Deterministic scoring ──────────────────────────────────────────────
    t0 = time.monotonic()
    result = compute_assessment(body, session_id=session_id)
    latency_ms = int((time.monotonic() - t0) * 1000)

    # ── 4. Persist assessment row ─────────────────────────────────────────────
    assessment_id: str | None = None
    if supabase_session_id:
        assessment_id = await log_assessment(
            session_id=supabase_session_id,
            request_payload=body.model_dump(exclude={"session_id", "debug"}),
            result_payload=result.model_dump(exclude={"debug", "assessment_id"}),
        )

    # ── 5. Log scoring step ───────────────────────────────────────────────────
    if supabase_session_id:
        await log_agent_step(
            session_id=supabase_session_id,
            assessment_id=assessment_id,
            step_name="deterministic_scoring",
            input_payload={
                "child_age": body.child_age,
                "existing_apps": body.existing_apps,
                "independence_level": body.independence_level,
                "main_concerns": list(body.main_concerns),
            },
            output_payload={
                "readiness_score": result.readiness_score,
                "readiness_level": result.readiness_level,
                "readiness_display_label": result.readiness_display_label,
                "fuse_recommendation_level": result.fuse_recommendation_level,
            },
            latency_ms=latency_ms,
        )

    # ── 6. Attach assessment_id and debug notes to response ───────────────────
    result.assessment_id = assessment_id

    if body.debug and not is_supabase_configured():
        result.debug["supabase"] = "not configured — logging skipped"

    return result
