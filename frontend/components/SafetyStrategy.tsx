"use client";

interface SafetyStrategyProps {
  items: string[];
}

export default function SafetyStrategy({ items }: SafetyStrategyProps) {
  if (!items || items.length === 0) return null;

  return (
    <div className="tb-card">
      <h2 className="text-base font-semibold text-gray-800 mb-4">Your safer-start strategy</h2>
      <ol className="space-y-3">
        {items.map((item, i) => (
          <li key={i} className="flex gap-3 items-start">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-hmd-blue text-white text-xs font-bold flex items-center justify-center mt-0.5">
              {i + 1}
            </span>
            <p className="text-sm text-gray-700 leading-relaxed">{item}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
