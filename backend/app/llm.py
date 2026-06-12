"""
LLM layer for TrustBridge.

IMPORTANT INVARIANTS:
- The LLM never calculates or modifies readiness_score, readiness_level,
  risk_profile severity, or fuse_recommendation_level.
- Those are set deterministically by scoring.py before this module is called.
- This module only generates the human-readable explanation / report narrative.
- If OpenAI is unavailable or fails, a deterministic fallback report is returned.
- The assessment endpoint always returns 200 regardless of LLM outcome.
"""

from __future__ import annotations

import json
import time
from pathlib import Path

from pydantic import ValidationError

from app.config import settings
from app.models import AssessmentInput, AssessmentResponse, DigitalReadinessReport

_prompts_dir = Path(__file__).parent / "prompts"

# ── Hardcoded safety-net prompts (used only if both Supabase and local files fail) ──
_FALLBACK_SYSTEM_PROMPT = """You are TrustBridge, an AI-powered Digital Safety Advisor for parents.
Help parents make informed decisions about a child's first smartphone.
The readiness score and risk profile are already calculated — do not change them.
Use warm, calm, practical language. Return only valid JSON."""

_FALLBACK_USER_TEMPLATE = """Generate a Digital Readiness Report for the following assessment.
Return JSON: {"headline":"...","summary":"...","why_this_score":"...","risk_explanation":"...","safety_strategy":["..."],"suggested_parent_child_conversation":"...","why_hmd_fuse_fits":"...","confidence_shift_message":"..."}
Assessment: {{assessment_json}}"""


# ── Prompt loading ────────────────────────────────────────────────────────────
async def _fetch_from_supabase(primary: str, fallback: str) -> str | None:
    """Try to load an active prompt from Supabase by name, with a fallback name."""
    from app.supabase_client import get_active_prompt
    prompt = await get_active_prompt(primary)
    if prompt is None:
        prompt = await get_active_prompt(fallback)
    return prompt


async def _load_system_prompt() -> tuple[str, str]:
    """Return (prompt_text, source_label)."""
    prompt = await _fetch_from_supabase("report_system", "report_system_v0.1")
    if prompt:
        return prompt, "supabase"
    try:
        return (_prompts_dir / "report_system.txt").read_text(), "local_file"
    except OSError:
        return _FALLBACK_SYSTEM_PROMPT, "hardcoded"


async def _load_user_template() -> tuple[str, str]:
    """Return (template_text, source_label)."""
    prompt = await _fetch_from_supabase("report_user_template", "report_user_template_v0.1")
    if prompt:
        return prompt, "supabase"
    try:
        return (_prompts_dir / "report_user_template.txt").read_text(), "local_file"
    except OSError:
        return _FALLBACK_USER_TEMPLATE, "hardcoded"


# ── Assessment context builder ────────────────────────────────────────────────
def _build_assessment_context(
    assessment_input: AssessmentInput,
    scoring_result: AssessmentResponse,
) -> dict:
    return {
        "input": {
            "child_age": assessment_input.child_age,
            "first_smartphone": assessment_input.first_smartphone,
            "main_use": list(assessment_input.main_use),
            "existing_apps": assessment_input.existing_apps,
            "main_concerns": list(assessment_input.main_concerns),
            "independence_level": assessment_input.independence_level,
            "parent_confidence_before": assessment_input.parent_confidence_before,
            "country": assessment_input.country,
            "language": assessment_input.language,
        },
        "deterministic_result": {
            "readiness_score": scoring_result.readiness_score,
            "readiness_level": scoring_result.readiness_level,
            "readiness_display_label": scoring_result.readiness_display_label,
            "confidence_level": scoring_result.confidence_level,
            "risk_profile": [r.model_dump() for r in scoring_result.risk_profile],
            "recommended_parenting_approach": scoring_result.recommended_parenting_approach,
            "strategy_focus": scoring_result.strategy_focus,
            "fuse_recommendation_level": scoring_result.fuse_recommendation_level,
            "score_drivers": [d.model_dump() for d in scoring_result.score_drivers],
        },
        "product_context": {
            "product_name": "HMD Fuse",
            "positioning": "safer first smartphone experience",
            "themes": [
                "harmful content protection",
                "device-level protection",
                "protection across apps",
                "privacy-first safety",
                "gradual independence",
            ],
            "important_note": (
                "Do not overclaim exact technical capabilities beyond these themes."
            ),
        },
    }


