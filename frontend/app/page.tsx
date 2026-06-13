"use client";

import { useState } from "react";
import AssessmentForm from "@/components/AssessmentForm";
import PhoneAgreement from "@/components/PhoneAgreement";
import FirstWeekPlan from "@/components/FirstWeekPlan";
import {
  getHmdPathCtaUrl,
  getProductName,
  buildWhy,
  derivePathKey,
  SmartphoneComparisonContent,
  CHALLENGE_LABEL,
} from "@/components/HmdPathSection";
import { AssessmentResponse, FormSummary, RiskItem, ScoreDriver } from "@/lib/types";

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

type ResearchInsight = {
  stat: string;
  source: string;
  minAge?: number;
  maxAge?: number;
  concerns?: string[];
  requiresFirst?: boolean;
  requiresExisting?: boolean;
};

const RESEARCH_INSIGHTS_POOL: ResearchInsight[] = [
  {
    stat: "51% of children report being contacted online by strangers.",
    source: "HMD Better Phone Research",
    concerns: ["strangers", "harmful_content"],
    maxAge: 15,
  },
  {
    stat: "THL Finland recommends delaying personal smartphones until later childhood where possible.",
    source: "THL Finland",
    maxAge: 12,
    requiresFirst: true,
  },
  {
    stat: "Family agreements about smartphone use have a greater impact on wellbeing than device controls alone.",
    source: "HMD Better Phone Project",
  },
  {
    stat: "Age-appropriate digital habits established early are linked to better long-term online safety.",
    source: "EU Better Internet for Kids",
    maxAge: 14,
  },
  {
    stat: "Teenagers who regularly discuss online safety with parents report fewer negative online experiences.",
    source: "Save the Children Finland",
    minAge: 13,
  },
  {
    stat: "Screen time agreements made together with children are more effective than imposed limits.",
    source: "HMD Better Phone Research",
    concerns: ["screen_time"],
  },
  {
    stat: "Digital independence developed gradually leads to better self-regulation in young people.",
    source: "EU Better Internet for Kids",
    minAge: 11,
  },
  {
    stat: "Children with established digital habits benefit most from clear family communication rather than new restrictions.",
    source: "HMD Better Phone Research",
    requiresExisting: true,
  },
];

function selectInsights(summary: FormSummary | null, n = 3): ResearchInsight[] {
  const age = summary?.childAge ?? 0;
  const concern = summary?.mainConcernKey ?? "";
  const isFirst = summary?.isFirstSmartphone;
  const candidates = RESEARCH_INSIGHTS_POOL.filter((i) => {
    if (age > 0) {
      if (i.minAge != null && age < i.minAge) return false;
      if (i.maxAge != null && age > i.maxAge) return false;
    }
    if (i.requiresFirst && isFirst !== true) return false;
    if (i.requiresExisting && isFirst !== false) return false;
    return true;
  });
  const concernMatch = candidates.filter((i) => i.concerns?.includes(concern));
  const others = candidates.filter((i) => !i.concerns?.includes(concern));
  return [...concernMatch, ...others].slice(0, n);
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
  }
  return habits;
}

function firstSentence(text: string): string {
  const m = text.match(/^[^.!?]+[.!?]/);
  return m ? m[0].trim() : text;
}

function getFamilyProfile(result: AssessmentResponse, summary: FormSummary | null): string {
  const age = summary?.childAge ?? 0;
  const level = result.readiness_level;
  if (age > 0 && age <= 8) return "Parent-Guided Start";
  if (age >= 16 && level === "ready_with_boundaries") return "Responsible Independence";
  if (level === "not_ready") return "Protected Starter";
  if (level === "moderate") return "Guided Explorer";
  return "Growing Independence";
}

// ── Accordion ─────────────────────────────────────────────────────────────────

function Accordion({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`rounded-2xl border bg-white transition-colors ${open ? "border-gray-200" : "border-gray-100"}`}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left"
        aria-expanded={open}
      >
        <div className="flex-1 min-w-0 pr-4">
          <p className="text-sm font-semibold text-gray-900">{title}</p>
          {hint && !open && (
            <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{hint}</p>
          )}
        </div>
        <svg
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        >
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <div className="px-5 pb-5 pt-1 border-t border-gray-50">
          {children}
        </div>
      )}
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────

