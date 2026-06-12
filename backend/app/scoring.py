"""
Deterministic readiness scoring.
Score is computed from assessment inputs — not from LLM output.
The LLM uses the score to generate the personalized report.
"""

from app.models import AssessmentInput


_DEVICE_EXP_POINTS = {
    "none": 0,
    "tablet_only": 10,
    "shared_phone": 20,
    "own_device": 30,
}

_SOCIAL_MEDIA_POINTS = {
    "none": 20,
    "supervised": 10,
    "unsupervised": 0,
}

_PEER_PRESSURE_POINTS = {
    "rarely": 0,
    "sometimes": 10,
    "usually": 20,
}


def compute_score(data: AssessmentInput) -> tuple[int, dict]:
    breakdown: dict[str, int] = {}

    # Age readiness: 10+ = full points, younger = fewer
    age_score = min(max(data.child_age - 8, 0), 5) * 4  # 0–20
    breakdown["age"] = age_score

    # Device experience
    exp_score = _DEVICE_EXP_POINTS[data.device_experience]
    breakdown["device_experience"] = exp_score

    # Social media exposure (less exposure = safer = higher score here)
    sm_score = _SOCIAL_MEDIA_POINTS[data.social_media_exposure]
    breakdown["social_media"] = sm_score

    # Household rules
    rules_score = 15 if data.household_rules_exist else 0
    breakdown["household_rules"] = rules_score

    # Peer pressure resilience
    peer_score = _PEER_PRESSURE_POINTS[data.child_can_handle_peer_pressure]
    breakdown["peer_pressure"] = peer_score

    # Concern penalty: each concern area reduces trust slightly
    concern_penalty = min(len(data.parent_concern_areas) * 3, 15)
    breakdown["concern_penalty"] = -concern_penalty

    total = sum(breakdown.values())
    total = max(0, min(100, total))
    return total, breakdown


def score_to_label(score: int) -> str:
    if score >= 75:
        return "Strong Readiness"
    if score >= 55:
        return "Developing Readiness"
    if score >= 35:
        return "Emerging Readiness"
    return "Early Stage"
