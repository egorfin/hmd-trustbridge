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
  "Identifying focus areas…",
  "Creating your family's digital plan…",
  "Preparing your personalised approach…",
];

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
  age:              "Let's start with your child's age. This helps calibrate how much structure and guidance will feel right.",
  first_smartphone: "Next — understanding whether this is a completely new step helps shape the safer-start approach.",
  main_use:         "Different uses create different safety needs. Select everything that applies.",
  concern:          "Most parents carry one worry above the others. What concerns you most right now?",
  confidence:       "Last required question. This isn't a test — it helps make the plan practical.",
  social_followup:  "One more thing about social media — it helps make the strategy more specific.",
  games_followup:   "A quick check on gaming — this shapes how much structure around screen time to include.",
  confidence_followup: "One last thing that could make the first week easier.",
};

const STEP_QUESTION: Partial<Record<StepKey, string>> = {
  age:              "How old is your child?",
  first_smartphone: "Would this be their first smartphone?",
  main_use:         "What would they mostly use it for?",
  concern:          "What's your biggest concern?",
  confidence:       "How confident do you feel about managing their first smartphone?",
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
    ageLabel: ageGroup ? `${ageGroup.label} years` : "",
    isFirstSmartphone: f.first_smartphone,
    mainConcernKey: f.main_concerns[0] ?? "",
    mainConcernLabel: concernOption?.label ?? "",
    confidenceLabel: confidenceOption?.label ?? "",
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
    const el = bottomRef.current;
    if (!el) return;
    const id = setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
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

  const btn = (sel: boolean) =>
    `w-full text-left px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all cursor-pointer ${
      sel
        ? "border-hmd-blue bg-hmd-blue text-white"
        : "border-gray-200 bg-white text-gray-700 hover:border-hmd-blue hover:text-hmd-blue"
    }`;

  const gridBtn = (sel: boolean) =>
    `py-3 px-3 rounded-xl border-2 text-sm font-medium text-left transition-all cursor-pointer ${
      sel
        ? "border-hmd-blue bg-hmd-blue text-white"
        : "border-gray-200 bg-white text-gray-700 hover:border-hmd-blue hover:text-hmd-blue"
    }`;

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
              { label: "Yes, this would be their first smartphone", value: true },
              { label: "No, they have had one before", value: false },
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
          <div className="grid grid-cols-2 gap-2">
            {USE_OPTIONS.map((opt) => (
              <button key={opt.value} className={gridBtn(form.main_use.includes(opt.value))} onClick={() => {
                setForm({ ...form, main_use: toggleMulti(form.main_use, opt.value) });
              }}>
                {opt.label}
              </button>
            ))}
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

  const completedSteps = steps.slice(0, stepIdx).filter((k) => k !== "ready_check");

  return (
    <div className="min-h-screen flex flex-col bg-white">

      {/* Loading overlay */}
      {loading && (
        <div className="fixed inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-50 px-6">
          <div className="text-center max-w-xs">
            <div className="w-14 h-14 border-4 border-hmd-blue border-t-transparent rounded-full animate-spin mx-auto mb-5" />
            <p className="text-gray-800 font-semibold text-lg">{LOADING_MESSAGES[loadingMsgIdx]}</p>
            <p className="text-gray-400 text-sm mt-3">
              Preparing your family&rsquo;s digital safety plan.
            </p>
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

      {/* Conversation thread */}
      <div className="px-5 py-8 max-w-md mx-auto w-full pb-20">
        <div className="space-y-8">

          {/* Completed Q&A pairs */}
          {completedSteps.map((key) => (
            <div key={key} className="space-y-2">
              <div className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-hmd-teal flex-shrink-0 mt-1.5" />
                <p className="text-sm text-gray-400">{STEP_QUESTION[key]}</p>
              </div>
              <div className="flex justify-end">
                <span className="inline-block bg-hmd-blue text-white text-sm font-medium px-4 py-2 rounded-2xl rounded-tr-sm max-w-[80%] text-right leading-snug">
                  {getAnswerLabel(key, form, extra)}
                </span>
              </div>
              <div className="pl-5">
                <p className="text-xs text-gray-400 italic leading-relaxed">{getReaction(key, form)}</p>
              </div>
            </div>
          ))}

          {/* Snapshot — after first answer */}
          {stepIdx > 0 && renderSnapshot()}

          {/* Active step */}
          <div ref={bottomRef} className="space-y-4">
            {isCustom ? (
              renderStep()
            ) : (
              <>
                {STEP_INTRO[stepKey] && (
                  <div className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-hmd-teal flex-shrink-0 mt-1.5" />
                    <p className="text-sm text-gray-500 italic leading-relaxed">{STEP_INTRO[stepKey]}</p>
                  </div>
                )}

                {stepKey === "age" && (
                  <div className="px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl">
                    <p className="text-xs text-gray-400 leading-relaxed">
                      No child name, email or account needed. Your answers are used only to create this readiness snapshot.
                    </p>
                  </div>
                )}

                <h2 className="text-xl font-bold text-gray-900">{STEP_QUESTION[stepKey]}</h2>

                {renderStep()}

                {error && (
                  <div className="p-4 bg-red-50 border border-red-100 rounded-xl">
                    <p className="text-sm text-red-700">{error}</p>
                    <button onClick={() => handleSubmitWith(form)} className="mt-2 text-sm font-semibold text-red-700 underline">
                      Try again
                    </button>
                  </div>
                )}

                {(isMultiSelect || isLast) && (
                  <button
                    onClick={handleNext}
                    disabled={!valid || loading}
                    className={`tb-btn-primary ${!valid || loading ? "opacity-40 cursor-not-allowed" : ""}`}
                  >
                    {isLast ? "Create my Digital Readiness Snapshot" : "Continue"}
                  </button>
                )}
              </>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
