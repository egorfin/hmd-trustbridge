"use client";

import Link from "next/link";

export default function ReportPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-5 py-12 text-center">
      <div className="max-w-sm mx-auto">
        <span className="text-xs font-bold tracking-widest text-hmd-teal uppercase">HMD TrustBridge</span>
        <h1 className="text-2xl font-bold text-gray-900 mt-4 mb-3">Your report is on the previous page</h1>
        <p className="text-sm text-gray-500 mb-6">
          Results are shown directly after completing the assessment. Use your browser&apos;s print function to save a copy.
        </p>
        <Link href="/" className="tb-btn-primary inline-block text-center">
          Take the assessment
        </Link>
      </div>
    </main>
  );
}
