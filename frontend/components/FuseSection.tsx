"use client";

import { AssessmentResponse, FormSummary } from "@/lib/types";

interface FuseSectionProps {
  result: AssessmentResponse;
  summary: FormSummary | null;
}

// ── Dynamic content maps ──────────────────────────────────────────────────────

const CONCERN_COPY: Record<string, { title: string; body: string }> = {
  harmful_content: {
    title: "Your main concern is harmful content exposure.",
    body: "HMD Fuse includes protection features designed to help reduce exposure to inappropriate content across the device experience.",
  },
  strangers: {
    title: "Your main concern is contact from unknown people.",
    body: "HMD Fuse may support a safer introduction by helping parents establish trusted communication habits before expanding independence.",
  },
  cyberbullying: {
    title: "Your family is concerned about online interactions.",
    body: "TrustBridge recommends combining family conversations with safety-focused device features and gradual independence.",
  },
  screen_time: {
    title: "Your concern is healthy device use.",
    body: "Device choice alone will not solve screen-time challenges, but a structured setup and agreed family rules can make healthy habits easier to build.",
  },
  social_pressure: {
    title: "Your concern is social pressure online.",
    body: "HMD Fuse may support a more gradual introduction to social features, giving your family time to build digital confidence together.",
  },
  privacy: {
    title: "Your concern is protecting your child's privacy.",
    body: "HMD Fuse is designed with privacy considerations for younger users, supporting a safer introduction to digital life.",
  },
  not_sure: {
    title: "You are still forming your priorities.",
    body: "A safety-focused first phone gives your family more time to build agreements and habits before expanding digital independence.",
  },
};

const FALLBACK_CONCERN_COPY = {
  title: "Your family is beginning a digital journey.",
  body: "HMD Fuse may be worth considering as a structured starting point, designed to support gradual independence rather than unrestricted access from day one.",
};

const COMPARISON_ROWS: { feature: string; regular: boolean }[] = [
  { feature: "First smartphone use",  regular: true },
  { feature: "Built-in protection",   regular: false },
  { feature: "Simpler parent setup",  regular: false },
  { feature: "Gradual introduction",  regular: false },
  { feature: "Safety-first design",   regular: false },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function getExplanation(result: AssessmentResponse, summary: FormSummary | null): string {
  const isFirst = summary?.isFirstSmartphone;
  const level = result.readiness_level;

  if (level === "not_ready" && isFirst) {
    return "Your family is beginning a careful introduction to smartphones. A device designed for safer-start use — with built-in structure rather than open access from day one — may make the early weeks easier to manage.";
  }
  if (level === "not_ready") {
    return "The suggested approach focuses on building strong digital habits before expanding independence. A safety-focused device may support this alongside agreed family rules.";
  }
  if (level === "moderate" && isFirst) {
    return "Your family is introducing a first smartphone with a gradual approach. TrustBridge favours devices that support a structured introduction rather than unrestricted access from day one.";
  }
  if (level === "moderate") {
    return "Your family approach focuses on gradual independence with clear boundaries. HMD Fuse may support this by providing a structured starting point that can expand as trust develops.";
  }
  return "Your family has clear boundaries and positive digital habits in place. Family agreements will have the most impact — though a safety-conscious first phone can still be a helpful starting point.";
}

function getHonestNote(level: string): string {
  if (level === "ready_with_boundaries") {
    return "The suggested family approach is likely to have a greater impact than device choice alone.";
  }
  if (level === "moderate") {
    return "HMD Fuse may support this approach alongside agreed family rules and regular check-ins.";
  }
  return "HMD Fuse may be worth considering as part of your family's safer-start approach.";
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function FuseSection({ result, summary }: FuseSectionProps) {
  const concernKey = summary?.mainConcernKey || result.risk_profile[0]?.key || "";
  const concernLabel = summary?.mainConcernLabel || result.risk_profile[0]?.label || "";
  const concernCopy = CONCERN_COPY[concernKey] ?? FALLBACK_CONCERN_COPY;
  const explanation = getExplanation(result, summary);
  const honestNote = getHonestNote(result.readiness_level);

  const contextItems: string[] = [];
  if (summary?.ageLabel) contextItems.push(`Age: ${summary.ageLabel}`);
  if (summary?.isFirstSmartphone != null) {
    contextItems.push(summary.isFirstSmartphone ? "First smartphone" : "Previously had a smartphone");
  }
  if (concernLabel) contextItems.push(`Main concern: ${concernLabel}`);
  contextItems.push(`Family approach: ${result.recommended_parenting_approach}`);

  return (
    <div className="space-y-3">

      {/* Header card — intro + context + explanation */}
      <div className="rounded-2xl border border-hmd-teal/30 bg-gradient-to-br from-teal-50 to-blue-50 p-5 space-y-4">

        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-hmd-teal/10 flex items-center justify-center mt-0.5">
            <svg viewBox="0 0 24 24" fill="none" stroke="#00A99D" strokeWidth="2" className="w-4 h-4">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-semibold text-hmd-teal uppercase tracking-widest">
              Why HMD Fuse May Fit Your Family
            </p>
            <p className="text-xs text-gray-500 leading-relaxed mt-1">
              Based on your answers, TrustBridge identified a few areas where HMD Fuse may support your family&rsquo;s approach.
            </p>
          </div>
        </div>

        {/* PART 1 — Context summary */}
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

        {/* PART 2 — Short explanation */}
        <p className="text-sm text-gray-700 leading-relaxed">{explanation}</p>

      </div>

      {/* PART 3 — Comparison table */}
      <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden">
        <div className="grid grid-cols-[3fr_1fr_1fr] bg-gray-50 px-4 py-2.5 border-b border-gray-100">
          <div className="text-xs text-gray-400 font-medium">Feature</div>
          <div className="text-xs text-gray-500 text-center font-medium">Standard</div>
          <div className="text-xs font-semibold text-hmd-teal text-center">HMD Fuse</div>
        </div>
        {COMPARISON_ROWS.map((row, i) => (
          <div
            key={i}
            className={`grid grid-cols-[3fr_1fr_1fr] px-4 py-2.5 items-center ${
              i < COMPARISON_ROWS.length - 1 ? "border-b border-gray-50" : ""
            }`}
          >
            <div className="text-xs text-gray-700 pr-2">{row.feature}</div>
            <div className="text-center text-sm">
              {row.regular ? (
                <span className="text-gray-400 font-semibold">✓</span>
              ) : (
                <span className="text-amber-400 font-semibold">△</span>
              )}
            </div>
            <div className="text-center text-sm text-hmd-teal font-bold">✓</div>
          </div>
        ))}
      </div>

      {/* PART 4 — Dynamic concern benefit */}
      <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 space-y-1.5">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
          Why this matters for your family
        </p>
        <p className="text-sm font-semibold text-gray-800 leading-snug">{concernCopy.title}</p>
        <p className="text-sm text-gray-600 leading-relaxed">{concernCopy.body}</p>
      </div>

      {/* PART 5 — Honest note */}
      <p className="text-xs text-gray-400 text-center leading-relaxed px-4">{honestNote}</p>

    </div>
  );
}
