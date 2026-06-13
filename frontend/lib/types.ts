export type RiskItem = {
  key: string;
  label: string;
  severity: "low" | "medium" | "high";
  reason: string;
};

export type ScoreDriver = {
  factor: string;
  impact: number;
  explanation: string;
};

export type DigitalReadinessReport = {
  headline: string;
  summary: string;
  why_this_score: string;
  risk_explanation: string;
  safety_strategy: string[];
  suggested_parent_child_conversation: string;
  why_hmd_fuse_fits: string;
  confidence_shift_message: string;
};

export type AssessmentResponse = {
  session_id: string;
  assessment_id: string | null;
  readiness_score: number;
  readiness_level: "not_ready" | "moderate" | "ready_with_boundaries";
  readiness_display_label: string;
  confidence_level: "low" | "medium" | "high";
  risk_profile: RiskItem[];
  recommended_parenting_approach: string;
  strategy_focus: string[];
  fuse_recommendation_level: string;
  score_drivers: ScoreDriver[];
  report: DigitalReadinessReport | null;
};

export type FormSummary = {
  childAge: number;
  ageLabel: string;
  isFirstSmartphone: boolean | null;
  mainConcernKey: string;
  mainConcernLabel: string;
  confidenceLabel: string;
  mainUseKeys: string[];
  mainUseLabels: string[];
};

export type FormData = {
  child_age: number;
  first_smartphone: boolean | null;
  main_use: string[];
  existing_apps: string;
  main_concerns: string[];
  independence_level: string;
  parent_confidence_before: number;
};