export default function Home() {
  const [appState, setAppState] = useState<AppState>("landing");
  const [result, setResult] = useState<AssessmentResponse | null>(null);
  const [formSummary, setFormSummary] = useState<FormSummary | null>(null);

  function handleComplete(response: AssessmentResponse, summary: FormSummary) {
    setResult(response);
    setFormSummary(summary);
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
      <main className="min-h-screen bg-white flex flex-col">

        {/* Above fold — spacious, single focus */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center bg-gradient-to-b from-teal-50/50 to-white">
          <div className="max-w-sm w-full mx-auto space-y-6">

            <span className="inline-block text-xs font-bold tracking-widest text-hmd-teal uppercase">
              HMD TrustBridge
            </span>

            <h1 className="text-[1.85rem] font-bold text-gray-900 leading-tight tracking-tight">
              Helping your child build<br />healthy phone habits
            </h1>

            <p className="text-gray-500 text-sm leading-relaxed max-w-xs mx-auto">
              A short guided conversation to help your family make safer, more confident smartphone decisions.
            </p>

            <p className="text-xs text-gray-400">
              No child name, email or account needed.
            </p>

            <div className="pt-2 space-y-3">
              <button
                onClick={() => setAppState("assessing")}
                className="tb-btn-primary"
              >
                Start the conversation
              </button>

              <p className="text-xs text-gray-400">
                Under 60 seconds &middot; Parent-first &middot; Research-informed
              </p>
            </div>

          </div>
        </div>

        {/* Below fold — value cards */}
        <div className="px-6 py-12 bg-gray-50/40 border-t border-gray-100">
          <div className="max-w-sm mx-auto">

            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-5 text-center">
              What TrustBridge helps with
            </p>

            <div className="space-y-3">

              <div className="rounded-2xl border border-teal-100 bg-white p-4">
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

              <div className="rounded-2xl border border-blue-100 bg-white p-4">
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

              <div className="rounded-2xl border border-gray-100 bg-white p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
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

  // Personalization
  const childAge = formSummary?.childAge ?? 0;
  const isFirstSmartphone = formSummary?.isFirstSmartphone;
  const isOlderTeen = childAge >= 16;
  const concernKey = formSummary?.mainConcernKey || result.risk_profile[0]?.key || "";
  const selectedInsights = selectInsights(formSummary);
  const planHeader =
    isFirstSmartphone === false
      ? "Building Better Digital Habits"
      : isOlderTeen
      ? "Steps Towards Greater Independence"
      : "First Steps For Your Family";

  // Dashboard card data
  const familyProfile = getFamilyProfile(result, formSummary);
  const challengeLabel = CHALLENGE_LABEL[concernKey] ?? "Digital Safety";
  const productName = getProductName(result, formSummary);
  const whySentence = buildWhy(result, formSummary);
  const ctaUrl = getHmdPathCtaUrl(result, formSummary);

  return (
    <main className="min-h-screen pb-16 bg-white">

      {/* Sticky header */}
      <div className="px-5 pt-6 pb-4 border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <span className="text-xs font-bold tracking-widest text-hmd-teal uppercase">HMD TrustBridge</span>
          <span className="text-xs text-gray-400">Your Family Plan</span>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-5 pt-6 space-y-4">

        {/* ── Dashboard card ─────────────────────────────────────────────────── */}
        <div className="rounded-3xl border border-gray-100 bg-gradient-to-br from-teal-50/60 via-white to-blue-50/30 p-6 space-y-5">

          {/* Row 1: Family Profile + Biggest Challenge */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Family Profile</p>
              <span className="inline-block bg-hmd-teal text-white text-xs font-bold px-3 py-1.5 rounded-full">
                {familyProfile}
              </span>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Biggest Challenge</p>
              <span className="inline-block bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold px-3 py-1.5 rounded-full">
                {challengeLabel}
              </span>
            </div>
          </div>

          <div className="h-px bg-gray-100" />

          {/* Row 2: Recommended HMD Path */}
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Recommended HMD Path</p>
            <span className="inline-block bg-hmd-blue/10 border border-hmd-blue/20 text-hmd-blue text-xs font-bold px-3 py-1.5 rounded-full">
              {productName}
            </span>
          </div>

          <div className="h-px bg-gray-100" />

          {/* Row 3: Why */}
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Why</p>
            <p className="text-sm text-gray-700 leading-relaxed">{whySentence}</p>
          </div>

        </div>

        {/* ── CTA ───────────────────────────────────────────────────────────── */}
        <div className="space-y-2">
          <a
            href={ctaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="tb-btn-primary inline-block text-center"
          >
            Explore Your Recommended HMD Path
          </a>
          <p className="text-xs text-gray-400 text-center leading-relaxed">
            TrustBridge recommends an approach, not just a device. The right conversations will always matter most.
          </p>
        </div>

        {/* ── Divider ───────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-3 py-1">
          <div className="flex-1 h-px bg-gray-100" />
          <span className="text-xs text-gray-400">Tap to explore more</span>
          <div className="flex-1 h-px bg-gray-100" />
        </div>

        {/* ── Accordion 1: Why this path? ───────────────────────────────────── */}
        <Accordion
          title="Why did TrustBridge suggest this?"
          hint="See the factors behind your family profile and recommended approach."
        >
          <div className="space-y-4 pt-2">

            {/* Context chips */}
            <div className="flex flex-wrap gap-2">
              {formSummary?.ageLabel && (
                <span className="bg-gray-100 text-gray-600 text-xs font-medium px-3 py-1 rounded-full">
                  {formSummary.ageLabel}
                </span>
              )}
              {formSummary?.isFirstSmartphone != null && (
                <span className="bg-gray-100 text-gray-600 text-xs font-medium px-3 py-1 rounded-full">
                  {formSummary.isFirstSmartphone ? "First smartphone" : "Existing phone"}
                </span>
              )}
              {challengeLabel && (
                <span className="bg-gray-100 text-gray-600 text-xs font-medium px-3 py-1 rounded-full">
                  {challengeLabel}
                </span>
              )}
              <span className="bg-gray-100 text-gray-600 text-xs font-medium px-3 py-1 rounded-full">
                {result.recommended_parenting_approach}
              </span>
            </div>

            {/* Evidence drivers */}
            {noticeDrivers.map((d, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                <span className="text-hmd-teal font-bold text-sm flex-shrink-0 mt-0.5">✓</span>
                <p className="text-sm text-gray-700 leading-relaxed">{d.explanation}</p>
              </div>
            ))}

            {report?.headline && (
              <p className="text-sm font-semibold text-gray-800 leading-snug pt-1">{report.headline}</p>
            )}

          </div>
        </Accordion>

        {/* ── Accordion 2: Compare with regular phone ───────────────────────── */}
        <Accordion
          title="Why not a regular smartphone?"
          hint="See how the recommended HMD path differs from a standard smartphone for your challenge."
        >
          <SmartphoneComparisonContent result={result} summary={formSummary} />
        </Accordion>

        {/* ── Accordion 3: Family action plan ──────────────────────────────── */}
        <Accordion
          title="Family action plan"
          hint="Practical steps and a conversation starter for your family."
        >
          <div className="space-y-4 pt-2">

            {/* Habits */}
            {habits.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Habits to focus on</p>
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
            )}

            {/* Plan steps */}
            {planItems.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">{planHeader}</p>
                {isFirstSmartphone === false && (
                  <p className="text-xs text-gray-500 italic">Focused on strengthening existing habits rather than starting from scratch.</p>
                )}
                {isOlderTeen && isFirstSmartphone !== false && (
                  <p className="text-xs text-gray-500 italic">Focused on building responsible independence, not restriction.</p>
                )}
                {planItems.map((item, i) => (
                  <div key={i} className="flex gap-3 items-start p-3 bg-gray-50 rounded-xl">
                    <span className="w-6 h-6 rounded-full bg-hmd-teal text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-sm text-gray-700 leading-relaxed">{item}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Conversation starter */}
            {conversationStarter && (
              <div className="border-l-4 border-hmd-teal bg-teal-50/30 rounded-r-xl p-4 space-y-1">
                <p className="text-xs font-semibold text-hmd-teal uppercase tracking-widest">
                  {isOlderTeen ? "A question worth discussing" : "One conversation starter"}
                </p>
                <p className="text-sm text-gray-700 italic leading-relaxed">
                  &ldquo;{firstSentence(conversationStarter)}&rdquo;
                </p>
              </div>
            )}

          </div>
        </Accordion>

        {/* ── Accordion 4: Research ─────────────────────────────────────────── */}
        <Accordion
          title="Research behind this recommendation"
          hint="Sources that inform the TrustBridge approach."
        >
          <div className="space-y-3 pt-2">
            {selectedInsights.map((insight, i) => (
              <div key={i} className="rounded-xl border border-gray-100 p-4 bg-gray-50">
                <p className="text-sm text-gray-700 leading-relaxed mb-2">{insight.stat}</p>
                <p className="text-xs text-gray-400">Source: {insight.source}</p>
              </div>
            ))}
          </div>
        </Accordion>

        {/* ── Accordion 5: Family agreement & tools ────────────────────────── */}
        <Accordion
          title={isFirstSmartphone === false ? "Family digital agreement" : "Family phone agreement"}
          hint="A simple agreement to set expectations for everyone."
        >
          <div className="space-y-4 pt-2">
            <PhoneAgreement />
            {isFirstSmartphone !== false && (
              <div className="pt-2">
                <FirstWeekPlan />
              </div>
            )}
            <button onClick={() => window.print()} className="tb-btn-secondary mt-2">
              Save or print
            </button>
          </div>
        </Accordion>

        {/* ── Bottom actions ────────────────────────────────────────────────── */}
        <div className="pt-4 space-y-3">
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
