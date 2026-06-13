"use client";

const CHILD_PROMISES = [
  "I will only save contacts my parents have approved.",
  "I will stop using my phone at the agreed bedtime and hand it over for charging.",
  "If a stranger messages me, I will tell a parent straight away and not reply.",
  "If I see something that upsets or scares me, I will come to a parent first.",
];

const PARENT_PROMISES = [
  "When you come to me with a problem, I will listen first and help, not punish.",
  "I will explain the reasons behind our phone rules, not just enforce them.",
  "I will check in regularly and update the rules as your independence grows.",
];

export default function PhoneAgreement() {
  return (
    <div className="tb-card space-y-5">
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">
          Family safety plan
        </p>
        <h2 className="text-base font-bold text-gray-900">My First Smartphone Agreement</h2>
        <p className="text-xs text-gray-400 mt-1">
          Review together before the phone arrives. Adjust the details to fit your family.
        </p>
      </div>

      {/* Child promises */}
      <div>
        <p className="text-xs font-semibold text-hmd-blue uppercase tracking-wider mb-2">
          Child&rsquo;s promises
        </p>
        <ul className="space-y-2">
          {CHILD_PROMISES.map((item, i) => (
            <li key={i} className="flex gap-3 items-start">
              <span className="flex-shrink-0 w-5 h-5 rounded-full border-2 border-hmd-blue mt-0.5" />
              <p className="text-sm text-gray-700 leading-relaxed">{item}</p>
            </li>
          ))}
        </ul>
      </div>

      {/* Parent promises */}
      <div>
        <p className="text-xs font-semibold text-hmd-teal uppercase tracking-wider mb-2">
          Parent&rsquo;s promises
        </p>
        <ul className="space-y-2">
          {PARENT_PROMISES.map((item, i) => (
            <li key={i} className="flex gap-3 items-start">
              <span className="flex-shrink-0 w-5 h-5 rounded-full border-2 border-hmd-teal mt-0.5" />
              <p className="text-sm text-gray-700 leading-relaxed">{item}</p>
            </li>
          ))}
        </ul>
      </div>

      {/* Signature area */}
      <div className="pt-3 border-t border-gray-100 grid grid-cols-2 gap-4">
        <div>
          <div className="h-8 border-b border-dashed border-gray-300 mb-1" />
          <p className="text-xs text-gray-400">Child signature</p>
        </div>
        <div>
          <div className="h-8 border-b border-dashed border-gray-300 mb-1" />
          <p className="text-xs text-gray-400">Parent signature</p>
        </div>
      </div>

      <p className="text-xs text-gray-400 text-center">
        Save this page to print the agreement — use the Save summary button below.
      </p>
    </div>
  );
}
