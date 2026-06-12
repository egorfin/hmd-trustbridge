"use client";

import { useState } from "react";
import ProgressBar from "./ProgressBar";
import { AssessmentResponse, FormData } from "@/lib/types";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
const TOTAL_STEPS = 7;

const defaultForm: FormData = {
  child_age: 0,
  first_smartphone: null,
  main_use: [],
  existing_apps: "",
  main_concerns: [],
  independence_level: "",
  parent_confidence_before: 0,
};

const AGES = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17];

const USE_OPTIONS = [
  { label: "School", value: "school" },
  { label: "Family contact", value: "family" },
  { label: "Friends", value: "friends" },
  { label: "Games", value: "games" },
  { label: "Social media", value: "social_media" },
  { label: "Other", value: "other" },
];

const APPS_OPTIONS = [
  { label: "Not yet", sub: "No messaging or social apps", value: "none" },
  { label: "Messaging only", sub: "e.g. WhatsApp or similar", value: "messaging_only" },
  { label: "Social media already", sub: "e.g. TikTok, Instagram", value: "social_media" },
  { label: "Not sure", sub: "I'm not certain what they use", value: "unknown" },
];

const CONCERN_OPTIONS = [
  { label: "Harmful content", value: "harmful_content" },
  { label: "Contact from strangers", value: "strangers" },
  { label: "Too much screen time", value: "screen_time" },
  { label: "Social pressure", value: "social_pressure" },
  { label: "Privacy", value: "privacy" },
  { label: "Cyberbullying", value: "cyberbullying" },
];

const INDEPENDENCE_OPTIONS = [
  {
    label: "Low",
    sub: "Mostly protected and supervised",
    value: "low",
  },
  {
    label: "Balanced",
    sub: "Some freedom with clear family rules",
    value: "balanced",
  },
  {
    label: "High",
    sub: "More freedom from day one",
    value: "high",
  },
];

const CONFIDENCE_OPTIONS = [
  { value: 1, label: "Not confident" },
  { value: 2, label: "Slightly uncertain" },
  { value: 3, label: "Moderately confident" },
  { value: 4, label: "Fairly confident" },
  { value: 5, label: "Very confident" },
];

function isStepValid(step: number, form: FormData): boolean {
  switch (step) {
    case 1: return form.child_age >= 6;
    case 2: return form.first_smartphone !== null;
    case 3: return form.main_use.length > 0;
    case 4: return form.existing_apps !== "";
    case 5: return form.main_concerns.length > 0;
    case 6: return form.independence_level !== "";
    case 7: return form.parent_confidence_before > 0;
    default: return false;
  }
}

function toggleMulti(arr: string[], value: string): string[] {
  return arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
}

interface AssessmentFormProps {
  onComplete: (response: AssessmentResponse) => void;
  onBack: () => void;
}

