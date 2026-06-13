"use client";

import { useState } from "react";
import AssessmentForm from "@/components/AssessmentForm";
import ReadinessScore from "@/components/ReadinessScore";
import FuseRecommendation from "@/components/FuseRecommendation";
import PhoneAgreement from "@/components/PhoneAgreement";
import FirstWeekPlan from "@/components/FirstWeekPlan";
import PhoneComparison from "@/components/PhoneComparison";
import { AssessmentResponse, RiskItem, ScoreDriver } from "@/lib/types";

type AppState = "landing" | "assessing" | "results";

// ── Static data ───────────────────────────────────────────────────────────────

const HABIT_MAP: Record<string, { title: string; description: string }> = {
  strangers:       { title: "Safe Communication",    description: "Knowing who to contact and how to respond to unknown messages." },
  screen_time:     { title: "Healthy Screen Habits", description: "Balancing phone time with offline activities and family life." },
  harmful_content: { title: "Digital Confidence",    description: "Recognising and responding calmly to uncomfortable content." },
  social_pressure: { title: "Online Respect",        description: "Navigating peer expectations and understanding digital boundaries." },
  cyberbullying:   { title: "Online Respect",        description: "Building resilience and knowing how to respond to unkind behaviour." },
  privacy:         { title: "Digital Privacy",       description: "Protecting personal information and understanding what stays private." },
};

const RESEARCH_INSIGHTS = [
  {
    stat: "51% of children report being contacted online by strangers.",
    source: "HMD Better Phone Research",
  },
  {
    stat: "THL Finland recommends delaying personal smartphones until later childhood where possible.",
    source: "THL Finland",
  },
  {
    stat: "Age-appropriate digital habits established early are linked to better online safety outcomes.",
    source: "EU Better Internet for Kids",
  },
];

// ── Expandable section ────────────────────────────────────────────────────────
function ExpandableSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-100 rounded-2xl overflow-hidden bg-white">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left"
      >
        <span className="text-sm font-semibold text-gray-800">{title}</span>
        <svg
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && <div className="px-1 pb-1">{children}</div>}
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const SEVERITY_ORDER: Record<string, number> = { high: 0, medium: 1, low: 2 };

function topRisks(risks: RiskItem[], n = 5): RiskItem[] {
  return [...risks].sort((a, b) => (SEVERITY_ORDER[a.severity] ?? 2) - (SEVERITY_ORDER[b.severity] ?? 2)).slice(0, n);
}

function topDrivers(drivers: ScoreDriver[], n = 3): ScoreDriver[] {
  return [...drivers].sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact)).slice(0, n);
}

