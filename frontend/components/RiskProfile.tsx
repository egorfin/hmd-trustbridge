"use client";
// Shows the top digital risk areas identified for this child profile
interface Risk {
  name: string;
  level: "low" | "medium" | "high";
  description: string;
}

interface RiskProfileProps {
  risks?: Risk[];
}

export default function RiskProfile({ risks }: RiskProfileProps) {
  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-3">Key Digital Risks</h2>
      {risks ? (
        <ul className="space-y-2">
          {risks.map((r) => (
            <li key={r.name} className="flex items-start gap-2">
              <span className="text-xs font-medium mt-0.5 px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                {r.level}
              </span>
              <div>
                <p className="font-medium text-sm">{r.name}</p>
                <p className="text-xs text-gray-500">{r.description}</p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-400 text-sm">Risk profile — pending</p>
      )}
    </div>
  );
}