export default function AssessmentForm({ onComplete, onBack }: AssessmentFormProps) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(defaultForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const valid = isStepValid(step, form);

  async function handleSubmit() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/assessment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          child_age: form.child_age,
          first_smartphone: form.first_smartphone!,
          main_use: form.main_use,
          existing_apps: form.existing_apps,
          main_concerns: form.main_concerns,
          independence_level: form.independence_level,
          parent_confidence_before: form.parent_confidence_before,
          country: "Finland",
          language: "en",
          debug: false,
        }),
      });
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data: AssessmentResponse = await res.json();
      onComplete(data);
    } catch {
      setError("Something went wrong while creating your snapshot. Please try again.");
      setLoading(false);
    }
  }

  function handleNext() {
    if (!valid) return;
    if (step < TOTAL_STEPS) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  }

  function handleBack() {
    if (step === 1) {
      onBack();
    } else {
      setStep(step - 1);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Loading overlay */}
      {loading && (
        <div className="fixed inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-50 px-6">
          <div className="text-center max-w-xs">
            <div className="w-14 h-14 border-4 border-hmd-blue border-t-transparent rounded-full animate-spin mx-auto mb-5" />
            <p className="text-gray-800 font-semibold text-lg">Building your digital readiness snapshot…</p>
            <p className="text-gray-400 text-sm mt-2">This usually takes 10–15 seconds</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="px-5 pt-6 pb-4 border-b border-gray-100 bg-white/70 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-md mx-auto flex items-center gap-3">
          <button
            onClick={handleBack}
            className="w-9 h-9 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors flex-shrink-0"
            aria-label="Back"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
              <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <div className="flex-1">
            <ProgressBar currentStep={step} totalSteps={TOTAL_STEPS} />
          </div>
        </div>
      </div>

      {/* Question area */}
      <div className="flex-1 px-5 py-8 max-w-md mx-auto w-full">
        {/* Step 1 — Child age */}
        {step === 1 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">How old is your child?</h2>
            <p className="text-sm text-gray-500 mb-6">We use this to calibrate the readiness assessment.</p>
            <div className="grid grid-cols-4 gap-2">
              {AGES.map((age) => (
                <button
                  key={age}
                  onClick={() => setForm({ ...form, child_age: age })}
                  className={`py-3 rounded-xl border-2 text-sm font-semibold transition-all
                    ${form.child_age === age
                      ? "border-hmd-blue bg-hmd-blue text-white"
                      : "border-gray-200 bg-white text-gray-700 hover:border-hmd-blue hover:text-hmd-blue"
                    }`}
                >
                  {age}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2 — First smartphone */}
        {step === 2 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Is this their first smartphone?</h2>
            <p className="text-sm text-gray-500 mb-6">Prior experience affects readiness in meaningful ways.</p>
            <div className="space-y-3">
              {[
                { label: "Yes, this would be their first smartphone", value: true },
                { label: "No, they already had one before", value: false },
              ].map((opt) => (
                <button
                  key={String(opt.value)}
                  onClick={() => setForm({ ...form, first_smartphone: opt.value })}
                  className={`tb-option ${form.first_smartphone === opt.value ? "tb-option-selected" : ""}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3 — Main use */}
        {step === 3 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">What would they mainly use it for?</h2>
            <p className="text-sm text-gray-500 mb-6">Select all that apply.</p>
            <div className="grid grid-cols-2 gap-2">
              {USE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setForm({ ...form, main_use: toggleMulti(form.main_use, opt.value) })}
                  className={`py-3 px-4 rounded-xl border-2 text-sm font-medium text-left transition-all
                    ${form.main_use.includes(opt.value)
                      ? "border-hmd-blue bg-hmd-blue text-white"
                      : "border-gray-200 bg-white text-gray-700 hover:border-hmd-blue hover:text-hmd-blue"
                    }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 4 — Existing apps */}
        {step === 4 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Do they already use messaging or social media apps?</h2>
            <p className="text-sm text-gray-500 mb-6">Current exposure helps assess risk areas.</p>
            <div className="space-y-2">
              {APPS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setForm({ ...form, existing_apps: opt.value })}
                  className={`w-full text-left px-4 py-3.5 rounded-xl border-2 transition-all
                    ${form.existing_apps === opt.value
                      ? "border-hmd-blue bg-hmd-blue text-white"
                      : "border-gray-200 bg-white hover:border-hmd-blue"
                    }`}
                >
                  <p className={`font-medium text-sm ${form.existing_apps === opt.value ? "text-white" : "text-gray-800"}`}>
                    {opt.label}
                  </p>
                  <p className={`text-xs mt-0.5 ${form.existing_apps === opt.value ? "text-blue-100" : "text-gray-400"}`}>
                    {opt.sub}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 5 — Main concerns */}
        {step === 5 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">What worries you most?</h2>
            <p className="text-sm text-gray-500 mb-6">Select all that apply. This shapes your safety strategy.</p>
            <div className="grid grid-cols-2 gap-2">
              {CONCERN_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setForm({ ...form, main_concerns: toggleMulti(form.main_concerns, opt.value) })}
                  className={`py-3 px-4 rounded-xl border-2 text-sm font-medium text-left transition-all
                    ${form.main_concerns.includes(opt.value)
                      ? "border-hmd-blue bg-hmd-blue text-white"
                      : "border-gray-200 bg-white text-gray-700 hover:border-hmd-blue hover:text-hmd-blue"
                    }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 6 — Independence level */}
        {step === 6 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">How much independence do you want to give at the start?</h2>
            <p className="text-sm text-gray-500 mb-6">This helps shape your family's first-phone approach.</p>
            <div className="space-y-2">
              {INDEPENDENCE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setForm({ ...form, independence_level: opt.value })}
                  className={`w-full text-left px-4 py-3.5 rounded-xl border-2 transition-all
                    ${form.independence_level === opt.value
                      ? "border-hmd-blue bg-hmd-blue text-white"
                      : "border-gray-200 bg-white hover:border-hmd-blue"
                    }`}
                >
                  <p className={`font-semibold text-sm ${form.independence_level === opt.value ? "text-white" : "text-gray-800"}`}>
                    {opt.label}
                  </p>
                  <p className={`text-xs mt-0.5 ${form.independence_level === opt.value ? "text-blue-100" : "text-gray-400"}`}>
                    {opt.sub}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 7 — Parent confidence */}
        {step === 7 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">How confident do you feel about this decision today?</h2>
            <p className="text-sm text-gray-500 mb-6">There are no right or wrong answers.</p>
            <div className="grid grid-cols-5 gap-2 mb-3">
              {CONFIDENCE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setForm({ ...form, parent_confidence_before: opt.value })}
                  className={`py-3 rounded-xl border-2 text-base font-bold transition-all
                    ${form.parent_confidence_before === opt.value
                      ? "border-hmd-blue bg-hmd-blue text-white"
                      : "border-gray-200 bg-white text-gray-700 hover:border-hmd-blue hover:text-hmd-blue"
                    }`}
                >
                  {opt.value}
                </button>
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-400 px-0.5">
              <span>Not confident</span>
              <span>Very confident</span>
            </div>
            {form.parent_confidence_before > 0 && (
              <p className="text-center text-sm text-gray-500 mt-4">
                {CONFIDENCE_OPTIONS.find((o) => o.value === form.parent_confidence_before)?.label}
              </p>
            )}
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-xl">
            <p className="text-sm text-red-700">{error}</p>
            <button onClick={handleSubmit} className="mt-3 text-sm font-semibold text-red-700 underline">
              Try again
            </button>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="px-5 pb-8 pt-2 max-w-md mx-auto w-full">
        <button
          onClick={handleNext}
          disabled={!valid || loading}
          className={`tb-btn-primary ${(!valid || loading) ? "opacity-40 cursor-not-allowed" : ""}`}
        >
          {step === TOTAL_STEPS ? "See my readiness snapshot" : "Next"}
        </button>
      </div>
    </div>
  );
}
