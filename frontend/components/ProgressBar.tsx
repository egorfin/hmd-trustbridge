"use client";

interface ProgressBarProps {
  progress: number; // 0–100
}

export default function ProgressBar({ progress }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, progress));
  return (
    <div className="w-full bg-gray-100 rounded-full h-1">
      <div
        className="bg-hmd-teal h-1 rounded-full transition-all duration-500"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
