"use client";
// Displays the LLM-generated personalized Digital Safety Strategy
interface SafetyStrategyProps {
  strategy?: string;
  tips?: string[];
}

export default function SafetyStrategy({ strategy, tips }: SafetyStrategyProps) {
  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-3">Your Safety Strategy</h2>
      {strategy ? (
        <>
          <p className="text-sm text-gray-700 mb-3">{strategy}</p>
          {tips && (
            <ul className="list-disc list-inside space-y-1">
              {tips.map((t, i) => (
                <li key={i} className="text-sm text-gray-600">{t}</li>
              ))}
            </ul>
          )}
        </>
      ) : (
        <p className="text-gray-400 text-sm">Safety strategy — pending</p>
      )}
    </div>
  );
}
