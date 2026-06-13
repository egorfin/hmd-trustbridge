"use client";

import { RiskItem } from "@/lib/types";

interface RiskProfileProps {
  risks: RiskItem[];
}

const SEVERITY_CONFIG = {
  high: {
    label: "Needs attention",
    classes: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-400",
  },
  medium: {
    label: "Watch closely",
    classes: "bg-blue-50 text-blue-700 border-blue-200",
    dot: "bg-blue-400",
  },
  low: {
    label: "Lower concern",
    classes: "bg-green-50 text-green-700 border-green-200",
    dot: "bg-green-400",
  },
};

export default function RiskProfile({ risks }: RiskProfileProps) {
  if (!risks || risks.length === 0) return null;

  return (
    <div className="tb-card">
      <h2 className="text-base font-semibold text-gray-800 mb-4">Key risk areas</h2>
      <div className="space-y-3">
        {risks.map((risk) => {
          const config = SEVERITY_CONFIG[risk.severity] ?? SEVERITY_CONFIG.medium;
          return (
            <div key={risk.key} className="flex gap-3 items-start">
              <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${config.dot}`} />
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="font-medium text-sm text-gray-800">{risk.label}</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${config.classes}`}>
                    {config.label}
                  </span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">{risk.reason}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
