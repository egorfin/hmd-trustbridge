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
      <main className="min-h-screen flex flex-col items-center justify-center px-5 py-12 text-center">
        <div className="max-w-sm mx-auto">
          <div className="mb-5">
            <span className="text-xs font-bold tracking-widest text-hmd-teal uppercase">HMD TrustBridge</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 leading-tight mb-3">
            Building Healthy Digital Habits Together
          </h1>
          <p className="text-gray-500 text-sm leading-relaxed mb-4">
            A short guided conversation to help your family make confident smartphone decisions.
          </p>
          <p className="text-xs text-gray-400 mb-8 px-2 leading-relaxed">
            No child name, email or account needed. Your answers are used only to create this family guidance snapshot.
          </p>
          <button onClick={() => setAppState("assessing")} className="tb-btn-primary mb-4">
            Start the conversation
          </button>
          <p className="text-xs text-gray-400">Under 60 seconds &middot; Completely free</p>
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
