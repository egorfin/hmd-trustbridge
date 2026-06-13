"use client";

interface FuseRecommendationProps {
  text: string;
}

export default function FuseRecommendation({ text }: FuseRecommendationProps) {
  if (!text) return null;

  return (
    <div className="rounded-2xl border border-hmd-teal/30 bg-gradient-to-br from-teal-50 to-blue-50 p-6">
      <div className="flex items-start gap-3 mb-3">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-hmd-teal/10 flex items-center justify-center">
          <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="#00A99D" strokeWidth="2">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div>
          <p className="text-xs font-semibold text-hmd-teal uppercase tracking-widest">
            Why HMD Fuse fits this path
          </p>
        </div>
      </div>
      <p className="text-sm text-gray-700 leading-relaxed">{text}</p>
      <p className="text-xs text-gray-400 mt-3">
        HMD Fuse may be worth considering as part of your family&rsquo;s safer-start approach.
      </p>
    </div>
  );
}
