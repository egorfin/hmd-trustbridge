"""
Deterministic readiness scoring for TrustBridge.

Score is computed purely from assessment inputs — never from LLM output.
The LLM uses the score and risk profile to generate the personalized report narrative.

Design goal: concerns drive the risk *profile* strongly; they influence the
readiness *score* moderately so that typical first-phone scenarios land in
"moderate" rather than near zero, reducing parental anxiety.
"""

from app.models import (
    AssessmentInput,
    AssessmentResponse,
    RiskItem,
    ScoreDriver,
    ConfidenceLevel,
    ReadinessLevel,
)

_BASE_SCORE = 70


# ── Age deltas ───────────────────────────────────────────────────────────────
def _age_delta(age: int) -> tuple[int, str]:
    if age <= 8:
        return -30, f"Age {age} is very young for an unsupervised smartphone"
    if age <= 10:
        return -18, f"Age {age} still benefits significantly from parental guidance"
    if age <= 12:
        return -10, f"Age {age} is approaching readiness but needs structured support"
    if age <= 15:
        return +5, f"Age {age} shows growing maturity for digital independence"
    return +10, f"Age {age} typically has the maturity to handle a smartphone responsibly"


# ── Lookup tables ────────────────────────────────────────────────────────────
_FIRST_SMARTPHONE: dict[bool, tuple[int, str]] = {
    True: (-5, "First-time smartphone owner needs extra onboarding support"),
    False: (+5, "Prior smartphone experience reduces adjustment risk"),
}

_EXISTING_APPS: dict[str, tuple[int, str]] = {
    "none": (+8, "No existing app usage — clean slate with low digital exposure risk"),
    "messaging_only": (0, "Messaging-only apps indicate moderate digital exposure"),
    "social_media": (-10, "Active social media use increases exposure to online risks"),
    "unknown": (-3, "Unknown app history makes risk assessment harder"),
}

_INDEPENDENCE: dict[str, tuple[int, str]] = {
    "low": (+3, "Low independence setting keeps tighter family oversight in place"),
    "balanced": (+8, "Balanced independence is the healthiest approach for most children"),
    "high": (-8, "High independence level may reduce parental visibility into digital activity"),
}

_CONCERN_DELTA: dict[str, tuple[int, str]] = {
    "harmful_content": (-5, "Harmful content is a real risk on open internet devices"),
    "strangers": (-8, "Unknown contact risk is one of the highest-stakes concerns"),
    "screen_time": (-5, "Screen time challenges are common and manageable with good tools"),
    "social_pressure": (-5, "Social pressure online can affect emotional wellbeing"),
    "privacy": (-4, "Privacy risks require proactive device settings and conversations"),
    "cyberbullying": (-6, "Cyberbullying risk warrants careful social media and messaging setup"),
}


# ── Combination penalties ────────────────────────────────────────────────────
def _combo_penalties(data: AssessmentInput) -> list[ScoreDriver]:
    drivers: list[ScoreDriver] = []

    if data.child_age < 11 and data.existing_apps == "social_media":
        drivers.append(ScoreDriver(
            factor="Combo: young age + social media",
            impact=-10,
            explanation="Children under 11 with active social media accounts face compounded risk.",
        ))

    if data.child_age < 11 and data.independence_level == "high":
        drivers.append(ScoreDriver(
            factor="Combo: young age + high independence",
            impact=-10,
            explanation="High independence with no prior digital experience is high risk for under-11s.",
        ))

    if data.existing_apps == "social_media" and "strangers" in data.main_concerns:
        drivers.append(ScoreDriver(
            factor="Combo: social media + strangers concern",
            impact=-5,
            explanation="Social media platforms significantly increase exposure to unknown contacts.",
        ))

    if data.existing_apps == "social_media" and "cyberbullying" in data.main_concerns:
        drivers.append(ScoreDriver(
            factor="Combo: social media + cyberbullying concern",
            impact=-5,
            explanation="Social media is the primary vector for cyberbullying in this age group.",
        ))

    return drivers


# ── Risk profile ─────────────────────────────────────────────────────────────
_CONCERN_LABELS = {
    "harmful_content": "Harmful content exposure",
    "strangers": "Contact from unknown people",
    "screen_time": "Excessive screen time",
    "social_pressure": "Social pressure and comparison",
    "privacy": "Privacy and data sharing",
    "cyberbullying": "Cyberbullying and online harassment",
}


def _build_risk_profile(data: AssessmentInput) -> list[RiskItem]:
    items: list[RiskItem] = []

    for concern in data.main_concerns:
        label = _CONCERN_LABELS[concern]

        if concern == "harmful_content":
            severity = (
                "high"
                if data.child_age < 13 or data.existing_apps == "social_media"
                else "medium"
            )
            reason = (
                "Younger children and active social media users face higher exposure to age-inappropriate content."
                if severity == "high"
                else "Content risks are present but manageable with filtering tools and family rules."
            )

        elif concern == "strangers":
            severity = (
                "high"
                if data.existing_apps in ("messaging_only", "social_media")
                else "medium"
            )
            reason = (
                "Messaging and social media apps create direct channels for unknown contacts."
                if severity == "high"
                else "Risk is present; safe contact lists and awareness conversations help significantly."
            )

        elif concern == "screen_time":
            severity = (
                "high"
                if any(u in data.main_use for u in ("games", "social_media"))
                else "medium"
            )
            reason = (
                "Gaming and social media are the highest drivers of excessive screen time in this age group."
                if severity == "high"
                else "Screen time is a common challenge; daily limits and device-free times are effective."
            )

        elif concern == "social_pressure":
            severity = "high" if data.child_age <= 13 else "medium"
            reason = (
                "Younger children are especially vulnerable to social comparison and peer validation loops."
                if severity == "high"
                else "Social pressure is manageable with open family communication and limited social media access."
            )

        elif concern == "privacy":
            severity = "high" if data.existing_apps == "social_media" else "medium"
            reason = (
                "Social media platforms collect significant data; privacy settings need active configuration."
                if severity == "high"
                else "Privacy risks are present in most apps; reviewing permissions together is a good habit."
            )

        elif concern == "cyberbullying":
            severity = (
                "high"
                if data.existing_apps in ("messaging_only", "social_media")
                else "medium"
            )
            reason = (
                "Direct messaging and social platforms are the primary vectors for cyberbullying incidents."
                if severity == "high"
                else "Cyberbullying risk exists wherever peers interact online; open dialogue is key."
            )

        else:
            severity = "medium"
            reason = "This concern warrants a conversation and some basic protective measures."

        items.append(RiskItem(key=concern, label=label, severity=severity, reason=reason))

    return items


