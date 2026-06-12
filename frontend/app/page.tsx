"use client";

import { useState } from "react";
import AssessmentForm from "@/components/AssessmentForm";
import ReadinessScore from "@/components/ReadinessScore";
import RiskProfile from "@/components/RiskProfile";
import SafetyStrategy from "@/components/SafetyStrategy";
import FuseRecommendation from "@/components/FuseRecommendation";
import { AssessmentResponse } from "@/lib/types";

type AppState = "landing" | "assessing" | "results";

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

  // Landing
  if (appState === "landing") {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-5 py-12 text-center">
        <div className="max-w-sm mx-auto">
          {/* Logo / brand */}
          <div className="mb-6">
            <span className="text-xs font-bold tracking-widest text-hmd-teal uppercase">HMD TrustBridge</span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl font-bold text-gray-900 leading-tight mb-4">
            Is your child ready for a smartphone?
          </h1>
          <p className="text-gray-500 text-sm leading-relaxed mb-8">
            Answer 7 quick questions and get a personalised Digital Readiness Snapshot — including risk areas, a safety strategy, and whether HMD Fuse fits your family.
          </p>

          {/* CTA */}
          <button
            onClick={() => setAppState("assessing")}
            className="tb-btn-primary mb-4"
          >
            Start assessment
          </button>

          {/* Trust signal */}
          <p className="text-xs text-gray-400">
            Takes about 2 minutes &middot; No account needed &middot; Completely free
          </p>
        </div>
      </main>
    );
  }

  // Assessment form
  if (appState === "assessing") {
    return (
      <AssessmentForm
        onComplete={handleComplete}
        onBack={() => setAppState("landing")}
      />
    );
  }

  // Results
  if (!result) return null;
  const report = result.report;

  return (
    <main className="min-h-screen pb-16">
      {/* Results header */}
      <div className="px-5 pt-8 pb-4 border-b border-gray-100 bg-white/70 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <span className="text-xs font-bold tracking-widest text-hmd-teal uppercase">TrustBridge</span>
          <span className="text-xs text-gray-400">Your readiness snapshot</span>
        </div>
      </div>

      <div className="max-w-md mx-auto px-5 pt-6 space-y-4">
        {/* Card 1 — Score ring */}
        <ReadinessScore
          score={result.readiness_score}
          label={result.readiness_display_label}
          approach={result.recommended_parenting_approach}
          level={result.readiness_level}
        />

        {/* Card 2 — Report headline + summary */}
        {report && (
          <div className="tb-card space-y-3">
            <h2 className="text-lg font-bold text-gray-900 leading-snug">{report.headline}</h2>
            <p className="text-sm text-gray-600 leading-relaxed">{report.summary}</p>
            {report.why_this_score && (
              <div className="pt-2 border-t border-gray-100">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Why this score</p>
                <p className="text-sm text-gray-600 leading-relaxed">{report.why_this_score}</p>
              </div>
            )}
          </div>
        )}

        {/* Card 3 — Risk profile */}
        <RiskProfile risks={result.risk_profile} />

        {/* Card 4 — Safety strategy */}
        <SafetyStrategy items={report?.safety_strategy ?? result.strategy_focus} />

        {/* Card 5 — Conversation guide */}
        {report?.suggested_parent_child_conversation && (
          <div className="tb-card">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Start the conversation</p>
            <p className="text-sm text-gray-700 leading-relaxed">{report.suggested_parent_child_conversation}</p>
          </div>
        )}

        {/* Card 6 — Fuse recommendation */}
        {report?.why_hmd_fuse_fits && (
          <FuseRecommendation text={report.why_hmd_fuse_fits} />
        )}

        {/* Card 7 — Confidence shift */}
        {report?.confidence_shift_message && (
          <div className="tb-card bg-gray-50">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">For you as a parent</p>
            <p className="text-sm text-gray-600 italic leading-relaxed">&ldquo;{report.confidence_shift_message}&rdquo;</p>
          </div>
        )}

        {/* Bottom actions */}
        <div className="pt-4 space-y-3">
          <button
            onClick={() => window.print()}
            className="tb-btn-secondary"
          >
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
