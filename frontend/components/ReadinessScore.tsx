"use client";

type Level = "not_ready" | "moderate" | "ready_with_boundaries" | string;

interface ReadinessScoreProps {
  label: string;
  approach: string;
  level: Level;
}

const LEVEL_EXPLANATION: Record<string, string> = {
  not_ready:
    "Based on your answers, a safer-start approach may work well for your family. Starting with trusted contacts, clear family rules and guided setup helps build healthy digital habits.",
  moderate:
    "Based on your answers, a gradual introduction may suit your family well. Structured phone time with growing independence supports healthy digital habits.",
  ready_with_boundaries:
    "Based on your answers, guided independence may work well for your family. Agreed boundaries and regular check-ins support confident, safe digital habits.",
};

function labelBadgeClass(level: Level): string {
  if (level === "ready_with_boundaries") return "bg-teal-50 text-teal-700 border-teal-300";
  if (level === "moderate") return "bg-blue-50 text-blue-700 border-blue-300";
  return "bg-amber-50 text-amber-700 border-amber-300";
}

function accentClass(level: Level): string {
  if (level === "ready_with_boundaries") return "bg-teal-400";
  if (level === "moderate") return "bg-hmd-blue";
  return "bg-amber-400";
}

export default function ReadinessScore({ approach, level }: Omit<ReadinessScoreProps, "label"> & { label?: string }) {
  const explanation = LEVEL_EXPLANATION[level] ?? "";

  return (
    <div className="tb-card text-center">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-5">
        Suggested Family Approach
      </p>

      {/* Approach badge */}
      <span className={`inline-block text-base font-bold px-5 py-2.5 rounded-2xl border-2 ${labelBadgeClass(level)}`}>
        {approach}
      </span>

      {/* Accent divider */}
      <div className="flex items-center justify-center gap-1 my-5">
        <span className={`w-8 h-0.5 rounded-full ${accentClass(level)}`} />
        <span className={`w-2 h-2 rounded-full ${accentClass(level)}`} />
        <span className={`w-8 h-0.5 rounded-full ${accentClass(level)}`} />
      </div>

      {/* Short explanation */}
      {explanation && (
        <p className="text-sm text-gray-500 leading-relaxed mb-4">{explanation}</p>
      )}

      {/* Attribution */}
      <p className="text-xs text-gray-300 leading-relaxed">
        Based on your family&rsquo;s answers.
      </p>
    </div>
  );
}
