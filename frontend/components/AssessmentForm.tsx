"use client";

import { useState, useEffect, useRef } from "react";
import ProgressBar from "./ProgressBar";
import { AssessmentResponse, FormData, FormSummary } from "@/lib/types";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

// ── Types ──────────────────────────────────────────────────────────────────────

type StepKey =
  | "age"
  | "first_smartphone"
  | "main_use"
  | "concern"
  | "confidence"
  | "ready_check"
  | "social_followup"
  | "games_followup"
  | "confidence_followup";

interface ExtraAnswers {
  gaming_intensity: string;
  social_concern_label: string;
  setup_plan_wanted: string;
}

// ── Constants ──────────────────────────────────────────────────────────────────

const MULTI_SELECT_STEPS: StepKey[] = ["main_use"];

const defaultForm: FormData = {
  child_age: 0,
  first_smartphone: null,
  main_use: [],
  existing_apps: "unknown",
  main_concerns: [],
  independence_level: "",
  parent_confidence_before: 0,
};

const defaultExtra: ExtraAnswers = {
  gaming_intensity: "",
  social_concern_label: "",
  setup_plan_wanted: "",
};

const AGE_GROUPS = [
  { label: "6 – 8", age: 7 },
  { label: "9 – 10", age: 10 },
  { label: "11 – 12", age: 11 },
  { label: "13 – 15", age: 14 },
  { label: "16 – 17", age: 16 },
];

const USE_OPTIONS = [
  { label: "Family contact", value: "family" },
  { label: "School", value: "school" },
  { label: "Friends and messaging", value: "friends" },
  { label: "Games", value: "games" },
  { label: "Social media", value: "social_media" },
];

const CONCERN_OPTIONS = [
  { label: "Strangers contacting them", value: "strangers" },
  { label: "Screen time", value: "screen_time" },
  { label: "Harmful content", value: "harmful_content" },
  { label: "Social pressure", value: "social_pressure" },
  { label: "Privacy", value: "privacy" },
  { label: "Cyberbullying", value: "cyberbullying" },
  { label: "Not sure yet", value: "not_sure" },
];

const CONFIDENCE_OPTIONS = [
  { value: 1, label: "Not confident" },
  { value: 3, label: "Somewhat confident" },
  { value: 5, label: "Confident" },
];

const SOCIAL_CONCERN_MAP: Record<string, string> = {
  "Privacy": "privacy",
  "Strangers": "strangers",
  "Pressure from others": "social_pressure",
  "Cyberbullying": "cyberbullying",
};

const LOADING_MESSAGES = [
  "Understanding your family's needs…",
  "Matching answers to child-safety guidance…",
  "Comparing safer-phone paths…",
  "Preparing your family plan…",
];

const USE_ICONS: Record<string, string> = {
  family:       "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
  school:       "M12 14l9-5-9-5-9 5 9 5zM12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z",
  friends:      "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",
  games:        "M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z",
  social_media: "M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9",
};

// ── Step logic ────────────────────────────────────────────────────────────────

function deriveIndependenceLevel(childAge: number): string {
  if (childAge <= 10) return "low";
  if (childAge <= 12) return "balanced";
  return "high";
}

function computeFollowUps(form: FormData): StepKey[] {
  const result: StepKey[] = [];
  if (form.main_use.includes("social_media")) result.push("social_followup");
  if (form.main_use.includes("games")) result.push("games_followup");
  if (form.parent_confidence_before === 1) result.push("confidence_followup");
  return result.slice(0, 2);
}

function computeSteps(form: FormData, wantsFollowUps: boolean): StepKey[] {
  const base: StepKey[] = ["age", "first_smartphone", "main_use", "concern", "confidence"];
  const followUps = computeFollowUps(form);
  if (followUps.length === 0) return base;
  if (wantsFollowUps) return [...base, "ready_check", ...followUps];
  return [...base, "ready_check"];
}

