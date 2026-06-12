"use client";
// Shows assessment step progress (e.g. step 2 of 5)
interface ProgressBarProps {
  step: number;
  total: number;
}

export default function ProgressBar({ step, total }: ProgressBarProps) {
  const pct = Math.round((step / total) * 100);
  return (
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div
        className="bg-hmd-teal h-2 rounded-full transition-all"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
