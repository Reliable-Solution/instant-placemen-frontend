"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import EmojiPicker from "emoji-picker-react";
import {
  useGetConversationsQuery,
  useGetMessagesQuery,
  useSendMessageMutation,
  useSendFileMessageMutation,
  useMarkConversationReadMutation,
  ChatConversation,
  ChatMessage,
} from "@/services/api/chatApi";
import { useChatSocket } from "@/lib/useChatSocket";
import { useAppSelector } from "@/store/hooks";
import { getApiBaseUrl } from "@/lib/config";
import {
  MessageCircle,
  Send,
  Lock,
  Loader2,
  Briefcase,
  Smile,
  Paperclip,
  FileText,
  Download,
  Check,
  CheckCheck,
  X,
} from "lucide-react";

/* ─── helpers ─── */

const otherPartyName = (c: ChatConversation, myRole?: string) => {
  if (myRole === "EMPLOYER") {
    const cand = c.candidateId;
    return typeof cand === "object" ? cand?.name || "Candidate" : "Candidate";
  }
  const emp = c.employerId;
  if (typeof emp === "object") return emp?.companyName || emp?.name || "Employer";
  return "Employer";
};

const jobTitle = (c: ChatConversation) => {
  const j = c.jobId;
  if (typeof j === "object") return j?.title || "Job";
  return "Job";
};

const avatarInitial = (name: string) => (name?.trim()?.charAt(0) || "?").toUpperCase();

