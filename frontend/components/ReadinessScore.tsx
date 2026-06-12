"use client";

type Level = "not_ready" | "moderate" | "ready_with_boundaries" | string;

interface ReadinessScoreProps {
  score: number;
  label: string;
  approach: string;
  level: Level;
}

function scoreColor(level: Level): string {
  if (level === "ready_with_boundaries") return "#00A99D";
  if (level === "moderate") return "#0057B8";
  return "#F59E0B"; // not_ready — warm amber, never scary red
}

function levelBadgeClass(level: Level): string {
  if (level === "ready_with_boundaries") return "bg-teal-50 text-teal-700 border-teal-200";
  if (level === "moderate") return "bg-blue-50 text-blue-700 border-blue-200";
  return "bg-amber-50 text-amber-700 border-amber-200";
}

export default function ReadinessScore({ score, label, approach, level }: ReadinessScoreProps) {
  const color = scoreColor(level);
  // r=15.9 → circumference ≈ 100, so dasharray can be [score, 100-score]
  const safe = Math.max(0, Math.min(100, score));

  return (
    <div className="tb-card text-center">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-5">
        Digital Readiness Snapshot
      </p>

      {/* Score ring */}
      <div className="relative w-32 h-32 mx-auto mb-5">
        <svg viewBox="0 0 36 36" className="w-32 h-32 -rotate-90">
          <circle cx="18" cy="18" r="15.9" fill="none" stroke="#E5E7EB" strokeWidth="2.5" />
          <circle
            cx="18" cy="18" r="15.9"
            fill="none"
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray={`${safe} ${100 - safe}`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold leading-none" style={{ color }}>{safe}</span>
          <span className="text-xs text-gray-400 mt-0.5">/ 100</span>
        </div>
      </div>

      {/* Label */}
      <span className={`inline-block text-sm font-semibold px-4 py-1.5 rounded-full border ${levelBadgeClass(level)}`}>
        {label}
      </span>

      {/* Approach */}
      <p className="text-sm text-gray-500 mt-3">
        Suggested approach: <span className="font-medium text-gray-700">{approach}</span>
      </p>
    </div>
  );
}
