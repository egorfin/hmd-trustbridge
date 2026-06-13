/**
 * Deterministic client-side scoring — TypeScript port of backend/app/scoring.py.
 * No network calls, no external dependencies. Used for the Vercel demo build.
 */

import {
  AssessmentResponse,
  DigitalReadinessReport,
  FormData,
  RiskItem,
  ScoreDriver,
} from "./types";

// ── Types ─────────────────────────────────────────────────────────────────────

type ReadinessLevel = "not_ready" | "moderate" | "ready_with_boundaries";
type ExistingApps   = "none" | "messaging_only" | "social_media" | "unknown";

// ── Constants (mirrors scoring.py) ────────────────────────────────────────────

const BASE_SCORE = 70;

function ageDelta(age: number): [number, string] {
  if (age <= 8)  return [-30, `Age ${age} is very young for an unsupervised smartphone`];
  if (age <= 10) return [-18, `Age ${age} still benefits significantly from parental guidance`];
  if (age <= 12) return [-10, `Age ${age} is approaching readiness but needs structured support`];
  if (age <= 15) return [+5,  `Age ${age} shows growing maturity for digital independence`];
  return [+10, `Age ${age} typically has the maturity to handle a smartphone responsibly`];
}

const FIRST_PHONE_DELTA: Record<string, [number, string]> = {
  true:  [-5, "First-time smartphone owner needs extra onboarding support"],
  false: [+5,  "Prior smartphone experience reduces adjustment risk"],
};

const APPS_DELTA: Record<ExistingApps, [number, string]> = {
  none:           [+8,  "No existing app usage — clean slate with low digital exposure risk"],
  messaging_only: [0,   "Messaging-only apps indicate moderate digital exposure"],
  social_media:   [-10, "Active social media use increases exposure to online risks"],
  unknown:        [-3,  "Unknown app history makes risk assessment harder"],
};

const INDEPENDENCE_DELTA: Record<string, [number, string]> = {
  low:      [+3, "Low independence setting keeps tighter family oversight in place"],
  balanced: [+8, "Balanced independence is the healthiest approach for most children"],
  high:     [-8, "High independence level may reduce parental visibility into digital activity"],
};

const CONCERN_DELTA: Record<string, [number, string]> = {
  harmful_content: [-5, "Harmful content is a real risk on open internet devices"],
  strangers:       [-8, "Unknown contact risk is one of the highest-stakes concerns"],
  screen_time:     [-5, "Screen time challenges are common and manageable with good tools"],
  social_pressure: [-5, "Social pressure online can affect emotional wellbeing"],
  privacy:         [-4, "Privacy risks require proactive device settings and conversations"],
  cyberbullying:   [-6, "Cyberbullying risk warrants careful social media and messaging setup"],
};

const CONCERN_LABELS: Record<string, string> = {
  harmful_content: "Harmful content exposure",
  strangers:       "Contact from unknown people",
  screen_time:     "Excessive screen time",
  social_pressure: "Social pressure and comparison",
  privacy:         "Privacy and data sharing",
  cyberbullying:   "Cyberbullying and online harassment",
  not_sure:        "Overall digital safety",
};

const DISPLAY_LABEL: Record<ReadinessLevel, string> = {
  not_ready:             "Safer start recommended",
  moderate:              "Ready for guided independence",
  ready_with_boundaries: "Ready with clear boundaries",
};

const APPROACH: Record<ReadinessLevel, string> = {
  not_ready:             "Protected Start",
  moderate:              "Balanced Independence",
  ready_with_boundaries: "Guided Freedom",
};

