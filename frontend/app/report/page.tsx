// Report page — renders the AI-generated Digital Readiness Snapshot
// Receives report data via sessionStorage or query params (TBD in implementation)
"use client";

import ReadinessScore from "@/components/ReadinessScore";
import RiskProfile from "@/components/RiskProfile";
import SafetyStrategy from "@/components/SafetyStrategy";
import FuseRecommendation from "@/components/FuseRecommendation";

export default function ReportPage() {
  // TODO: load report data from API response stored in sessionStorage
  return (
    <main className="flex flex-col items-center min-h-screen px-4 py-8 gap-6">
      <header className="text-center">
        <h1 className="text-2xl font-bold text-hmd-blue">Your Digital Readiness Report</h1>
      </header>
      <ReadinessScore />
      <RiskProfile />
      <SafetyStrategy />
      <FuseRecommendation />
    </main>
  );
}
