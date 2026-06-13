"use client";

import { EvidenceSource } from "@/lib/evidenceSources";

interface EvidenceChipProps {
  item: EvidenceSource;
  title?: string;
}

export default function EvidenceChip({ item, title }: EvidenceChipProps) {
  return (
    <div className="space-y-1">
      {title && (
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{title}</p>
      )}
      <div className="flex gap-2.5 p-3 bg-gray-50 rounded-xl border border-gray-100">
        <div className="w-0.5 self-stretch rounded-full bg-hmd-teal/40 flex-shrink-0" />
        <div className="min-w-0">
          <p className="text-xs text-gray-600 leading-relaxed">{item.evidenceText}</p>
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] font-semibold text-hmd-teal hover:underline mt-1 inline-flex items-center gap-0.5"
          >
            {item.shortLabel}
            <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-2.5 h-2.5 ml-0.5">
              <path d="M1 11L11 1M11 1H4.5M11 1V7.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}