function deriveHabits(risks: RiskItem[]): { title: string; description: string }[] {
  const seen = new Set<string>();
  const habits: { title: string; description: string }[] = [];
  for (const r of topRisks(risks)) {
    const habit = HABIT_MAP[r.key];
    if (!habit || seen.has(habit.title)) continue;
    seen.add(habit.title);
    habits.push(habit);
    if (habits.length === 3) break;
  }
  if (habits.length === 0) {
    habits.push({ title: "Healthy Screen Habits", description: "Balancing phone time with offline activities and family life." });
    habits.push({ title: "Safe Communication", description: "Knowing who to contact and how to respond to unknown messages." });
    habits.push({ title: "Digital Confidence", description: "Building trust and open conversations about the digital world." });
  }
  return habits;
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function Home() {
  const [appState, setAppState] = useState<AppState>("landing");
  const [result, setResult] = useState<AssessmentResponse | null>(null);

  function handleComplete(response: AssessmentResponse) {
    setResult(response);
    setAppState("results");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleReset() {
    setResult(null);
    setAppState("landing");
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  // ── Landing ─────────────────────────────────────────────────────────────────
  if (appState === "landing") {
    return (
      <main className="min-h-screen bg-white">

        {/* Hero — soft teal gradient wash */}
        <div className="bg-gradient-to-b from-teal-50/60 to-white px-5 pt-14 pb-12 text-center">
          <div className="max-w-sm mx-auto">

            {/* Brand label */}
            <span className="inline-block text-xs font-bold tracking-widest text-hmd-teal uppercase mb-6">
              HMD TrustBridge
            </span>

            {/* Headline */}
            <h1 className="text-[1.75rem] font-bold text-gray-900 leading-tight mb-4">
              Helping your child build<br />healthy phone habits
            </h1>

            {/* Subheadline */}
            <p className="text-gray-500 text-sm leading-relaxed mb-3 max-w-xs mx-auto">
              A short guided conversation to help your family make safer, more confident smartphone decisions.
            </p>

            {/* Privacy note */}
            <p className="text-xs text-gray-400 mb-8 leading-relaxed">
              No child name, email or account needed.
            </p>

            {/* CTA */}
            <button onClick={() => setAppState("assessing")} className="tb-btn-primary mb-3">
              Start the conversation
            </button>

            {/* Footer note */}
            <p className="text-xs text-gray-400">
              Under 60 seconds &middot; Parent-first &middot; Research-informed
            </p>

          </div>
        </div>

        {/* Three-step path */}
        <div className="px-8 py-8">
          <div className="max-w-xs mx-auto">
            <div className="flex items-start justify-between">

              <div className="flex flex-col items-center gap-2 flex-1">
                <div className="w-9 h-9 rounded-full bg-hmd-teal/10 border border-hmd-teal/20 flex items-center justify-center">
                  <span className="w-2.5 h-2.5 rounded-full bg-hmd-teal" />
                </div>
                <p className="text-xs text-gray-500 text-center font-medium">Family</p>
              </div>

              <div className="flex-1 flex items-center pt-4">
                <div className="w-full h-px bg-gradient-to-r from-hmd-teal/30 via-hmd-blue/20 to-hmd-blue/30" />
              </div>

              <div className="flex flex-col items-center gap-2 flex-1">
                <div className="w-9 h-9 rounded-full bg-hmd-blue/10 border border-hmd-blue/20 flex items-center justify-center">
                  <span className="w-2.5 h-2.5 rounded-full bg-hmd-blue" />
                </div>
                <p className="text-xs text-gray-500 text-center font-medium">Healthy<br />habits</p>
              </div>

              <div className="flex-1 flex items-center pt-4">
                <div className="w-full h-px bg-gradient-to-r from-hmd-blue/30 via-hmd-teal/20 to-hmd-teal/30" />
              </div>

              <div className="flex flex-col items-center gap-2 flex-1">
                <div className="w-9 h-9 rounded-full bg-hmd-teal/10 border border-hmd-teal/20 flex items-center justify-center">
                  <span className="w-2.5 h-2.5 rounded-full bg-hmd-teal" />
                </div>
                <p className="text-xs text-gray-500 text-center font-medium">Digital<br />independence</p>
              </div>

            </div>
          </div>
        </div>

        {/* Value cards */}
        <div className="px-5 pb-16">
          <div className="max-w-sm mx-auto space-y-3">

            <div className="rounded-2xl border border-teal-100 bg-teal-50/40 p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-hmd-teal/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#00A99D" strokeWidth="2" className="w-4 h-4">
                    <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800 mb-0.5">Safer use</p>
                  <p className="text-xs text-gray-500 leading-relaxed">Practical guidance for online risks and trusted contacts.</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-blue-100 bg-blue-50/40 p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-hmd-blue/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#0057B8" strokeWidth="2" className="w-4 h-4">
                    <path d="M12 3v1m0 16v1M4.22 4.22l.707.707m12.02 12.02l.707.707M1 12h2m18 0h2M4.22 19.78l.707-.707M18.95 5.05l.707-.707M12 7a5 5 0 100 10A5 5 0 0012 7z" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800 mb-0.5">Healthy habits</p>
                  <p className="text-xs text-gray-500 leading-relaxed">Support screen-time balance without over-control.</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-gray-200/60 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" className="w-4 h-4">
                    <path d="M13 7l5 5m0 0l-5 5m5-5H6" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800 mb-0.5">Growing independence</p>
                  <p className="text-xs text-gray-500 leading-relaxed">Help children build confidence step by step.</p>
                </div>
              </div>
            </div>

          </div>
        </div>

      </main>
    );
  }

  // ── Assessment ───────────────────────────────────────────────────────────────
  if (appState === "assessing") {
    return <AssessmentForm onComplete={handleComplete} onBack={() => setAppState("landing")} />;
  }

  // ── Results ──────────────────────────────────────────────────────────────────
  if (!result) return null;

  const report = result.report;
  const planItems = (report?.safety_strategy ?? result.strategy_focus).slice(0, 3);
  const habits = deriveHabits(result.risk_profile);
  const noticeDrivers = topDrivers(result.score_drivers, 3);
  const conversationStarter = report?.suggested_parent_child_conversation ?? null;

  return (
    <main className="min-h-screen pb-16 bg-white">

      {/* Sticky header */}
      <div className="px-5 pt-6 pb-4 border-b border-gray-100 bg-white/70 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <span className="text-xs font-bold tracking-widest text-hmd-teal uppercase">HMD TrustBridge</span>
          <span className="text-xs text-gray-400">Your Family Digital Safety Snapshot</span>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-5 pt-6 space-y-4">

        {/* 1 — Suggested Family Approach */}
        <ReadinessScore
          label={result.readiness_display_label}
          approach={result.recommended_parenting_approach}
          level={result.readiness_level}
        />

        {/* 2 — Why This Approach */}
        {noticeDrivers.length > 0 && (
          <div className="tb-card space-y-3">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Why This Approach</p>
            {report?.headline && (
              <p className="text-base font-bold text-gray-900 leading-snug">{report.headline}</p>
            )}
            <div className="space-y-2">
              {noticeDrivers.map((d, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                  <span className="text-hmd-teal font-bold text-sm flex-shrink-0 mt-0.5">✓</span>
                  <p className="text-sm text-gray-700 leading-relaxed">{d.explanation}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3 — Healthy Digital Habits To Focus On */}
        {habits.length > 0 && (
          <div className="tb-card space-y-3">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Healthy Digital Habits To Focus On</p>
            <div className="space-y-2">
              {habits.map((h, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl border border-gray-100">
                  <span className="w-2 h-2 rounded-full bg-hmd-teal flex-shrink-0 mt-1.5" />
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{h.title}</p>
                    <p className="text-xs text-gray-500 leading-relaxed mt-0.5">{h.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4 — First Steps For Your Family */}
        {planItems.length > 0 && (
          <div className="tb-card space-y-3">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">First Steps For Your Family</p>
            <div className="space-y-2">
              {planItems.map((item, i) => (
                <div key={i} className="flex gap-3 items-start p-3 bg-gray-50 rounded-xl">
                  <span className="w-6 h-6 rounded-full bg-hmd-teal text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-sm text-gray-700 leading-relaxed">{item}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5 — Conversation Starter */}
        {conversationStarter && (
          <div className="tb-card border-l-4 border-hmd-teal bg-teal-50/30 space-y-2">
            <p className="text-xs font-semibold text-hmd-teal uppercase tracking-widest">One Conversation Starter</p>
            <p className="text-sm text-gray-700 italic leading-relaxed">&ldquo;{conversationStarter}&rdquo;</p>
          </div>
        )}

        {/* 6 — Why HMD Fuse May Fit */}
        {report?.why_hmd_fuse_fits && (
          <FuseRecommendation text={report.why_hmd_fuse_fits} />
        )}

        {/* 7 — CTA */}
        <div className="pt-1 pb-2 space-y-3">
          <a
            href="https://www.hmd.com/fuse"
            target="_blank"
            rel="noopener noreferrer"
            className="tb-btn-primary inline-block text-center"
          >
            Continue with HMD Fuse
          </a>
          <p className="text-xs text-gray-400 text-center leading-relaxed">
            HMD Fuse is designed to support a safer first-phone experience.
            It does not guarantee protection.
          </p>
        </div>

        {/* 8 — Helpful tools */}
        <div className="pt-2">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3 px-1">
            Helpful tools for your family
          </p>
          <div className="space-y-2">
            <ExpandableSection title="Family Phone Agreement">
              <PhoneAgreement />
            </ExpandableSection>
            <ExpandableSection title="First Week Safety Plan">
              <FirstWeekPlan />
            </ExpandableSection>
            <ExpandableSection title="Choosing the right first-phone path">
              <PhoneComparison />
            </ExpandableSection>
          </div>
        </div>

        {/* 9 — Research Insights */}
        <div className="pt-2">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3 px-1">
            Research Insights
          </p>
          <div className="space-y-2">
            {RESEARCH_INSIGHTS.map((insight, i) => (
              <div key={i} className="border border-gray-100 rounded-2xl p-4 bg-gray-50">
                <p className="text-sm text-gray-700 leading-relaxed mb-2">{insight.stat}</p>
                <p className="text-xs text-gray-400">Source: {insight.source}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 10 — Bottom actions */}
        <div className="pt-2 space-y-3">
          <button onClick={() => window.print()} className="tb-btn-secondary">
            Save summary
          </button>
          <button
            onClick={handleReset}
            className="w-full text-center text-sm text-gray-400 hover:text-gray-600 py-2 transition-colors"
          >
            Start again
          </button>
        </div>

      </div>
    </main>
  );
}
