from __future__ import annotations

from typing import Literal
from pydantic import BaseModel, Field
import uuid


MainUse = Literal["school", "family", "friends", "social_media", "games", "other"]
ExistingApps = Literal["none", "messaging_only", "social_media", "unknown"]
Concern = Literal[
    "harmful_content",
    "strangers",
    "screen_time",
    "social_pressure",
    "privacy",
    "cyberbullying",
]
IndependenceLevel = Literal["low", "balanced", "high"]
ReadinessLevel = Literal["not_ready", "moderate", "ready_with_boundaries"]
Severity = Literal["low", "medium", "high"]
ConfidenceLevel = Literal["low", "medium", "high"]


class AssessmentInput(BaseModel):
    session_id: str | None = Field(None, description="Optional caller-supplied session ID")
    child_age: int = Field(..., ge=6, le=17)
    first_smartphone: bool
    main_use: list[MainUse]
    existing_apps: ExistingApps
    main_concerns: list[Concern]
    independence_level: IndependenceLevel
    parent_confidence_before: int = Field(..., ge=1, le=5)
    country: str = "Finland"
    language: str = "en"
    debug: bool = False

    def resolved_session_id(self) -> str:
        return self.session_id or str(uuid.uuid4())


class ScoreDriver(BaseModel):
    factor: str
    impact: int
    explanation: str


class RiskItem(BaseModel):
    key: str
    label: str
    severity: Severity
    reason: str


class AssessmentResponse(BaseModel):
    session_id: str
    assessment_id: str | None = None
    readiness_score: int = Field(..., ge=0, le=100)
    readiness_level: ReadinessLevel
    readiness_display_label: str
    confidence_level: ConfidenceLevel
    risk_profile: list[RiskItem]
    recommended_parenting_approach: str
    strategy_focus: list[str]
    fuse_recommendation_level: str
    score_drivers: list[ScoreDriver]
    debug: dict
