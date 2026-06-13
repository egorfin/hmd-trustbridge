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
  HmdPathHelpContent,
  CHALLENGE_LABEL,
} from "@/components/HmdPathSection";
import EvidenceChip from "@/components/EvidenceChip";
import { selectEvidenceSet } from "@/lib/evidenceSources";
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

const PATH_APPROACH_LABEL: Record<string, string> = {
  protected: "Protected Start",
  guided:    "Guided Independence",
  flexible:  "Flexible Boundaries",
};

const HERO_SUBTITLE: Record<string, string> = {
  protected: "Based on your answers, TrustBridge suggests a protected start — with clear boundaries from day one.",
  guided:    "Based on your answers, TrustBridge suggests a guided path — building independence with the right tools in place.",
  flexible:  "Based on your answers, TrustBridge suggests a flexible approach — your child is ready for some independence with agreed rules.",
};

const QUICK_STEPS: Record<string, [string, string, string]> = {
  strangers:       ["Agree who your child can contact", "Set screen-free evening time", "Talk about what to do if a stranger messages them"],
  screen_time:     ["Set daily screen-time limits before the phone arrives", "Create phone-free zones together", "Agree on a nightly phone handover time"],
  harmful_content: ["Set up content filters before handing over the phone", "Talk about what to do if they see something upsetting", "Agree on which apps are allowed from the start"],
  cyberbullying:   ["Talk openly about what online unkindness looks like", "Agree they can always come to you without judgment", "Set up trusted contacts before adding school friends"],
  social_pressure: ["Agree on which social apps are allowed at the start", "Talk about what to do when friends pressure them online", "Set screen-free evening time to protect daily downtime"],
  privacy:         ["Talk about what personal information should stay private", "Agree on which apps are allowed and why", "Review privacy settings together on day one"],
  not_sure:        ["Have one safety conversation before the phone arrives", "Agree on screen-free times and zones together", "Set up trusted contacts as your starting point"],
};

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
    <div className={`rounded-2xl bg-white transition-all ${open ? "border border-gray-200 shadow-md" : "border border-gray-100 shadow-sm"}`}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-5 text-left"
        aria-expanded={open}
      >
        <div className="flex-1 min-w-0 pr-4">
          <p className="text-sm font-semibold text-gray-900">{title}</p>
          {hint && !open && (
            <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{hint}</p>
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
        <div className="px-5 pb-6 pt-2 border-t border-gray-100">
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
      <main className="min-h-screen bg-white overflow-x-hidden">

        {/* ── Navigation ────────────────────────────────────────────────── */}
        <nav className="relative z-20 border-b border-gray-100 bg-white/95 backdrop-blur-sm sticky top-0">
          <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
            <span className="text-sm font-bold text-hmd-teal tracking-wider uppercase">
              HMD TrustBridge
            </span>
            <div className="hidden md:flex items-center gap-8">
              <a href="#how-it-works" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">How it works</a>
              <a href="#helps-with"   className="text-sm text-gray-500 hover:text-gray-900 transition-colors">What it helps with</a>
              <a href="#research"     className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Research</a>
              <a href="#resources"    className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Resources</a>
            </div>
            <button
              onClick={() => setAppState("assessing")}
              className="bg-hmd-blue text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-hmd-blue/90 transition-colors"
            >
              Get started
            </button>
          </div>
        </nav>

        {/* ── Hero ──────────────────────────────────────────────────────── */}
        <section className="relative px-6 pt-14 pb-20 lg:pt-20 lg:pb-28 overflow-hidden">

          {/* Background blobs */}
          <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full bg-hmd-teal/5 blur-3xl pointer-events-none" aria-hidden="true" />
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-hmd-blue/5 blur-3xl pointer-events-none" aria-hidden="true" />

          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

              {/* Left: copy */}
              <div className="space-y-7">

                <span className="inline-flex items-center gap-2 bg-teal-50 border border-teal-100 text-hmd-teal text-xs font-semibold px-4 py-2 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-hmd-teal flex-shrink-0" aria-hidden="true" />
                  Parent-first. Child-focused.
                </span>

                <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 leading-[1.12] tracking-tight">
                  Find the safer smartphone path
                  <span className="text-hmd-teal block mt-1">for your child</span>
                </h1>

                <p className="text-lg text-gray-600 leading-relaxed max-w-md">
                  A 60-second guided check to help your child build healthy phone habits — without over-control.
                </p>

                <div className="space-y-4">
                  <button
                    onClick={() => setAppState("assessing")}
                    className="inline-flex items-center gap-2.5 bg-hmd-blue text-white font-semibold px-8 py-4 rounded-2xl shadow-lg hover:bg-hmd-blue/90 transition-all text-[0.95rem]"
                  >
                    Check my child&rsquo;s phone readiness
                    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 flex-shrink-0" aria-hidden="true">
                      <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                    </svg>
                  </button>

                  <div className="flex flex-wrap items-center gap-5">
                    {["Parent-first", "Research-informed", "No child name needed"].map((label) => (
                      <div key={label} className="flex items-center gap-1.5 text-xs text-gray-500">
                        <svg viewBox="0 0 20 20" fill="none" className="w-3.5 h-3.5 text-hmd-teal flex-shrink-0" aria-hidden="true">
                          <path d="M4 10l4 4 8-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        {label}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mr-1">
                    You&rsquo;ll get:
                  </span>
                  <span className="bg-gray-100 text-gray-700 text-xs font-medium px-3 py-1.5 rounded-full">Child Profile</span>
                  <span className="bg-gray-100 text-gray-700 text-xs font-medium px-3 py-1.5 rounded-full">Main Challenge</span>
                  <span className="bg-blue-50 border border-blue-100 text-hmd-blue text-xs font-medium px-3 py-1.5 rounded-full">HMD Path</span>
                </div>

              </div>

              {/* Right: visual panel — desktop only */}
              <div className="relative hidden lg:block">

                <div className="absolute -top-8 -right-8 w-64 h-64 bg-hmd-teal/10 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />
                <div className="absolute -bottom-8 -left-8 w-52 h-52 bg-hmd-blue/10 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />

                {/* Image placeholder */}
                <div className="relative rounded-3xl overflow-hidden aspect-[4/3] shadow-2xl bg-gradient-to-br from-teal-50 via-slate-50 to-blue-50">

                  <div className="absolute top-5 left-5 grid grid-cols-5 gap-1.5" aria-hidden="true">
                    {Array.from({length: 20}).map((_, i) => (
                      <div key={i} className="w-1 h-1 rounded-full bg-hmd-teal/30" />
                    ))}
                  </div>

                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg viewBox="0 0 220 170" fill="none" className="w-56 opacity-60" aria-hidden="true">
                      <ellipse cx="80"  cy="42" rx="26" ry="26" fill="#00A99D" fillOpacity="0.25"/>
                      <path d="M38 148 C38 105 122 105 122 148" fill="#00A99D" fillOpacity="0.15"/>
                      <ellipse cx="148" cy="54" rx="20" ry="20" fill="#0057B8" fillOpacity="0.2"/>
                      <path d="M114 148 C114 113 182 113 182 148" fill="#0057B8" fillOpacity="0.12"/>
                      <rect x="96" y="68" width="30" height="52" rx="6" fill="#1a2540" fillOpacity="0.12"/>
                      <rect x="99" y="72" width="24" height="40" rx="4" fill="#E5F4F3" fillOpacity="0.9"/>
                      <rect x="103" y="76" width="16" height="3" rx="1.5" fill="#00A99D" fillOpacity="0.4"/>
                      <rect x="103" y="82" width="12" height="2" rx="1" fill="#94a3b8" fillOpacity="0.5"/>
                      <rect x="103" y="87" width="14" height="2" rx="1" fill="#94a3b8" fillOpacity="0.5"/>
                    </svg>
                  </div>

                  <div className="absolute top-4 right-4 w-24 h-24 rounded-full border-4 border-hmd-teal/10" aria-hidden="true" />
                  <div className="absolute top-8 right-8 w-16 h-16 rounded-full border-4 border-hmd-blue/10" aria-hidden="true" />

                </div>

                {/* Floating result card */}
                <div className="absolute -bottom-5 -left-8 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 w-60">
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                    Your child&rsquo;s TrustBridge Path
                  </p>

                  <div className="flex items-center gap-3 mb-3">
                    <div className="relative flex-shrink-0 w-14 h-14">
                      <svg viewBox="0 0 56 56" className="w-14 h-14 -rotate-90" aria-hidden="true">
                        <circle cx="28" cy="28" r="22" fill="none" stroke="#F3F4F6" strokeWidth="5"/>
                        <circle cx="28" cy="28" r="22" fill="none" stroke="#00A99D" strokeWidth="5"
                          strokeLinecap="round" strokeDasharray="138.2" strokeDashoffset="35"/>
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-bold text-slate-900">75%</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">Guided start</p>
                      <p className="text-[11px] text-gray-500 leading-snug mt-0.5">
                        Small steps lead to lasting habits.
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-gray-50 pt-2 space-y-1.5">
                    {[
                      { label: "Focus area", value: "Screen-time balance" },
                      { label: "Next step",  value: "Set healthy boundaries" },
                      { label: "Goal",       value: "Build confidence" },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex items-center justify-between">
                        <span className="text-[10px] text-gray-400">{label}</span>
                        <span className="text-[10px] font-semibold text-hmd-blue">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          </div>
        </section>

        {/* ── What TrustBridge helps with ──────────────────────────────── */}
        <section id="helps-with" className="px-6 py-16 lg:py-20 bg-gray-50/60 border-y border-gray-100">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10">
              <p className="text-[10px] font-bold tracking-widest text-hmd-teal uppercase mb-3">Coverage</p>
              <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">
                What TrustBridge helps with
              </h2>
            </div>
            <div className="grid sm:grid-cols-3 gap-5">
              {[
                {
                  title:  "Safer use",
                  text:   "Practical guidance for online risks and trusted contacts.",
                  iconBg: "bg-hmd-teal/10",
                  stroke: "#00A99D",
                  path:   "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
                },
                {
                  title:  "Healthy habits",
                  text:   "Support screen-time balance without over-control.",
                  iconBg: "bg-hmd-blue/10",
                  stroke: "#0057B8",
                  path:   "M12 3v1m0 16v1M4.22 4.22l.707.707m12.02 12.02l.707.707M1 12h2m18 0h2M4.22 19.78l.707-.707M18.95 5.05l.707-.707M12 7a5 5 0 100 10A5 5 0 0012 7z",
                },
                {
                  title:  "Growing independence",
                  text:   "Help children build confidence step by step.",
                  iconBg: "bg-gray-100",
                  stroke: "#6B7280",
                  path:   "M13 7l5 5m0 0l-5 5m5-5H6",
                },
              ].map(({ title, text, iconBg, stroke, path }) => (
                <div key={title} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${iconBg}`}>
                    <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2"
                      strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true">
                      <path d={path}/>
                    </svg>
                  </div>
                  <h3 className="text-base font-semibold text-slate-900 mb-1.5">{title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── How it works ────────────────────────────────────────────── */}
        <section id="how-it-works" className="px-6 py-16 lg:py-24">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <p className="text-[10px] font-bold tracking-widest text-hmd-teal uppercase mb-3">Process</p>
              <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">How it works</h2>
            </div>
            <div className="grid sm:grid-cols-3 gap-10">
              {[
                {
                  n:     "1",
                  title: "Take the 60-second check",
                  text:  "Answer a few simple questions about your child.",
                },
                {
                  n:     "2",
                  title: "Get your personalised results",
                  text:  "See your child’s profile, main challenge, and recommended path.",
                },
                {
                  n:     "3",
                  title: "Take confident action",
                  text:  "Follow practical steps to build healthy, balanced habits.",
                },
              ].map(({ n, title, text }) => (
                <div key={n} className="flex flex-col items-center text-center">
                  <div className="w-14 h-14 rounded-full bg-hmd-blue text-white text-xl font-bold flex items-center justify-center mb-6 shadow-lg">
                    {n}
                  </div>
                  <h3 className="text-base font-semibold text-slate-900 mb-2">{title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
            <div className="mt-12 text-center">
              <button
                onClick={() => setAppState("assessing")}
                className="inline-flex items-center gap-2 bg-hmd-blue text-white font-semibold px-7 py-4 rounded-2xl shadow-lg hover:bg-hmd-blue/90 transition-all"
              >
                Check my child&rsquo;s phone readiness
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4" aria-hidden="true">
                  <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </section>

        {/* ── Guidance you can trust ──────────────────────────────────── */}
        <section id="research" className="px-6 py-16 lg:py-20 border-t border-gray-100">
          <div className="max-w-4xl mx-auto">
            <div className="rounded-3xl bg-gradient-to-br from-teal-50 via-white to-blue-50 border border-teal-100/50 p-8 lg:p-12 text-center shadow-sm">
              <p className="text-[10px] font-bold tracking-widest text-hmd-teal uppercase mb-4">Trust</p>
              <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-3 tracking-tight">
                Guidance you can trust.
              </h2>
              <p className="text-gray-600 leading-relaxed mb-8 max-w-sm mx-auto">
                Built on research. Designed for parents.
              </p>
              <div className="grid sm:grid-cols-3 gap-4 text-left">
                {[
                  {
                    title: "Research-informed",
                    text:  "Draws on independent child-safety and digital health research.",
                  },
                  {
                    title: "Parent-led",
                    text:  "You stay in control. TrustBridge helps you make the right decision.",
                  },
                  {
                    title: "Age-appropriate",
                    text:  "Guidance calibrated to your child’s age and readiness.",
                  },
                ].map(({ title, text }) => (
                  <div key={title} className="bg-white/80 rounded-2xl p-5 border border-white shadow-sm">
                    <div className="w-8 h-8 rounded-lg bg-hmd-teal/10 flex items-center justify-center mb-3">
                      <svg viewBox="0 0 24 24" fill="none" stroke="#00A99D" strokeWidth="2.5"
                        strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden="true">
                        <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                      </svg>
                    </div>
                    <p className="text-sm font-semibold text-slate-900 mb-1">{title}</p>
                    <p className="text-xs text-gray-500 leading-relaxed">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Resources / Footer ──────────────────────────────────────── */}
        <section id="resources" className="px-6 py-8 border-t border-gray-100 bg-gray-50/40">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs font-bold tracking-widest text-hmd-teal uppercase">HMD TrustBridge</span>
            <p className="text-xs text-gray-400 text-center">
              &copy; 2025 HMD &middot; Research-informed digital safety for parents
            </p>
            <button onClick={() => setAppState("assessing")}
              className="text-xs font-semibold text-hmd-blue hover:underline">
              Check my child&rsquo;s readiness &rarr;
            </button>
          </div>
        </section>

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
  const planHeader =
    isFirstSmartphone === false
      ? "Building Better Digital Habits"
      : isOlderTeen
      ? "Steps Towards Greater Independence"
      : "First Steps With Your Child";

  // Dashboard card data
  const familyProfile = getFamilyProfile(result, formSummary);
  const challengeLabel = CHALLENGE_LABEL[concernKey] ?? "Digital Safety";
  const productName = getProductName(result, formSummary);
  const whySentence = buildWhy(result, formSummary);
  const ctaUrl = getHmdPathCtaUrl(result, formSummary);
  const pathKey = derivePathKey(result, formSummary);

  // Evidence — computed once, used at four placement points
  const evidenceSet = selectEvidenceSet({
    concernKey,
    childAge,
    mainUseKeys: formSummary?.mainUseKeys ?? [],
    readinessLevel: result.readiness_level,
    pathKey,
    isFirstSmartphone: formSummary?.isFirstSmartphone ?? null,
  });

  return (
    <main className="min-h-screen pb-16" style={{background: 'radial-gradient(ellipse 120% 35% at 50% 0%, rgba(0, 169, 157, 0.07) 0%, transparent 55%), linear-gradient(180deg, #EEF5FF 0%, #FFFFFF 45%)'}}>

      {/* Sticky header */}
      <div className="px-5 pt-6 pb-4 border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <span className="text-xs font-bold tracking-widest text-hmd-teal uppercase">HMD TrustBridge</span>
          <span className="text-xs text-gray-500">Your Child&rsquo;s Phone Plan</span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-5 pt-6 space-y-5">

        {/* ── Hero result card ──────────────────────────────────────────────── */}
        <div className="rounded-3xl bg-gradient-to-br from-teal-50 via-white to-blue-50/40 border border-teal-100/50 p-7 space-y-5 shadow-sm">
          <div>
            <p className="text-[10px] font-bold tracking-widest text-hmd-teal uppercase mb-2">
              TrustBridge Result
            </p>
            <h2 className="text-2xl font-bold text-gray-900 leading-snug">
              Your child&rsquo;s safer phone path
            </h2>
            <p className="text-sm text-gray-600 mt-2 leading-relaxed">
              {HERO_SUBTITLE[pathKey] ?? HERO_SUBTITLE.guided}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="inline-block bg-hmd-teal text-white text-xs font-bold px-3 py-1.5 rounded-full">
              {familyProfile}
            </span>
            <span className="inline-block bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold px-3 py-1.5 rounded-full">
              {challengeLabel}
            </span>
            <span className="inline-block bg-hmd-blue/10 border border-hmd-blue/20 text-hmd-blue text-xs font-bold px-3 py-1.5 rounded-full">
              {PATH_APPROACH_LABEL[pathKey] ?? pathKey}
            </span>
          </div>
        </div>

        {/* ── Evidence chip ─────────────────────────────────────────────────── */}
        {evidenceSet.challengeEvidence && (
          <EvidenceChip item={evidenceSet.challengeEvidence} title="Why this matters" />
        )}

        {/* ── 3 quick steps ─────────────────────────────────────────────────── */}
        <div className="space-y-3">
          <p className="text-sm font-bold text-gray-900">Start with these 3 steps</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {(QUICK_STEPS[concernKey] ?? QUICK_STEPS.not_sure).map((step, i) => (
              <div key={i} className="flex gap-3 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-hmd-teal text-white text-xs font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                <p className="text-sm text-gray-700 leading-relaxed">{step}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── HMD path teaser ───────────────────────────────────────────────── */}
        <div className="flex items-center justify-between gap-4 px-5 py-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Suggested device path</p>
            <p className="text-sm font-semibold text-hmd-blue">{productName}</p>
          </div>
          <a
            href={ctaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 text-xs font-semibold text-hmd-teal hover:underline inline-flex items-center gap-1"
          >
            hmd.com
            <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3 h-3">
              <path d="M1 11L11 1M11 1H4.5M11 1V7.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>

        {/* ── CTA ───────────────────────────────────────────────────────────── */}
        <div className="space-y-2">
          <a
            href={ctaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="tb-btn-primary inline-block text-center"
          >
            Explore safer HMD options for your child
          </a>
          <p className="text-xs text-gray-500 text-center leading-relaxed">
            TrustBridge recommends an approach first — the device path comes after your child&rsquo;s needs are understood.
          </p>
        </div>

        {/* ── Divider ───────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-3 py-1">
          <div className="flex-1 h-px bg-gray-100" />
          <span className="text-xs text-gray-400">Learn more</span>
          <div className="flex-1 h-px bg-gray-100" />
        </div>

        {/* ── Accordion 1: Why this path? ───────────────────────────────────── */}
        <Accordion
          title="Why did TrustBridge suggest this?"
          hint="See the factors behind your child's profile and recommended approach."
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
          <div className="space-y-3 pt-2">
            {evidenceSet.comparisonEvidence && (
              <EvidenceChip item={evidenceSet.comparisonEvidence} />
            )}
            <SmartphoneComparisonContent
              result={result}
              summary={formSummary}
              productEvidence={evidenceSet.productEvidence}
            />
          </div>
        </Accordion>

        {/* ── Accordion 3: How this HMD path helps ─────────────────────────── */}
        <Accordion
          title="How this HMD path helps"
          hint={`Features and design choices in ${productName} matched to your child's situation.`}
        >
          <HmdPathHelpContent result={result} summary={formSummary} />
        </Accordion>

        {/* ── Accordion 4: Talking to your child ───────────────────────────── */}
        <Accordion
          title="How should I talk to my child about this?"
          hint="Conversation starters, focus areas, and practical steps for your child."
        >
          <div className="space-y-4 pt-2">

            {/* Lead with conversation starter */}
            {conversationStarter && (
              <div className="border-l-4 border-hmd-teal bg-teal-50/30 rounded-r-xl p-4 space-y-1">
                <p className="text-xs font-semibold text-hmd-teal uppercase tracking-widest">
                  {isOlderTeen ? "A question worth asking together" : "One conversation starter"}
                </p>
                <p className="text-sm text-gray-700 italic leading-relaxed">
                  &ldquo;{firstSentence(conversationStarter)}&rdquo;
                </p>
              </div>
            )}

            {/* Plan steps */}
            {planItems.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">{planHeader}</p>
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

            {/* Focus areas */}
            {habits.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Focus areas for your child</p>
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

          </div>
        </Accordion>

        {/* ── Accordion 4: Research ─────────────────────────────────────────── */}
        <Accordion
          title="Research behind this recommendation"
          hint="Sources used in your specific report — no unused research included."
        >
          <div className="space-y-3 pt-2">
            {evidenceSet.all.map((item) => (
              <div key={item.id} className="rounded-xl border border-gray-100 p-4 bg-gray-50">
                {item.sourceType !== "hmd" && (
                  <span className="inline-block text-[10px] font-semibold text-gray-400 uppercase tracking-widest bg-gray-100 rounded-full px-2 py-0.5 mb-2">
                    {item.sourceType === "public_health" ? "Public health" : item.sourceType === "government" ? "Government" : "NGO"}
                  </span>
                )}
                {item.sourceType === "hmd" && (
                  <span className="inline-block text-[10px] font-semibold text-hmd-blue/70 uppercase tracking-widest bg-hmd-blue/5 rounded-full px-2 py-0.5 mb-2">
                    HMD
                  </span>
                )}
                <p className="text-sm text-gray-700 leading-relaxed mb-2">{item.evidenceText}</p>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-hmd-teal hover:underline inline-flex items-center gap-1"
                >
                  {item.shortLabel}
                  <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-2.5 h-2.5">
                    <path d="M1 11L11 1M11 1H4.5M11 1V7.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
              </div>
            ))}
          </div>
        </Accordion>

        {/* ── Accordion 5: Family agreement & tools ────────────────────────── */}
        <Accordion
          title="Your child's phone agreement"
          hint="A simple agreement to set clear expectations with your child from day one."
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
