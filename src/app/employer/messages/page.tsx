"use client";

import ChatPanel from "@/components/chat/ChatPanel";

export default function EmployerMessagesPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-black text-slate-900">Messages</h1>
        <p className="text-xs text-slate-500">
          Chat with applicants in realtime. Requires an active hiring plan.
        </p>
      </div>
      <ChatPanel role="EMPLOYER" />
    </div>
  );
}