const FUSE_LEVEL: Record<ReadinessLevel, string> = {
  not_ready:             "safer_start_recommended",
  moderate:              "recommended",
  ready_with_boundaries: "recommended_with_flexible_boundaries",
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function deriveIndependenceLevel(age: number): string {
  if (age <= 10) return "low";
  if (age <= 12) return "balanced";
  return "high";
}

function deriveExistingApps(f: FormData): ExistingApps {
  if (f.main_use.includes("social_media")) return "social_media";
  if (f.main_use.includes("friends"))      return "messaging_only";
  if (f.first_smartphone === true)         return "none";
  return "unknown";
}

function readinessLevel(score: number): ReadinessLevel {
  if (score >= 70) return "ready_with_boundaries";
  if (score >= 40) return "moderate";
  return "not_ready";
}

function confidenceLevel(f: FormData): "low" | "medium" | "high" {
  if (f.parent_confidence_before >= 4) return "high";
  if (f.parent_confidence_before >= 2) return "medium";
  return "low";
}

function smallId(): string {
  return `demo-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

// ── Risk profile ──────────────────────────────────────────────────────────────

function buildRiskProfile(f: FormData, existingApps: ExistingApps): RiskItem[] {
  const concerns = f.main_concerns.filter((c) => c in CONCERN_LABELS && c !== "not_sure");

  return concerns.map((concern): RiskItem => {
    const label = CONCERN_LABELS[concern];
    let severity: "low" | "medium" | "high";
    let reason: string;

    switch (concern) {
      case "harmful_content":
        severity = (f.child_age < 13 || existingApps === "social_media") ? "high" : "medium";
        reason = severity === "high"
          ? "Younger children and active social media users face higher exposure to age-inappropriate content."
          : "Content risks are present but manageable with filtering tools and family rules.";
        break;
      case "strangers":
        severity = (existingApps === "messaging_only" || existingApps === "social_media") ? "high" : "medium";
        reason = severity === "high"
          ? "Messaging and social media apps create direct channels for unknown contacts."
          : "Risk is present; safe contact lists and awareness conversations help significantly.";
        break;
      case "screen_time":
        severity = (f.main_use.includes("games") || f.main_use.includes("social_media")) ? "high" : "medium";
        reason = severity === "high"
          ? "Gaming and social media are the highest drivers of excessive screen time in this age group."
          : "Screen time is a common challenge; daily limits and device-free times are effective.";
        break;
      case "social_pressure":
        severity = f.child_age <= 13 ? "high" : "medium";
        reason = severity === "high"
          ? "Younger children are especially vulnerable to social comparison and peer validation loops."
          : "Social pressure is manageable with open family communication and limited social media access.";
        break;
      case "privacy":
        severity = existingApps === "social_media" ? "high" : "medium";
        reason = severity === "high"
          ? "Social media platforms collect significant data; privacy settings need active configuration."
          : "Privacy risks are present in most apps; reviewing permissions together is a good habit.";
        break;
      case "cyberbullying":
        severity = (existingApps === "messaging_only" || existingApps === "social_media") ? "high" : "medium";
        reason = severity === "high"
          ? "Direct messaging and social platforms are the primary vectors for cyberbullying incidents."
          : "Cyberbullying risk exists wherever peers interact online; open dialogue is key.";
        break;
      default:
        severity = "medium";
        reason = "This concern warrants a conversation and some basic protective measures.";
    }

    return { key: concern, label, severity, reason };
  });
}

// ── Strategy focus ────────────────────────────────────────────────────────────

function buildStrategyFocus(f: FormData, level: ReadinessLevel): string[] {
  const focus: string[] = [];
  const concerns = f.main_concerns.filter((c) => c !== "not_sure");

  if (level === "not_ready") {
    focus.push("Supervised device use with a parent nearby");
    focus.push("Contacts limited to family and close friends");
    focus.push("Revisit readiness in a few months as your child grows");
  } else {
    if (concerns.includes("harmful_content")) focus.push("Harmful content filtering and safe search enabled");
    if (concerns.includes("strangers"))       focus.push("Approved contacts list and messaging limits");
    if (concerns.includes("screen_time"))     focus.push("Daily screen time limits and device-free hours");
    if (concerns.includes("social_pressure") || concerns.includes("cyberbullying"))
      focus.push("Open family conversations about online relationships");
    if (concerns.includes("privacy"))         focus.push("App permission review and privacy settings setup");
    focus.push("Transparent family rules agreed together with your child");
    if (level === "ready_with_boundaries")    focus.push("Gradual feature unlocking as trust is established");
  }

  return focus.slice(0, 5);
}

// ── Report narrative (template-driven, no LLM) ────────────────────────────────

function buildReport(f: FormData, level: ReadinessLevel): DigitalReadinessReport {
  const age     = f.child_age;
  const isFirst = f.first_smartphone ?? true;
  const concern = f.main_concerns[0] ?? "not_sure";
  const concernLabel = (CONCERN_LABELS[concern] ?? "digital safety").toLowerCase();

  const headlines: Record<ReadinessLevel, string> = {
    not_ready:             "A careful, supported start is the right move.",
    moderate:              "Your child is ready for guided smartphone use.",
    ready_with_boundaries: "Clear boundaries will make this a confident step.",
  };

  const summaries: Record<ReadinessLevel, string> = {
    not_ready:
      `Based on what you've shared, a structured, supervised introduction makes most sense right now. Your child is ${age} — setting clear habits early will pay off significantly over time.`,
    moderate:
      `Your child has the maturity to start with a smartphone, and the right setup will make a real difference. The key concern to address first is ${concernLabel}.`,
    ready_with_boundaries:
      `Your child is ready for more independence. With clear, agreed family rules in place — especially around ${concernLabel} — this can be a positive and confident step.`,
  };

  const whyScore: Record<ReadinessLevel, string> = {
    not_ready:
      `Age, first-phone status, and the concern around ${concernLabel} together point to a need for more structure before full smartphone access.`,
    moderate:
      `At ${age}, with ${isFirst ? "this being their first phone" : "some prior smartphone experience"}, there's genuine readiness — alongside some areas that benefit from active support.`,
    ready_with_boundaries:
      `A combination of age, prior experience, and confidence in your family's digital habits all contributed to this result. The readiness score reflects real capability.`,
  };

  const riskExplanations: Record<string, string> = {
    harmful_content:
      "Open internet access on a smartphone can expose children to content that isn't age-appropriate. Content filtering and agreed browsing habits significantly reduce this risk.",
    strangers:
      "Messaging apps and social platforms can allow contact from unknown adults. Trusted-contact setups and open conversations about safe online interaction are the first line of defence.",
    screen_time:
      "Smartphones can displace sleep, homework, and physical activity if not actively managed. Daily limits and phone-free zones are among the most effective protective habits.",
    social_pressure:
      "Peer comparison and validation-seeking behaviour can intensify online. Awareness, open family conversation, and delayed social media access reduce pressure significantly.",
    privacy:
      "Many apps collect more data than parents realise. Reviewing app permissions together and setting privacy defaults early builds good long-term habits.",
    cyberbullying:
      "Group chats and social platforms are where most incidents occur. Clear reporting steps, trusted adult contacts, and open dialogue are the most effective protections.",
    not_sure:
      "Every child's online experience brings some risk. A structured start — with agreed rules, trusted contacts, and regular check-ins — covers the most common bases.",
  };

  const safetyStrategy: Record<ReadinessLevel, string[]> = {
    not_ready: [
      "Use the phone with a parent present for the first month",
      "Set up a trusted contacts list before any independent messaging",
      "Agree on phone-free bedtime and mealtimes from day one",
    ],
    moderate: [
      "Set screen-time daily limits before handing over the phone",
      "Agree on a short list of approved apps for the first 30 days",
      "Have one focused conversation about what to do if something feels wrong online",
    ],
    ready_with_boundaries: [
      "Set clear, agreed-upon rules for phone-free times and zones",
      "Review privacy settings together on setup day",
      "Agree that access can be reviewed and expanded as trust develops",
    ],
  };

  const conversations: Record<ReadinessLevel, string> = {
    not_ready:
      `"We're going to try this together. For now, the phone is for agreed uses and we'll check in each week. As you show me how you use it, we'll talk about what comes next."`,
    moderate:
      `"You're ready for this. Let's agree upfront on the rules. If anything online ever feels wrong or confusing, you can always come to me — no questions about how you got there first."`,
    ready_with_boundaries:
      `"This is a big step and I trust you with it. The rules we've agreed are about keeping things healthy, not about distrust. We'll review them together as things go well."`,
  };

  const fuseFit: Record<ReadinessLevel, string> = {
    not_ready:
      "HMD Fuse is designed exactly for this situation — a structured, safe first-phone experience with parent-managed access, trusted contacts, and HarmBlock+ to help reduce harmful content exposure. It removes the need to configure dozens of individual app settings.",
    moderate:
      "HMD Fusion X1 provides the tools to support guided independence — app management, screen-time controls, and location features — without being restrictive. It grows with your child as trust develops.",
    ready_with_boundaries:
      "A standard HMD smartphone with family controls configured gives your child the full experience they're ready for, with digital wellbeing tools available whenever you need them.",
  };

  const confidenceShift: Record<ReadinessLevel, string> = {
    not_ready:
      "After going through this, many parents feel clearer about what they want to put in place before handing over the phone. A structured start is easier to manage than walking back unlimited access later.",
    moderate:
      "The key insight most parents take from this is that 'getting it right' is less about the device and more about the first conversations and agreed rules. Those matter more than any setting.",
    ready_with_boundaries:
      "Your instinct about your child being ready is backed by the answers you gave. The confidence you feel is well-founded — and having a clear plan makes the handover much smoother.",
  };

  return {
    headline:                         headlines[level],
    summary:                          summaries[level],
    why_this_score:                   whyScore[level],
    risk_explanation:                 riskExplanations[concern] ?? riskExplanations.not_sure,
    safety_strategy:                  safetyStrategy[level],
    suggested_parent_child_conversation: conversations[level],
    why_hmd_fuse_fits:                fuseFit[level],
    confidence_shift_message:         confidenceShift[level],
  };
}

