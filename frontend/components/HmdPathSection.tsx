"use client";

import { AssessmentResponse, FormSummary } from "@/lib/types";

interface HmdPathSectionProps {
  result: AssessmentResponse;
  summary: FormSummary | null;
}

// ── Path definitions ──────────────────────────────────────────────────────────

type PathKey = "protected" | "guided" | "flexible";

type PathConfig = {
  approach: string;
  product: string;
  why: (isFirst: boolean | null) => string;
  capabilities: string[];
  ctaUrl: string;
  honestNote: string;
};

const PATH_CONFIG: Record<PathKey, PathConfig> = {
  protected: {
    approach: "Protected Start",
    product: "HMD Fuse + HarmBlock+",
    why: (isFirst) =>
      isFirst !== false
        ? "Your family is introducing smartphone use gradually and prioritising protection and supervision."
        : "Your family's approach focuses on rebuilding clearer digital boundaries with stronger protection in place.",
    capabilities: [
      "Starts without unrestricted app access",
      "Trusted contacts setup",
      "Parent-managed app controls",
      "HarmBlock+ helps reduce exposure to nude and sexual imagery",
      "Gradual independence model",
    ],
    ctaUrl: "https://www.hmd.com/fuse",
    honestNote:
      "Family conversations and agreed rules will always have a greater impact than device choice alone.",
  },
  guided: {
    approach: "Guided Independence",
    product: "HMD Fusion X1",
    why: (isFirst) =>
      isFirst !== false
        ? "Your family approach balances supervision with growing autonomy, supporting independence at a steady pace."
        : "Your family is building on existing habits with clearer structure, growing trust, and gradual independence.",
    capabilities: [
      "App management controls",
      "Trusted contacts",
      "Location features",
      "Screen-time support",
      "Gradual increase in independence",
    ],
    ctaUrl: "https://www.hmd.com",
    honestNote:
      "Agreed family rules will have the most impact — the right device helps make them easier to maintain.",
  },
  flexible: {
    approach: "Flexible Boundaries",
    product: "Fusion X1 or standard HMD smartphone with family controls",
    why: () =>
      "Your family has the foundations in place for confident, flexible digital use with agreed boundaries.",
    capabilities: [
      "Digital wellbeing tools",
      "Screen time management",
      "Family location features",
      "Parental controls available",
      "Standard app access",
    ],
    ctaUrl: "https://www.hmd.com",
    honestNote:
      "The suggested family approach is likely to have a greater impact than device choice alone.",
  },
};

// ── Concern copy ──────────────────────────────────────────────────────────────

const CONCERN_COPY: Record<string, { title: string; body: string }> = {
  harmful_content: {
    title: "Your main concern is harmful content.",
    body: "The recommended HMD path includes tools to help manage content exposure as your family builds digital confidence together.",
  },
  strangers: {
    title: "Your main concern is contact from unknown people.",
    body: "The recommended approach supports a graduated introduction — starting with trusted contacts before expanding access.",
  },
  cyberbullying: {
    title: "Your family is concerned about online interactions.",
    body: "TrustBridge recommends combining family conversations with safety-focused device features and gradual independence.",
  },
  screen_time: {
    title: "Your concern is healthy device use.",
    body: "Device choice alone will not resolve screen-time habits, but a structured setup alongside agreed family rules makes healthy habits easier to build.",
  },
  social_pressure: {
    title: "Your concern is social pressure online.",
    body: "The recommended path supports a more gradual introduction to social features, giving your family time to build digital confidence together.",
  },
  privacy: {
    title: "Your concern is protecting your child's privacy.",
    body: "The recommended HMD path is designed with privacy considerations for younger users, supporting a safer introduction to digital life.",
  },
  not_sure: {
    title: "You are still forming your priorities.",
    body: "A safety-focused approach gives your family time to build agreements and habits before expanding digital independence.",
  },
};

const FALLBACK_CONCERN_COPY = {
  title: "Your family is beginning a digital journey.",
  body: "The recommended HMD path is designed to support a structured, gradual approach rather than unrestricted access from day one.",
};

// ── Path derivation ───────────────────────────────────────────────────────────

