from pydantic import BaseModel, Field
from typing import Literal


class AssessmentInput(BaseModel):
    child_age: int = Field(..., ge=5, le=17, description="Child's age in years")
    device_experience: Literal["none", "tablet_only", "shared_phone", "own_device"]
    social_media_exposure: Literal["none", "supervised", "unsupervised"]
    parent_concern_areas: list[str] = Field(
        default_factory=list,
        description="e.g. ['screen_time', 'cyberbullying', 'privacy', 'content']",
    )
    household_rules_exist: bool
    child_can_handle_peer_pressure: Literal["rarely", "sometimes", "usually"]
    country: str = "Finland"
    language: str = "en"


class RiskItem(BaseModel):
    name: str
    level: Literal["low", "medium", "high"]
    description: str


class AssessmentReport(BaseModel):
    session_id: str
    readiness_score: int = Field(..., ge=0, le=100)
    readiness_label: str
    risks: list[RiskItem]
    safety_strategy: str
    safety_tips: list[str]
    fuse_recommended: bool
    fuse_reason: str
    score_breakdown: dict
