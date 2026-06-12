// Main entry — renders the step-by-step assessment form
import AssessmentForm from "@/components/AssessmentForm";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-start min-h-screen px-4 py-8">
      <header className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-hmd-blue">TrustBridge</h1>
        <p className="text-sm text-gray-500 mt-1">From Protection to Independence</p>
      </header>
      <AssessmentForm />
    </main>
  );
}