const fileAbsoluteUrl = (fileUrl?: string) => {
  if (!fileUrl) return "";
  if (/^https?:\/\//i.test(fileUrl)) return fileUrl;
  try {
    const u = new URL(getApiBaseUrl());
    return `${u.protocol}//${u.host}${fileUrl}`;
  } catch {
    return fileUrl;
  }
};

const formatSize = (bytes?: number) => {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatTime = (iso?: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const dayKey = (iso?: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
};

const dayLabel = (iso?: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (dayKey(iso) === dayKey(today.toISOString())) return "Today";
  if (dayKey(iso) === dayKey(yesterday.toISOString())) return "Yesterday";
  return d.toLocaleDateString([], { day: "numeric", month: "short", year: "numeric" });
};

// WhatsApp-style ticks: single grey = sent, double grey = delivered, double blue = read
function Ticks({ message, light }: { message: ChatMessage; light?: boolean }) {
  const status = message.status || (message.isRead ? "READ" : "SENT");
  if (status === "READ") return <CheckCheck className="w-4 h-4 text-sky-500 shrink-0" />;
  if (status === "DELIVERED")
    return <CheckCheck className={`w-4 h-4 shrink-0 ${light ? "text-green-700" : "text-slate-400"}`} />;
  return <Check className={`w-4 h-4 shrink-0 ${light ? "text-green-700" : "text-slate-400"}`} />;
}

/* ─── conversation list ─── */

export default function ChatPanel({ role }: { role: "EMPLOYER" | "CANDIDATE" }) {
  const { user } = useAppSelector((s) => s.auth);
  const myRole = (user as any)?.role || role;
  const myId = String((user as any)?._id || (user as any)?.id || "");
  const {
    data: conversations = [],
    isLoading,
    error,
    refetch,
  } = useGetConversationsQuery(undefined, { pollingInterval: 15000 });
  const [activeId, setActiveId] = useState<string | null>(null);
  const active: ChatConversation | null =
    useMemo(
      () => conversations.find((c) => String(c._id) === String(activeId)) || null,
      [conversations, activeId]
    ) || null;

  useEffect(() => {
    if (!activeId && conversations.length > 0) setActiveId(String(conversations[0]._id));
  }, [conversations, activeId]);

  const requiresPlan =
    (error as any)?.status === 402 || (error as any)?.data?.requiresPlan === true;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:h-[75vh] md:min-h-[520px]">
      {/* ── Left: conversation list ── */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col shadow-sm max-h-[38vh] md:max-h-none md:min-h-0">
        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/60">
          <p className="font-black text-sm text-slate-900 flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-green-600" />
            <span>{role === "EMPLOYER" ? "Applicant Chats" : "Employer Chats"}</span>
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {conversations.length} conversation{conversations.length === 1 ? "" : "s"}
          </p>
        </div>
        <div className="flex-1 overflow-y-auto">
          {isLoading && (
            <p className="p-4 text-xs text-slate-500 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading chats…
            </p>
          )}
          {requiresPlan && (
            <div className="p-5 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mx-auto">
                <Lock className="w-6 h-6 text-amber-600" />
              </div>
              <p className="text-xs font-bold text-slate-800">
                Chat is locked. An active hiring plan is required to view and reply to candidates.
              </p>
              <Link
                href="/employer/plans"
                className="inline-block px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-full transition-colors"
              >
                View Plans
              </Link>
            </div>
          )}
          {!isLoading && !requiresPlan && conversations.length === 0 && (
            <div className="p-8 text-center">
              <MessageCircle className="w-10 h-10 text-slate-200 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-600">No chats yet</p>
              <p className="text-[11px] text-slate-500 mt-1">
                {role === "EMPLOYER"
                  ? "Chats appear here after candidates apply to your jobs."
                  : "Apply to a job and start a chat from My Applications."}
              </p>
            </div>
          )}
          {conversations.map((c) => {
            const name = otherPartyName(c, myRole);
            const isActive = String(c._id) === String(activeId);
            const mine = String(c.lastSenderId || "") === myId && myId !== "";
            return (
              <button
                key={String(c._id)}
                onClick={() => setActiveId(String(c._id))}
                className={`w-full text-left px-3 py-3 border-b border-slate-50 hover:bg-slate-50 transition-colors flex items-center gap-3 ${
                  isActive ? "bg-green-50/70 hover:bg-green-50" : ""
                }`}
              >
                <span className="w-11 h-11 rounded-full bg-gradient-to-br from-green-500 to-emerald-700 text-white font-black text-sm flex items-center justify-center shrink-0">
                  {avatarInitial(name)}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="flex items-center justify-between gap-2">
                    <span className="text-[13px] font-bold text-slate-900 truncate">{name}</span>
                    <span className="text-[10px] text-slate-400 shrink-0">
                      {formatTime(c.lastMessageAt)}
                    </span>
                  </span>
                  <span className="text-[10px] text-slate-500 flex items-center gap-1 truncate">
                    <Briefcase className="w-3 h-3 shrink-0" />
                    <span className="truncate">{jobTitle(c)}</span>
                  </span>
                  <span className="flex items-center justify-between gap-2 mt-0.5">
                    <span className="text-[11px] text-slate-500 truncate flex items-center gap-1 min-w-0">
                      {mine && (
                        <Ticks
                          message={{ status: c.lastMessageStatus || "SENT" } as ChatMessage}
                        />
                      )}
                      <span className="truncate">{c.lastMessage || "Say hello 👋"}</span>
                    </span>
                    {(c.unread || 0) > 0 && (
                      <span className="text-[10px] font-bold bg-green-600 text-white rounded-full min-w-5 h-5 px-1.5 flex items-center justify-center shrink-0">
                        {c.unread}
                      </span>
                    )}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Right: thread ── */}
      <div className="md:col-span-2 md:min-h-0 md:h-full md:overflow-hidden">
        {active ? (
          <ThreadView key={String(active._id)} conversation={active} myId={myId} myRole={myRole} />
        ) : (
          <div className="h-full bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center justify-center p-8 text-center">
            <div>
              <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-3">
                <MessageCircle className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-sm font-bold text-slate-700">Select a conversation</p>
              <p className="text-xs text-slate-500">Messages appear here in realtime.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── thread ─── */

function ThreadView({
  conversation,
  myId,
  myRole,
}: {
  conversation: ChatConversation;
  myId: string;
  myRole: string;
}) {
  const convId = String(conversation._id);
  const { data: serverMessages = [], refetch } = useGetMessagesQuery(
    { id: convId },
    { pollingInterval: 8000 }
  );
  const [sendMessage, { isLoading: sending }] = useSendMessageMutation();
  const [sendFile, { isLoading: uploading }] = useSendFileMessageMutation();
  const [markRead] = useMarkConversationReadMutation();
  const [liveMessages, setLiveMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [sendError, setSendError] = useState<string | null>(null);
  const [showEmoji, setShowEmoji] = useState(false);
  const [staged, setStaged] = useState<{ file: File; preview: string } | null>(null);
  const [caption, setCaption] = useState("");
  const { socketRef, connected, typingUser } = useChatSocket(convId);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const name = otherPartyName(conversation, myRole);

  const allMessages = useMemo(() => {
    const map = new Map();
    [...serverMessages, ...liveMessages].forEach((m: any) => map.set(String(m._id), m));
    return Array.from(map.values()).sort(
      (a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }, [serverMessages, liveMessages]);

  useEffect(() => {
    markRead(convId).catch(() => {});
  }, [convId, markRead]);

  // Attach socket listeners only once the socket is connected (fixes dead ticks/live msgs)
  useEffect(() => {
    const socket = socketRef.current;
    if (!connected || !socket) return;
    const onMsg = (p: any) => {
      if (String(p?.conversationId) === convId && p?.message) {
        setLiveMessages((prev) =>
          prev.some((m) => String(m._id) === String(p.message._id))
            ? prev
            : [...prev, p.message]
        );
        markRead(convId).catch(() => {});
        if (String(p.message.senderId) !== myId) {
          socket.emit("chat:delivered", { conversationId: convId });
        }
      }
    };
    const onStatus = (p: any) => {
      if (String(p?.conversationId) !== convId) return;
      // Instant tick patch for optimistic messages…
      if (Array.isArray(p?.messageIds) && p.messageIds.length > 0) {
        const ids = new Set(p.messageIds.map(String));
        setLiveMessages((prev) =>
          prev.map((m) =>
            ids.has(String(m._id)) ? { ...m, status: p.status, isRead: p.status === "READ" } : m
          )
        );
      }
      // …plus server refetch for the rest
      refetch();
    };
    socket.on("chat:message", onMsg);
    socket.on("chat:status", onStatus);
    return () => {
      socket.off("chat:message", onMsg);
      socket.off("chat:status", onStatus);
    };
  }, [socketRef, connected, convId, markRead, refetch, myId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [allMessages.length, typingUser]);

  const send = async () => {
    const clean = text.trim();
    if (!clean || sending) return;
    setSendError(null);
    setShowEmoji(false);
    const socket = socketRef.current;
    if (socket?.connected) {
      const ack: any = await new Promise((resolve) =>
        socket.emit("chat:send", { conversationId: convId, text: clean }, resolve)
      );
      if (ack?.success) {
        setText("");
        if (ack.message) {
          setLiveMessages((prev) =>
            prev.some((m) => String(m._id) === String(ack.message._id))
              ? prev
              : [...prev, ack.message]
          );
        }
        return;
      }
      if (ack?.requiresPlan) {
        setSendError("Active hiring plan required to send messages.");
        return;
      }
    }
    try {
      const msg: any = await sendMessage({ id: convId, text: clean }).unwrap();
      setText("");
      if (msg?._id) setLiveMessages((prev) => [...prev, msg]);
      refetch();
    } catch (e: any) {
      setSendError(
        e?.data?.requiresPlan
          ? "Active hiring plan required to send messages."
          : e?.data?.message || "Failed to send. Try again."
      );
    }
  };

  const onPickFile = (file: File) => {
    setSendError(null);
    if (file.type.startsWith("image/")) {
      setStaged({ file, preview: URL.createObjectURL(file) });
    } else {
      setStaged({ file, preview: "" });
    }
    setCaption("");
  };

  const sendStaged = async () => {
    if (!staged || uploading) return;
    setSendError(null);
    try {
      const msg: any = await sendFile({
        id: convId,
        file: staged.file,
        text: caption.trim() || undefined,
      }).unwrap();
      if (msg?._id) setLiveMessages((prev) => [...prev, msg]);
      if (staged.preview) URL.revokeObjectURL(staged.preview);
      setStaged(null);
      setCaption("");
      refetch();
    } catch (e: any) {
      setSendError(
        e?.data?.requiresPlan
          ? "Active hiring plan required to send files."
          : e?.data?.message || "Failed to send file (images, PDF, Word up to 10MB)."
      );
    }
  };

  let lastDay = "";

  return (
    <div className="h-[72vh] md:h-full md:min-h-0 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden min-h-0">
      {/* header */}
      <div className="px-4 py-2.5 bg-slate-50/80 border-b border-slate-100 flex items-center gap-3">
        <span className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-700 text-white font-black text-sm flex items-center justify-center shrink-0">
          {avatarInitial(name)}
        </span>
        <span className="min-w-0">
          <span className="block text-[13px] font-bold text-slate-900 truncate">{name}</span>
          <span className="block text-[11px] text-slate-500 truncate">
            {typingUser ? (
              <span className="text-green-600 font-bold">typing…</span>
            ) : (
              <span className="flex items-center gap-1">
                <Briefcase className="w-3 h-3" /> {jobTitle(conversation)}
              </span>
            )}
          </span>
        </span>
        <span
          className={`ml-auto w-2.5 h-2.5 rounded-full shrink-0 ${connected ? "bg-green-500" : "bg-slate-300"}`}
          title={connected ? "Live" : "Connecting…"}
        />
      </div>

      {/* messages */}
      <div
        className="flex-1 min-h-0 overflow-y-auto px-4 py-3 space-y-1"
        style={{
          backgroundColor: "#EFEAE2",
          backgroundImage: "radial-gradient(#d5cfc3 1px, transparent 1px)",
          backgroundSize: "18px 18px",
        }}
      >
        {allMessages.map((m: any) => {
          const mine = String(m.senderId) === myId;
          const day = dayKey(m.createdAt);
          const showDay = day !== lastDay;
          lastDay = day;
          return (
            <React.Fragment key={String(m._id)}>
              {showDay && (
                <div className="flex justify-center py-2">
                  <span className="text-[10px] font-bold text-slate-600 bg-white/90 border border-slate-200 px-3 py-1 rounded-lg shadow-xs">
                    {dayLabel(m.createdAt)}
                  </span>
                </div>
              )}
              <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[78%] px-2.5 pt-1.5 pb-1 rounded-xl text-[13px] leading-relaxed shadow-xs ${
                    mine
                      ? "bg-[#D9FDD3] text-slate-900 rounded-br-none"
                      : "bg-white text-slate-900 rounded-bl-none"
                  }`}
                >
                  {m.messageType === "image" && m.fileUrl && (
                    <a href={fileAbsoluteUrl(m.fileUrl)} target="_blank" rel="noreferrer">
                      <img
                        src={fileAbsoluteUrl(m.fileUrl)}
                        alt={m.fileName || "image"}
                        className="rounded-lg max-w-[240px] max-h-[240px] object-cover mb-1"
                      />
                    </a>
                  )}
                  {["pdf", "doc"].includes(m.messageType) && m.fileUrl && (
                    <a
                      href={fileAbsoluteUrl(m.fileUrl)}
                      target="_blank"
                      rel="noreferrer"
                      className={`flex items-center gap-2 p-2 rounded-lg mb-1 min-w-[200px] ${
                        mine ? "bg-[#c8f5b9]" : "bg-slate-100"
                      }`}
                    >
                      <span className="w-9 h-9 rounded-full bg-red-500 text-white flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-bold truncate text-[12px]">{m.fileName}</span>
                        <span className="text-[10px] text-slate-500">
                          {m.messageType === "pdf" ? "PDF" : "Document"} • {formatSize(m.fileSize)}
                        </span>
                      </span>
                      <Download className="w-4 h-4 text-slate-500 shrink-0" />
                    </a>
                  )}
                  {m.text ? <p className="whitespace-pre-wrap break-words px-1">{m.text}</p> : null}
                  <p className="text-[10px] text-slate-500 mt-0.5 flex items-center justify-end gap-1 px-1">
                    <span>{formatTime(m.createdAt)}</span>
                    {mine && <Ticks message={m} />}
                  </p>
                </div>
              </div>
            </React.Fragment>
          );
        })}
        {typingUser && (
          <div className="flex justify-start">
            <div className="bg-white rounded-xl rounded-bl-none px-4 py-2.5 shadow-xs flex items-center gap-1">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        )}
        {allMessages.length === 0 && (
          <div className="text-center pt-10">
            <p className="text-xs font-bold text-slate-600 bg-white/80 inline-block px-4 py-2 rounded-xl border border-slate-200">
              No messages yet. Say hello 👋
            </p>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {sendError && (
        <div className="px-3 py-2 bg-amber-50 border-t border-amber-200 text-[11px] font-bold text-amber-800 flex items-center justify-between gap-2">
          <span>{sendError}</span>
          {myRole === "EMPLOYER" && (
            <Link href="/employer/plans" className="px-2 py-1 bg-green-600 text-white rounded-lg">
              Buy Plan
            </Link>
          )}
        </div>
      )}

      {/* pre-send preview */}
      {staged && (
        <div className="border-t border-slate-200 bg-slate-50 p-3 space-y-2">
          <div className="flex items-start gap-3">
            {staged.preview ? (
              <img src={staged.preview} alt="preview" className="w-20 h-20 rounded-xl object-cover border border-slate-200" />
            ) : (
              <span className="w-20 h-20 rounded-xl bg-red-50 border border-red-200 flex flex-col items-center justify-center gap-1 p-1">
                <FileText className="w-6 h-6 text-red-500" />
                <span className="text-[9px] font-bold text-slate-600 text-center break-all line-clamp-2">
                  {staged.file.name}
                </span>
              </span>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-800 truncate">{staged.file.name}</p>
              <p className="text-[11px] text-slate-500">{formatSize(staged.file.size)}</p>
              <input
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Add a caption… (optional)"
                maxLength={2000}
                className="mt-1.5 w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <button
              onClick={() => {
                if (staged.preview) URL.revokeObjectURL(staged.preview);
                setStaged(null);
                setCaption("");
              }}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
              aria-label="Remove file"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={sendStaged}
            disabled={uploading}
            className="w-full py-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-300 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            <span>{uploading ? "Sending…" : "Send"}</span>
          </button>
        </div>
      )}

      {/* input bar */}
      <div className="relative px-3 py-2.5 bg-slate-50/80 border-t border-slate-100">
        {showEmoji && (
          <div className="absolute bottom-full left-2 mb-2 z-20 shadow-xl rounded-2xl overflow-hidden">
            <EmojiPicker
              onEmojiClick={(d) => setText((t) => `${t}${d.emoji}`)}
              width={320}
              height={380}
              previewConfig={{ showPreview: false }}
            />
          </div>
        )}
        <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-full pl-1 pr-1.5 py-1 shadow-xs">
          <button
            onClick={() => setShowEmoji((s) => !s)}
            className={`p-2 rounded-full transition-colors ${showEmoji ? "text-amber-500 bg-amber-50" : "text-slate-500 hover:text-amber-500 hover:bg-amber-50"}`}
            title="Emoji"
            aria-label="Insert emoji"
          >
            <Smile className="w-5 h-5" />
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="p-2 text-slate-500 hover:text-green-700 hover:bg-green-50 rounded-full transition-colors disabled:opacity-50"
            title="Attach image, PDF or Word (max 10MB)"
            aria-label="Attach file"
          >
            {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Paperclip className="w-5 h-5" />}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,.pdf,.doc,.docx"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onPickFile(f);
              e.target.value = "";
            }}
          />
          <input
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              socketRef.current?.emit("chat:typing", { conversationId: convId, isTyping: true });
            }}
            onBlur={() =>
              socketRef.current?.emit("chat:typing", { conversationId: convId, isTyping: false })
            }
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Type a message…"
            maxLength={2000}
            className="flex-1 px-2 py-1.5 text-[13px] outline-none bg-transparent placeholder:text-slate-400"
          />
          <button
            onClick={send}
            disabled={!text.trim() || sending}
            className="p-2.5 bg-green-600 hover:bg-green-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-full transition-colors shadow-xs"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
