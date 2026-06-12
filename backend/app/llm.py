"""
LLM layer — uses OpenAI to generate the personalized report narrative.
The score and risk profile are computed deterministically before calling the LLM.
"""

from pathlib import Path
from openai import AsyncOpenAI
from app.config import settings
from app.models import AssessmentInput, RiskItem

_client = AsyncOpenAI(api_key=settings.openai_api_key)
_prompts_dir = Path(__file__).parent / "prompts"


def _load_prompt(filename: str) -> str:
    return (_prompts_dir / filename).read_text()


async def generate_report(
    data: AssessmentInput,
    score: int,
    score_label: str,
    breakdown: dict,
    risks: list[RiskItem],
) -> dict:
    system_prompt = _load_prompt("report_system.txt")
    user_template = _load_prompt("report_user_template.txt")

    user_prompt = user_template.format(
        child_age=data.child_age,
        device_experience=data.device_experience,
        social_media_exposure=data.social_media_exposure,
        concern_areas=", ".join(data.parent_concern_areas) or "none specified",
        household_rules=data.household_rules_exist,
        peer_pressure=data.child_can_handle_peer_pressure,
        score=score,
        score_label=score_label,
        breakdown=breakdown,
        risks="\n".join(f"- {r.name} ({r.level}): {r.description}" for r in risks),
        country=data.country,
        language=data.language,
    )

    response = await _client.chat.completions.create(
        model=settings.openai_model,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        response_format={"type": "json_object"},
        temperature=0.4,
    )

    import json
    return json.loads(response.choices[0].message.content)