function isStepValid(key: StepKey, form: FormData, extra: ExtraAnswers): boolean {
  switch (key) {
    case "age":                return form.child_age > 0;
    case "first_smartphone":   return form.first_smartphone !== null;
    case "main_use":           return form.main_use.length > 0;
    case "concern":            return form.main_concerns.length > 0;
    case "confidence":         return form.parent_confidence_before > 0;
    case "ready_check":        return true;
    case "social_followup":    return extra.social_concern_label !== "";
    case "games_followup":     return extra.gaming_intensity !== "";
    case "confidence_followup":return extra.setup_plan_wanted !== "";
    default: return false;
  }
}

// ── Advisor content ───────────────────────────────────────────────────────────

const STEP_INTRO: Partial<Record<StepKey, string>> = {
  age:              "Let me start with your child's age — this shapes how much structure and guidance will feel right.",
  first_smartphone: "This changes the whole approach. A first smartphone and an upgrade are two different conversations.",
  main_use:         "Different uses bring different safety needs. Choose everything that applies.",
  concern:          "Most parents have one worry that sits above the others. What is it for your family?",
  confidence:       "This isn't a test — it helps build a plan that actually works for where your family is right now.",
  social_followup:  "One more thing about social media — it helps focus the strategy on the right risk.",
  games_followup:   "A quick check on gaming — this shapes how much screen-time structure to include in the plan.",
  confidence_followup: "One last thing that could make the first week go more smoothly.",
};

const STEP_QUESTION: Partial<Record<StepKey, string>> = {
  age:              "How old is your child?",
  first_smartphone: "Is this a first smartphone or an upgrade?",
  main_use:         "What will the phone mostly be used for?",
  concern:          "What's your biggest concern?",
  confidence:       "How confident do you feel about setting up their first smartphone?",
  social_followup:  "What concerns you most about social media?",
  games_followup:   "Does your child usually stop gaming without reminders?",
  confidence_followup: "Would a simple first-week setup plan be helpful?",
};

function getReaction(key: StepKey, form: FormData): string {
  switch (key) {
    case "age":
      return "This sets the context for everything else — age is a key part of the safer-start picture.";
    case "first_smartphone":
      return form.first_smartphone
        ? "A first smartphone is the right moment to set strong, agreed habits from day one."
        : "When there has been a phone before, the focus shifts to improving boundaries and trust.";
    case "main_use":
      return "This shapes the plan around actual use, not generic advice.";
    case "concern":
      return "Focusing on what matters most helps build a practical plan, not a generic checklist.";
    case "confidence":
      return "That helps personalise the recommendation, not just suggest a device.";
    case "social_followup":
      return "That helps the strategy address the specific risk rather than social media in general.";
    case "games_followup":
      return "That helps decide how much screen-time structure to build into the first week.";
    case "confidence_followup":
      return "The plan will include practical steps to make the first week feel manageable.";
    default:
      return "";
  }
}