# ── Deterministic fallback report ─────────────────────────────────────────────
def _fallback_report(scoring_result: AssessmentResponse) -> DigitalReadinessReport:
    level = scoring_result.readiness_level

    if level == "not_ready":
        return DigitalReadinessReport(
            headline="A safer start is recommended",
            summary=(
                "Based on your answers, your child may benefit from a more protected "
                "first-phone setup before moving toward full smartphone independence."
            ),
            why_this_score=(
                "The score reflects your child's age, first-smartphone status, and the concerns "
                "you raised — all pointing toward a gradual, supported introduction."
            ),
            risk_explanation=(
                "The main risk areas you identified will be important to address early. "
                "With the right setup and clear family rules, these are very manageable."
            ),
            safety_strategy=[
                "Supervised device use with a parent nearby",
                "Contacts limited to trusted family and friends",
                "Clear family rules agreed together with your child",
            ],
            suggested_parent_child_conversation=(
                "Talk with your child about what a phone is for, what your family rules will be, "
                "and how you'll support each other through challenges online."
            ),
            why_hmd_fuse_fits=(
                "HMD Fuse may support a safer-start strategy through harmful content protection, "
                "privacy-first safety, and gradual independence — making the transition gentler "
                "for both of you."
            ),
            confidence_shift_message=(
                "This result is a starting point, not a verdict. Many families find that a "
                "thoughtful, structured approach early on builds lasting digital trust."
            ),
        )

    if level == "moderate":
        return DigitalReadinessReport(
            headline="Ready for guided independence",
            summary=(
                "Your child shows a good foundation for a first smartphone. With clear boundaries "
                "and open communication, this can be a positive experience for the whole family."
            ),
            why_this_score=(
                "The score reflects growing readiness balanced with some areas where parental "
                "guidance will make a real difference."
            ),
            risk_explanation=(
                "The concerns you identified are common and manageable with the right tools "
                "and honest family conversations."
            ),
            safety_strategy=[
                "Set up screen time limits together with your child",
                "Review app permissions as a family activity",
                "Agree on contact rules and regular check-ins",
            ],
            suggested_parent_child_conversation=(
                "Discuss together what responsible phone use looks like, what the rules are, "
                "and how to handle tricky situations online."
            ),
            why_hmd_fuse_fits=(
                "HMD Fuse supports guided independence with harmful content protection and "
                "privacy-first design — a natural fit for this stage of digital growing up."
            ),
            confidence_shift_message=(
                "You are well-placed to make this work. The key is starting with clear, agreed "
                "rules and adjusting as trust grows."
            ),
        )

    # ready_with_boundaries
    return DigitalReadinessReport(
        headline="Ready with clear boundaries",
        summary=(
            "Your child shows strong readiness for a first smartphone. The focus now is on "
            "setting clear expectations together and building on the trust you already have."
        ),
        why_this_score=(
            "The score reflects maturity, experience, and a thoughtful approach to independence "
            "— a strong foundation for a positive first-phone experience."
        ),
        risk_explanation=(
            "The remaining considerations are normal for this age and easily addressed through "
            "honest conversation and simple device settings."
        ),
        safety_strategy=[
            "Agree on family rules as a team — with your child's input",
            "Review privacy settings together as a one-time setup",
            "Keep communication open about online experiences",
        ],
        suggested_parent_child_conversation=(
            "Talk about online safety, how to handle difficult situations, and how privacy "
            "and trust work in your family."
        ),
        why_hmd_fuse_fits=(
            "HMD Fuse supports this stage with flexible boundaries that grow with your child "
            "— a good fit for a confident, trust-based first-phone experience."
        ),
        confidence_shift_message=(
            "You have done the groundwork. This is a great moment to introduce a phone with "
            "clear, agreed rules and room to grow."
        ),
    )


# ── Public API ────────────────────────────────────────────────────────────────
async def generate_digital_readiness_report(
    assessment_input: AssessmentInput,
    scoring_result: AssessmentResponse,
) -> tuple[DigitalReadinessReport, dict]:
    """
    Generate a parent-facing Digital Readiness Report using OpenAI.

    Returns (report, metadata). Never raises — falls back to a deterministic
    report if OpenAI is unavailable or fails.
    """
    model = settings.openai_model or "gpt-4.1-mini"
    meta: dict = {
        "provider": "openai",
        "model": model,
        "fallback_used": False,
        "prompt_source": "unknown",
    }

    if not settings.openai_api_key:
        meta.update({"fallback_used": True, "error": "OpenAI API key not configured"})
        return _fallback_report(scoring_result), meta

    system_prompt, sys_src = await _load_system_prompt()
    user_template, usr_src = await _load_user_template()
    meta["prompt_source"] = f"{sys_src}/{usr_src}"

    context = _build_assessment_context(assessment_input, scoring_result)
    user_prompt = user_template.replace(
        "{{assessment_json}}",
        json.dumps(context, ensure_ascii=False, indent=2),
    )

    t0 = time.monotonic()
    try:
        from openai import AsyncOpenAI

        client = AsyncOpenAI(api_key=settings.openai_api_key)
        response = await client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            response_format={"type": "json_object"},
            temperature=0.4,
        )
        latency_ms = int((time.monotonic() - t0) * 1000)

        usage = response.usage
        meta.update({
            "latency_ms": latency_ms,
            "prompt_tokens": usage.prompt_tokens if usage else None,
            "completion_tokens": usage.completion_tokens if usage else None,
            "total_tokens": usage.total_tokens if usage else None,
        })

        raw = json.loads(response.choices[0].message.content)
        report = DigitalReadinessReport(**raw)
        return report, meta

    except json.JSONDecodeError as exc:
        meta.update({
            "fallback_used": True,
            "error": f"JSON parse error: {type(exc).__name__}",
            "latency_ms": int((time.monotonic() - t0) * 1000),
        })
    except ValidationError as exc:
        meta.update({
            "fallback_used": True,
            "error": f"Report schema mismatch: {type(exc).__name__}",
            "latency_ms": int((time.monotonic() - t0) * 1000),
        })
    except Exception as exc:
        # Truncate to avoid accidentally surfacing keys or tokens in logs
        safe_msg = str(exc)[:300]
        meta.update({
            "fallback_used": True,
            "error": f"{type(exc).__name__}: {safe_msg}",
            "latency_ms": int((time.monotonic() - t0) * 1000),
        })

    return _fallback_report(scoring_result), meta
