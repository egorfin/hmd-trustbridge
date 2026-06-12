"use client";
// Displays the deterministic readiness score (0–100) and label (e.g. "Emerging Readiness")
interface ReadinessScoreProps {
  score?: number;
  label?: string;
}

export default function ReadinessScore({ score, label }: ReadinessScoreProps) {
  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow p-6 text-center">
      <p className="text-sm text-gray-500 uppercase tracking-wide">Readiness Score</p>
      <p className="text-5xl font-bold text-hmd-blue mt-2">{score ?? "—"}</p>
      <p className="text-gray-600 mt-1">{label ?? "Pending assessment"}</p>
    </div>
  );
}