# ── Strategy ─────────────────────────────────────────────────────────────────
_APPROACH = {
    "not_ready": "Protected Start",
    "moderate": "Balanced Independence",
    "ready_with_boundaries": "Guided Freedom",
}

# Soft, product-first language — no scary "strongly_recommended" phrasing
_FUSE_LEVEL = {
    "not_ready": "safer_start_recommended",
    "moderate": "recommended",
    "ready_with_boundaries": "recommended_with_flexible_boundaries",
}

_DISPLAY_LABEL = {
    "not_ready": "Safer start recommended",
    "moderate": "Ready for guided independence",
    "ready_with_boundaries": "Ready with clear boundaries",
}


def _build_strategy_focus(data: AssessmentInput, level: str) -> list[str]:
    focus: list[str] = []

    if level == "not_ready":
        focus.append("Supervised device use with a parent nearby")
        focus.append("Contacts limited to family and close friends")
        focus.append("Revisit readiness in a few months as your child grows")
    else:
        if "harmful_content" in data.main_concerns:
            focus.append("Harmful content filtering and safe search enabled")
        if "strangers" in data.main_concerns:
            focus.append("Approved contacts list and messaging limits")
        if "screen_time" in data.main_concerns:
            focus.append("Daily screen time limits and device-free hours")
        if "social_pressure" in data.main_concerns or "cyberbullying" in data.main_concerns:
            focus.append("Open family conversations about online relationships")
        if "privacy" in data.main_concerns:
            focus.append("App permission review and privacy settings setup")

        focus.append("Transparent family rules agreed together with the child")

        if level == "ready_with_boundaries":
            focus.append("Gradual feature unlocking as trust is established")

    return focus[:5]


def _confidence_level(data: AssessmentInput) -> ConfidenceLevel:
    if data.parent_confidence_before >= 4:
        return "high"
    if data.parent_confidence_before >= 2:
        return "medium"
    return "low"


def _readiness_level(score: int) -> ReadinessLevel:
    if score >= 70:
        return "ready_with_boundaries"
    if score >= 40:
        return "moderate"
    return "not_ready"


# ── Public API ────────────────────────────────────────────────────────────────
def compute_assessment(data: AssessmentInput, session_id: str) -> AssessmentResponse:
    drivers: list[ScoreDriver] = []
    score = _BASE_SCORE

    # Age
    delta, explanation = _age_delta(data.child_age)
    score += delta
    drivers.append(ScoreDriver(factor="Age", impact=delta, explanation=explanation))

    # First smartphone
    delta, explanation = _FIRST_SMARTPHONE[data.first_smartphone]
    score += delta
    drivers.append(ScoreDriver(factor="First smartphone", impact=delta, explanation=explanation))

    # Existing apps
    delta, explanation = _EXISTING_APPS[data.existing_apps]
    score += delta
    drivers.append(ScoreDriver(factor="Existing apps", impact=delta, explanation=explanation))

    # Concerns
    for concern in data.main_concerns:
        delta, explanation = _CONCERN_DELTA[concern]
        score += delta
        drivers.append(ScoreDriver(factor=f"Concern: {concern}", impact=delta, explanation=explanation))

    # Independence level
    delta, explanation = _INDEPENDENCE[data.independence_level]
    score += delta
    drivers.append(ScoreDriver(factor="Independence level", impact=delta, explanation=explanation))

    # Combination penalties
    combo_drivers = _combo_penalties(data)
    for cd in combo_drivers:
        score += cd.impact
    drivers.extend(combo_drivers)

    score = max(0, min(100, score))
    level = _readiness_level(score)

    debug_payload: dict = {}
    if data.debug:
        raw = _BASE_SCORE + sum(d.impact for d in drivers)
        debug_payload = {
            "base_score": _BASE_SCORE,
            "raw_score_before_clamp": raw,
            "score_after_clamp": score,
            "drivers": [d.model_dump() for d in drivers],
        }

    return AssessmentResponse(
        session_id=session_id,
        readiness_score=score,
        readiness_level=level,
        readiness_display_label=_DISPLAY_LABEL[level],
        confidence_level=_confidence_level(data),
        risk_profile=_build_risk_profile(data),
        recommended_parenting_approach=_APPROACH[level],
        strategy_focus=_build_strategy_focus(data, level),
        fuse_recommendation_level=_FUSE_LEVEL[level],
        score_drivers=drivers,
        debug=debug_payload,
    )
