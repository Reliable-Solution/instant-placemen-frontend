"use client";

import ChatPanel from "@/components/chat/ChatPanel";

export default function CandidateMessagesPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-black text-slate-900">Messages</h1>
        <p className="text-xs text-slate-500">
          Chat directly with employers about jobs you applied to — realtime.
        </p>
      </div>
      <ChatPanel role="CANDIDATE" />
    </div>
  );
}
