import time
import uuid

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.models import AssessmentInput, AssessmentResponse
from app.scoring import compute_assessment
from app.llm import generate_digital_readiness_report
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
    # ── 1. Create Supabase session ────────────────────────────────────────────
    supabase_session_id = await create_session(
        country=body.country,
        language=body.language,
        debug=body.debug,
        external_user_id=body.session_id,
    )
    session_id = supabase_session_id or body.session_id or str(uuid.uuid4())

    # ── 2. Log incoming request ───────────────────────────────────────────────
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
    scoring_latency_ms = int((time.monotonic() - t0) * 1000)

    # ── 4. Persist assessment row ─────────────────────────────────────────────
    assessment_id: str | None = None
    if supabase_session_id:
        assessment_id = await log_assessment(
            session_id=supabase_session_id,
            request_payload=body.model_dump(exclude={"session_id", "debug"}),
            result_payload=result.model_dump(exclude={"debug", "assessment_id", "report"}),
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
            latency_ms=scoring_latency_ms,
        )

    # ── 6. Generate AI/fallback report ────────────────────────────────────────
    report, llm_meta = await generate_digital_readiness_report(body, result)

    # ── 7. Log LLM step ───────────────────────────────────────────────────────
    if supabase_session_id:
        await log_agent_step(
            session_id=supabase_session_id,
            assessment_id=assessment_id,
            step_name="llm_report_generation",
            input_payload={
                "prompt_source": llm_meta.get("prompt_source"),
                "model": llm_meta.get("model"),
                "readiness_score": result.readiness_score,
                "readiness_level": result.readiness_level,
                "country": body.country,
                "language": body.language,
            },
            output_payload=report.model_dump(),
            status="fallback" if llm_meta.get("fallback_used") else "success",
            error=llm_meta.get("error"),
            model=llm_meta.get("model"),
            latency_ms=llm_meta.get("latency_ms"),
            prompt_tokens=llm_meta.get("prompt_tokens"),
            completion_tokens=llm_meta.get("completion_tokens"),
            total_tokens=llm_meta.get("total_tokens"),
        )

    # ── 8. Compose final response ─────────────────────────────────────────────
    result.assessment_id = assessment_id
    result.report = report

    if body.debug:
        if not is_supabase_configured():
            result.debug["supabase"] = "not configured — logging skipped"
        result.debug["llm"] = {
            "fallback_used": llm_meta.get("fallback_used"),
            "model": llm_meta.get("model"),
            "prompt_source": llm_meta.get("prompt_source"),
            "latency_ms": llm_meta.get("latency_ms"),
            "tokens": {
                "prompt": llm_meta.get("prompt_tokens"),
                "completion": llm_meta.get("completion_tokens"),
                "total": llm_meta.get("total_tokens"),
            },
        }
        if llm_meta.get("error"):
            result.debug["llm"]["error"] = llm_meta["error"]

    return result
