"use client";
// Shows the earned HMD Fuse recommendation with explanation
// Only displayed when the assessment score and strategy support it
interface FuseRecommendationProps {
  recommended?: boolean;
  reason?: string;
}

export default function FuseRecommendation({ recommended, reason }: FuseRecommendationProps) {
  if (recommended === undefined) {
    return null;
  }

  return (
    <div className="w-full max-w-md bg-hmd-blue text-white rounded-2xl shadow p-6 text-center">
      <h2 className="text-lg font-semibold mb-2">
        {recommended ? "HMD Fuse — A Good Fit" : "Not Yet the Right Moment"}
      </h2>
      <p className="text-sm opacity-90">{reason}</p>
    </div>
  );
}
