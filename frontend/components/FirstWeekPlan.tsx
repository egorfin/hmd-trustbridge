"use client";

const DAYS = [
  { day: "Day 1", title: "Trusted contacts" },
  { day: "Day 2", title: "Screen-time and bedtime" },
  { day: "Day 3", title: "Stranger messages" },
  { day: "Day 4", title: "Apps and notifications" },
  { day: "Day 5", title: "Harmful content response" },
  { day: "Day 6", title: "Small independence" },
  { day: "Day 7", title: "Review together" },
];

export default function FirstWeekPlan() {
  return (
    <div className="tb-card space-y-3">
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">
          Safer-start checklist
        </p>
        <h2 className="text-base font-bold text-gray-900">Your First Week Safety Plan</h2>
      </div>

      <div className="divide-y divide-gray-100">
        {DAYS.map(({ day, title }) => (
          <div key={day} className="flex items-center gap-3 py-2.5">
            <span className="flex-shrink-0 text-xs font-bold text-hmd-blue w-10">{day}</span>
            <span className="text-sm text-gray-700">{title}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