function derivePathKey(result: AssessmentResponse, summary: FormSummary | null): PathKey {
  const level = result.readiness_level;
  const isFirst = summary?.isFirstSmartphone;
  const age = summary?.childAge ?? 0;

  if (level === "ready_with_boundaries") return "flexible";
  if (level === "moderate") return "guided";
  // not_ready
  if (isFirst === false) return "guided"; // existing phone → no "Protected Start" framing
  if (age >= 16) return "guided";         // older teens → guided, not restricted
  return "protected";
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function HmdPathSection({ result, summary }: HmdPathSectionProps) {
  const pathKey = derivePathKey(result, summary);
  const path = PATH_CONFIG[pathKey];
  const isFirst = summary?.isFirstSmartphone ?? null;

  const concernKey = summary?.mainConcernKey || result.risk_profile[0]?.key || "";
  const concernLabel = summary?.mainConcernLabel || result.risk_profile[0]?.label || "";
  const concernCopy = CONCERN_COPY[concernKey] ?? FALLBACK_CONCERN_COPY;

  const contextItems: string[] = [];
  if (summary?.ageLabel) contextItems.push(`Age: ${summary.ageLabel}`);
  if (summary?.isFirstSmartphone != null) {
    contextItems.push(
      summary.isFirstSmartphone ? "First smartphone" : "Previously had a smartphone"
    );
  }
  if (concernLabel) contextItems.push(`Main concern: ${concernLabel}`);
  contextItems.push(`Family approach: ${result.recommended_parenting_approach}`);

  return (
    <div className="space-y-3">

      {/* Main path card */}
      <div className="rounded-2xl border border-hmd-teal/30 bg-gradient-to-br from-teal-50 to-blue-50 p-5 space-y-4">

        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-hmd-teal/10 flex items-center justify-center mt-0.5">
            <svg viewBox="0 0 24 24" fill="none" stroke="#00A99D" strokeWidth="2" className="w-4 h-4">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-semibold text-hmd-teal uppercase tracking-widest">
              Your Recommended HMD Path
            </p>
            <p className="text-xs text-gray-500 leading-relaxed mt-1">
              Based on your family approach and answers, TrustBridge has identified a matching HMD product path.
            </p>
          </div>
        </div>

        {/* Context summary */}
        {contextItems.length > 0 && (
          <div className="bg-white/70 rounded-xl p-3 space-y-1.5">
            <p className="text-xs font-semibold text-gray-500 mb-2">Based on your answers:</p>
            {contextItems.map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-hmd-teal text-xs font-bold flex-shrink-0">✓</span>
                <span className="text-xs text-gray-700">{item}</span>
              </div>
            ))}
          </div>
        )}

        {/* Why this path fits */}
        <p className="text-sm text-gray-700 leading-relaxed">{path.why(isFirst)}</p>

        {/* Product recommendation */}
        <div className="bg-white/80 rounded-xl p-4 space-y-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Recommended HMD support</p>
          <p className="text-base font-bold text-gray-900">{path.product}</p>
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-gray-500">Key capabilities</p>
            {path.capabilities.map((cap, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-hmd-teal font-bold text-xs flex-shrink-0 mt-0.5">✓</span>
                <span className="text-xs text-gray-700 leading-relaxed">{cap}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Concern card */}
      <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 space-y-1.5">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
          Why this matters for your family
        </p>
        <p className="text-sm font-semibold text-gray-800 leading-snug">{concernCopy.title}</p>
        <p className="text-sm text-gray-600 leading-relaxed">{concernCopy.body}</p>
      </div>

      {/* Honest note */}
      <p className="text-xs text-gray-400 text-center leading-relaxed px-4">{path.honestNote}</p>

    </div>
  );
}

// Export CTA URL so page.tsx can build a dynamic button
export function getHmdPathCtaUrl(result: AssessmentResponse, summary: FormSummary | null): string {
  return PATH_CONFIG[derivePathKey(result, summary)].ctaUrl;
}

export function getHmdPathApproach(result: AssessmentResponse, summary: FormSummary | null): string {
  return PATH_CONFIG[derivePathKey(result, summary)].approach;
}