function getAnswerLabel(key: StepKey, form: FormData, extra: ExtraAnswers): string {
  switch (key) {
    case "age": {
      const g = AGE_GROUPS.find((g) => g.age === form.child_age);
      return g ? `${g.label} years old` : "";
    }
    case "first_smartphone":
      return form.first_smartphone ? "Yes, their first smartphone" : "No, they have had one before";
    case "main_use":
      return form.main_use.map((v) => USE_OPTIONS.find((o) => o.value === v)?.label ?? v).join(", ");
    case "concern":
      return CONCERN_OPTIONS.find((o) => o.value === form.main_concerns[0])?.label ?? "";
    case "confidence":
      return CONFIDENCE_OPTIONS.find((o) => o.value === form.parent_confidence_before)?.label ?? "";
    case "social_followup": return extra.social_concern_label;
    case "games_followup":  return extra.gaming_intensity;
    case "confidence_followup": return extra.setup_plan_wanted;
    default: return "";
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getDynamicQuestion(key: StepKey, form: FormData): string {
  if (key === "confidence") {
    if (form.first_smartphone === false) {
      return "How confident do you feel about improving your family's current phone habits?";
    }
    return "How confident do you feel about setting up their first smartphone?";
  }
  return STEP_QUESTION[key] ?? "";
}

function getDynamicIntro(key: StepKey, form: FormData): string {
  if (key === "confidence" && form.first_smartphone === false) {
    return "This helps shape a plan that fits how your family currently uses smartphones.";
  }
  return STEP_INTRO[key] ?? "";
}

function toggleMulti(arr: string[], value: string): string[] {
  return arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
}

function addConcern(form: FormData, concern: string): FormData {
  if (form.main_concerns.includes(concern)) return form;
  return { ...form, main_concerns: [...form.main_concerns, concern] };
}

// ── Form summary (passed to parent for personalized results) ─────────────────

function buildFormSummary(f: FormData): FormSummary {
  const ageGroup = AGE_GROUPS.find((g) => g.age === f.child_age);
  const concernOption = CONCERN_OPTIONS.find((o) => o.value === f.main_concerns[0]);
  const confidenceOption = CONFIDENCE_OPTIONS.find((o) => o.value === f.parent_confidence_before);
  return {
    childAge: f.child_age,
    ageLabel: ageGroup ? `${ageGroup.label} years` : "",
    isFirstSmartphone: f.first_smartphone,
    mainConcernKey: f.main_concerns[0] ?? "",
    mainConcernLabel: concernOption?.label ?? "",
    confidenceLabel: confidenceOption?.label ?? "",
    mainUseKeys: f.main_use,
    mainUseLabels: f.main_use.map((v) => USE_OPTIONS.find((o) => o.value === v)?.label ?? v),
  };
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface AssessmentFormProps {
  onComplete: (response: AssessmentResponse, summary: FormSummary) => void;
  onBack: () => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function AssessmentForm({ onComplete, onBack }: AssessmentFormProps) {
  const [stepIdx, setStepIdx] = useState(0);
  const [form, setForm] = useState<FormData>(defaultForm);
  const [extra, setExtra] = useState<ExtraAnswers>(defaultExtra);
  const [wantsFollowUps, setWantsFollowUps] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [snapshotOpen, setSnapshotOpen] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const autoAdvanceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const steps = computeSteps(form, wantsFollowUps);
  const stepKey = steps[stepIdx] ?? "age";
  const valid = isStepValid(stepKey, form, extra);
  const isLast = stepIdx === steps.length - 1;
  const isMultiSelect = MULTI_SELECT_STEPS.includes(stepKey);
  const isCustom = stepKey === "ready_check";
  const progress = Math.round(((stepIdx + 1) / steps.length) * 100);

  useEffect(() => {
    const id = setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 80);
    return () => clearTimeout(id);
  }, [stepIdx]);

  useEffect(() => {
    if (!loading) return;
    const id = setInterval(() => setLoadingMsgIdx((i) => (i + 1) % LOADING_MESSAGES.length), 2500);
    return () => clearInterval(id);
  }, [loading]);

  // ── API call ───────────────────────────────────────────────────────────────

  async function handleSubmitWith(f: FormData) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/assessment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          child_age: f.child_age,
          first_smartphone: f.first_smartphone!,
          main_use: f.main_use,
          existing_apps: f.existing_apps,
          main_concerns: f.main_concerns,
          independence_level: deriveIndependenceLevel(f.child_age),
          parent_confidence_before: f.parent_confidence_before,
          country: "Finland",
          language: "en",
          debug: false,
        }),
      });
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data: AssessmentResponse = await res.json();
      onComplete(data, buildFormSummary(f));
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  function handleNext() {
    if (!valid) return;
    if (isLast) handleSubmitWith(form);
    else setStepIdx((i) => i + 1);
  }

  function singleSelect(newForm: FormData, newExtra: ExtraAnswers) {
    if (autoAdvanceRef.current) clearTimeout(autoAdvanceRef.current);
    const capturedIdx = stepIdx;
    const newSteps = computeSteps(newForm, wantsFollowUps);
    const newIsLast = capturedIdx === newSteps.length - 1;
    autoAdvanceRef.current = setTimeout(() => {
      if (newIsLast) handleSubmitWith(newForm);
      else setStepIdx((i) => (i === capturedIdx ? i + 1 : i));
    }, 500);
  }

  function handleBack() {
    if (autoAdvanceRef.current) clearTimeout(autoAdvanceRef.current);
    if (stepIdx === 0) onBack();
    else setStepIdx((i) => i - 1);
  }

  // ── Button styles ─────────────────────────────────────────────────────────

  const btn = (sel: boolean) => `tb-option${sel ? " tb-option-selected" : ""}`;

  // ── Step options ───────────────────────────────────────────────────────────

  function renderStep() {
    switch (stepKey) {

      case "age":
        return (
          <div className="space-y-2">
            {AGE_GROUPS.map(({ label, age }) => (
              <button key={label} className={btn(form.child_age === age)} onClick={() => {
                const nf = { ...form, child_age: age };
                setForm(nf);
                singleSelect(nf, extra);
              }}>
                {label}
              </button>
            ))}
          </div>
        );

      case "first_smartphone":
        return (
          <div className="space-y-2">
            {[
              { label: "First smartphone", value: true },
              { label: "They already have one", value: false },
            ].map((opt) => (
              <button key={String(opt.value)} className={btn(form.first_smartphone === opt.value)} onClick={() => {
                const nf = { ...form, first_smartphone: opt.value };
                setForm(nf);
                singleSelect(nf, extra);
              }}>
                {opt.label}
              </button>
            ))}
          </div>
        );

      case "main_use":
        return (
          <div className="space-y-2">
            {USE_OPTIONS.map((opt) => {
              const sel = form.main_use.includes(opt.value);
              return (
                <button key={opt.value} className={`${btn(sel)} flex items-center justify-between gap-3`} onClick={() => {
                  setForm({ ...form, main_use: toggleMulti(form.main_use, opt.value) });
                }}>
                  <span>{opt.label}</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
                    className={`w-5 h-5 flex-shrink-0 ${sel ? "text-hmd-blue" : "text-gray-300"}`}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={USE_ICONS[opt.value] ?? ""} />
                  </svg>
                </button>
              );
            })}
          </div>
        );

      case "concern":
        return (
          <div className="space-y-2">
            {CONCERN_OPTIONS.map((opt) => (
              <button key={opt.value} className={btn(form.main_concerns[0] === opt.value)} onClick={() => {
                const nf = { ...form, main_concerns: [opt.value] };
                setForm(nf);
                singleSelect(nf, extra);
              }}>
                {opt.label}
              </button>
            ))}
          </div>
        );

      case "confidence":
        return (
          <div className="space-y-2">
            {CONFIDENCE_OPTIONS.map((opt) => (
              <button key={opt.value} className={btn(form.parent_confidence_before === opt.value)} onClick={() => {
                const nf = { ...form, parent_confidence_before: opt.value };
                setForm(nf);
                singleSelect(nf, extra);
              }}>
                {opt.label}
              </button>
            ))}
          </div>
        );

      case "ready_check":
        return (
          <div className="space-y-5">
            <div className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-hmd-teal flex-shrink-0 mt-1.5" />
              <p className="text-sm text-gray-500 italic leading-relaxed">
                I already have enough information to prepare your family&rsquo;s safer-start plan.
              </p>
            </div>
            <p className="text-xl font-bold text-gray-900">Ready to see the result?</p>
            <button
              onClick={() => handleSubmitWith(form)}
              disabled={loading}
              className="tb-btn-primary"
            >
              Create my plan now
            </button>
            <button
              onClick={() => {
                setWantsFollowUps(true);
                setStepIdx((i) => i + 1);
              }}
              className="w-full text-center text-sm text-gray-400 hover:text-gray-600 py-2 transition-colors"
            >
              Answer up to two more questions
            </button>
          </div>
        );

      case "social_followup":
        return (
          <div className="space-y-2">
            {Object.keys(SOCIAL_CONCERN_MAP).map((label) => (
              <button key={label} className={btn(extra.social_concern_label === label)} onClick={() => {
                const ne = { ...extra, social_concern_label: label };
                const nf = addConcern(form, SOCIAL_CONCERN_MAP[label]);
                setExtra(ne);
                setForm(nf);
                singleSelect(nf, ne);
              }}>
                {label}
              </button>
            ))}
          </div>
        );

      case "games_followup":
        return (
          <div className="space-y-2">
            {[
              { label: "Yes, usually stops on their own", addConcern: null as string | null },
              { label: "Usually, with some reminders", addConcern: null as string | null },
              { label: "Not always — it can be hard to stop", addConcern: "screen_time" },
            ].map(({ label, addConcern: ac }) => (
              <button key={label} className={btn(extra.gaming_intensity === label)} onClick={() => {
                const ne = { ...extra, gaming_intensity: label };
                const nf = ac ? addConcern(form, ac) : form;
                setExtra(ne);
                setForm(nf);
                singleSelect(nf, ne);
              }}>
                {label}
              </button>
            ))}
          </div>
        );

      case "confidence_followup":
        return (
          <div className="space-y-2">
            {["Yes, that would help", "No, I'm fine"].map((opt) => (
              <button key={opt} className={btn(extra.setup_plan_wanted === opt)} onClick={() => {
                const ne = { ...extra, setup_plan_wanted: opt };
                setExtra(ne);
                singleSelect(form, ne);
              }}>
                {opt}
              </button>
            ))}
          </div>
        );

      default:
        return null;
    }
  }

  // ── Snapshot panel ─────────────────────────────────────────────────────────

  function renderSnapshot() {
    const items: { label: string; value: string }[] = [];
    if (form.child_age > 0) {
      const g = AGE_GROUPS.find((g) => g.age === form.child_age);
      if (g) items.push({ label: "Age", value: `${g.label} years` });
    }
    if (form.first_smartphone !== null)
      items.push({ label: "First phone", value: form.first_smartphone ? "Yes" : "Upgrade" });
    if (form.main_use.length > 0)
      items.push({ label: "Main use", value: form.main_use.map((v) => USE_OPTIONS.find((o) => o.value === v)?.label ?? v).join(", ") });
    if (form.main_concerns.length > 0)
      items.push({ label: "Concern", value: CONCERN_OPTIONS.find((o) => o.value === form.main_concerns[0])?.label ?? form.main_concerns[0] });

    return (
      <div className="border border-gray-100 rounded-2xl bg-gray-50 overflow-hidden">
        <button
          onClick={() => setSnapshotOpen((o) => !o)}
          className="w-full flex items-center justify-between px-4 py-3 text-left"
        >
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
            What we know so far
          </span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            className={`w-3 h-3 text-gray-400 transition-transform flex-shrink-0 ${snapshotOpen ? "rotate-180" : ""}`}>
            <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        {snapshotOpen && (
          <div className="px-4 pb-4 space-y-2">
            {items.map((item) => (
              <div key={item.label} className="flex items-start gap-3">
                <span className="text-xs text-gray-400 w-20 flex-shrink-0 pt-0.5">{item.label}</span>
                <span className="text-xs text-gray-700 font-medium leading-relaxed">{item.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen flex flex-col bg-white">

      {/* Advisor Thinking overlay */}
      {loading && (
        <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-50 px-6">
          <div className="text-center max-w-xs w-full">

            <p className="text-[10px] font-bold tracking-widest text-hmd-teal uppercase mb-8">
              HMD TrustBridge
            </p>

            <div className="flex items-center justify-center gap-2 mb-8">
              {[0, 1, 2].map((i) => (
                <span key={i} className="w-2 h-2 rounded-full bg-hmd-teal animate-bounce"
                  style={{ animationDelay: `${i * 150}ms` }} />
              ))}
            </div>

            <p className="text-lg font-semibold text-gray-900 mb-1 leading-snug">
              {LOADING_MESSAGES[loadingMsgIdx]}
            </p>
            <p className="text-xs text-gray-400 mb-8">
              Building your family&rsquo;s digital safety plan.
            </p>

            <div className="flex items-center justify-center gap-2 mb-8">
              {LOADING_MESSAGES.map((_, i) => (
                <span key={i} className={`rounded-full transition-all duration-300 ${
                  i < loadingMsgIdx
                    ? "w-2 h-2 bg-hmd-teal"
                    : i === loadingMsgIdx
                    ? "w-3 h-3 bg-hmd-teal"
                    : "w-2 h-2 bg-gray-200"
                }`} />
              ))}
            </div>

            {loadingMsgIdx > 0 && (
              <div className="space-y-1.5 text-left">
                {LOADING_MESSAGES.slice(0, loadingMsgIdx).map((msg, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-gray-400">
                    <span className="text-hmd-teal font-bold">✓</span>
                    <span>{msg}</span>
                  </div>
                ))}
              </div>
            )}

          </div>
        </div>
      )}

      {/* Sticky header */}
      <div className="px-5 pt-5 pb-4 border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-md mx-auto flex items-center gap-4">
          <button
            onClick={handleBack}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors flex-shrink-0"
            aria-label="Back"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <div className="flex-1">
            <ProgressBar progress={progress} />
          </div>
        </div>
      </div>

      {/* Question screen */}
      <div className="flex-1 px-5 pt-8 pb-24 max-w-md mx-auto w-full">
        <div ref={bottomRef} className="space-y-6">

          {isCustom ? (
            renderStep()
          ) : (
            <>
              {/* Advisor intro card */}
              {getDynamicIntro(stepKey, form) && (
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-hmd-teal/10 border border-hmd-teal/20 flex items-center justify-center">
                    <span className="text-[9px] font-bold text-hmd-teal">TB</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-hmd-teal uppercase tracking-widest mb-1.5">
                      TrustBridge advisor
                    </p>
                    <div className="bg-gray-50 rounded-2xl rounded-tl-sm border border-gray-100 px-4 py-3">
                      <p className="text-sm text-gray-600 leading-relaxed">{getDynamicIntro(stepKey, form)}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Privacy note on first step */}
              {stepKey === "age" && (
                <div className="flex items-center gap-2">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                    className="w-3.5 h-3.5 text-gray-400 flex-shrink-0">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <p className="text-xs text-gray-400">
                    No child name or account needed. Used only to build your family phone plan.
                  </p>
                </div>
              )}

              {/* Question */}
              <h2 className="text-2xl font-bold text-gray-900 leading-tight">
                {getDynamicQuestion(stepKey, form)}
              </h2>

              {/* Answer options */}
              {renderStep()}

              {/* Error */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-xl">
                  <p className="text-sm text-red-700">{error}</p>
                  <button onClick={() => handleSubmitWith(form)} className="mt-2 text-sm font-semibold text-red-700 underline">
                    Try again
                  </button>
                </div>
              )}

              {/* Continue / submit */}
              {(isMultiSelect || isLast) && (
                <button
                  onClick={handleNext}
                  disabled={!valid || loading}
                  className={`tb-btn-primary ${!valid || loading ? "opacity-40 cursor-not-allowed" : ""}`}
                >
                  {isLast
                    ? "Build my family plan"
                    : isMultiSelect && form.main_use.length > 0
                    ? `Continue with ${form.main_use.length} choice${form.main_use.length > 1 ? "s" : ""}`
                    : "Continue"}
                </button>
              )}
            </>
          )}

          {/* Your answers so far — collapsed, shown after first step */}
          {stepIdx > 0 && !isCustom && renderSnapshot()}

        </div>
      </div>
    </div>
  );
}
