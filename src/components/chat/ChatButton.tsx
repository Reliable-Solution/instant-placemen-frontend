"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle, Loader2 } from "lucide-react";
import { useGetOrCreateConversationMutation } from "@/services/api/chatApi";

export default function ChatButton({
  applicationId,
  label = "Chat",
  className = "",
}: {
  applicationId: string;
  label?: string;
  className?: string;
}) {
  const router = useRouter();
  const [openChat, { isLoading }] = useGetOrCreateConversationMutation();
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setError(null);
    if (!applicationId) {
      setError("No application found for chat.");
      return;
    }
    try {
      await openChat({ applicationId }).unwrap();
      router.push(
        typeof window !== "undefined" && window.location.pathname.startsWith("/employer")
          ? "/employer/messages"
          : "/candidate/messages"
      );
    } catch (e: any) {
      setError(
        e?.data?.requiresPlan
          ? "Active plan required to chat."
          : e?.data?.message || "Could not open chat."
      );
    }
  };

  return (
    <span className="inline-flex flex-col gap-1">
      <button
        onClick={handleClick}
        disabled={isLoading}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors ${
          isLoading
            ? "bg-slate-100 text-slate-400 border-slate-200"
            : "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
        } ${className}`}
      >
        {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <MessageCircle className="w-3.5 h-3.5" />}
        <span>{label}</span>
      </button>
      {error && <span className="text-[10px] font-bold text-rose-600">{error}</span>}
    </span>
  );
}
