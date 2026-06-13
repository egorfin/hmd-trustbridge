"use client";

const OPTIONS = [
  {
    label: "Regular smartphone",
    points: [
      "Full access to all apps from day one",
      "More parental setup responsibility",
      "Works well when child is ready and rules are clear",
      "Harder to limit without extra tools",
    ],
    highlight: false,
  },
  {
    label: "Basic phone",
    points: [
      "Simpler and lower risk at the start",
      "Limited for school tasks and family group chats",
      "Good short-term option for younger children",
      "May feel excluding for some social situations",
    ],
    highlight: false,
  },
  {
    label: "HMD Fuse",
    points: [
      "Designed to support a safer first-phone experience",
      "Helps reduce exposure to unrestricted content",
      "Balanced first-phone path with safety-first design",
      "Supports gradual independence as trust is established",
    ],
    highlight: true,
  },
];

export default function PhoneComparison() {
  return (
    <div className="tb-card space-y-4">
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">
          Making the right choice
        </p>
        <h2 className="text-base font-bold text-gray-900">Choosing the right first-phone path</h2>
      </div>

      <div className="space-y-3">
        {OPTIONS.map(({ label, points, highlight }) => (
          <div
            key={label}
            className={`rounded-xl border-2 p-4 transition-all ${
              highlight
                ? "border-hmd-teal bg-gradient-to-br from-teal-50 to-blue-50"
                : "border-gray-100 bg-gray-50"
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              {highlight && (
                <span className="text-xs font-bold text-hmd-teal uppercase tracking-wider">
                  Fits this plan
                </span>
              )}
              <p className={`text-sm font-bold ${highlight ? "text-gray-900" : "text-gray-700"}`}>
                {label}
              </p>
            </div>
            <ul className="space-y-1">
              {points.map((p, i) => (
                <li key={i} className="flex gap-2 items-start">
                  <span className={`mt-1.5 flex-shrink-0 w-1.5 h-1.5 rounded-full ${highlight ? "bg-hmd-teal" : "bg-gray-300"}`} />
                  <p className={`text-xs leading-relaxed ${highlight ? "text-gray-700" : "text-gray-500"}`}>{p}</p>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-400 text-center leading-relaxed">
        TrustBridge does not sell the phone first. It earns the right to recommend it.
      </p>
    </div>
  );
}