// ── Public API ────────────────────────────────────────────────────────────────

export function computeAssessment(f: FormData): AssessmentResponse {
  const drivers: ScoreDriver[] = [];
  let score = BASE_SCORE;

  const existingApps     = deriveExistingApps(f);
  const independenceLevel = f.independence_level || deriveIndependenceLevel(f.child_age);

  // Age
  const [aD, aE] = ageDelta(f.child_age);
  score += aD;
  drivers.push({ factor: "Age", impact: aD, explanation: aE });

  // First smartphone
  const [fD, fE] = FIRST_PHONE_DELTA[String(f.first_smartphone)] ?? [-5, "First-time smartphone owner"];
  score += fD;
  drivers.push({ factor: "First smartphone", impact: fD, explanation: fE });

  // Existing apps (derived from main_use)
  const [apD, apE] = APPS_DELTA[existingApps];
  score += apD;
  drivers.push({ factor: "Existing apps", impact: apD, explanation: apE });

  // Concerns
  for (const concern of f.main_concerns) {
    if (concern in CONCERN_DELTA) {
      const [cD, cE] = CONCERN_DELTA[concern];
      score += cD;
      drivers.push({ factor: `Concern: ${concern}`, impact: cD, explanation: cE });
    }
  }

  // Independence level
  const [iD, iE] = INDEPENDENCE_DELTA[independenceLevel] ?? [0, ""];
  score += iD;
  if (iE) drivers.push({ factor: "Independence level", impact: iD, explanation: iE });

  // Combination penalties
  if (f.child_age < 11 && existingApps === "social_media") {
    score -= 10;
    drivers.push({ factor: "Combo: young age + social media", impact: -10,
      explanation: "Children under 11 with active social media accounts face compounded risk." });
  }
  if (f.child_age < 11 && independenceLevel === "high") {
    score -= 10;
    drivers.push({ factor: "Combo: young age + high independence", impact: -10,
      explanation: "High independence with no prior digital experience is high risk for under-11s." });
  }
  if (existingApps === "social_media" && f.main_concerns.includes("strangers")) {
    score -= 5;
    drivers.push({ factor: "Combo: social media + strangers concern", impact: -5,
      explanation: "Social media platforms significantly increase exposure to unknown contacts." });
  }
  if (existingApps === "social_media" && f.main_concerns.includes("cyberbullying")) {
    score -= 5;
    drivers.push({ factor: "Combo: social media + cyberbullying concern", impact: -5,
      explanation: "Social media is the primary vector for cyberbullying in this age group." });
  }

  score = Math.max(0, Math.min(100, score));
  const level = readinessLevel(score);

  return {
    session_id:                    smallId(),
    assessment_id:                 null,
    readiness_score:               score,
    readiness_level:               level,
    readiness_display_label:       DISPLAY_LABEL[level],
    confidence_level:              confidenceLevel(f),
    risk_profile:                  buildRiskProfile(f, existingApps),
    recommended_parenting_approach: APPROACH[level],
    strategy_focus:                buildStrategyFocus(f, level),
    fuse_recommendation_level:     FUSE_LEVEL[level],
    score_drivers:                 drivers,
    report:                        buildReport(f, level),
  };
}
