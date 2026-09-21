"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Legacy dashboard page — redirect to new candidate overview
export default function CandidateDashboardRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/candidate");
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center space-y-3">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-slate-600 text-sm font-medium">Redirecting to your dashboard...</p>
      </div>
    </div>
  );
}
