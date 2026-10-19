"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { getApiBaseUrl } from "@/lib/config";

const getSocketBaseUrl = () => {
  const api = getApiBaseUrl();
  try {
    const u = new URL(api);
    return `${u.protocol}//${u.host}`;
  } catch {
    return "http://localhost:5100";
  }
};

export function useChatSocket(activeConversationId?: string) {
  const [connected, setConnected] = useState(false);
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  const token = useMemo(
    () => (typeof window !== "undefined" ? localStorage.getItem("ip_token") : null),
    []
  );

  useEffect(() => {
    if (!token) return;
    const socket = io(getSocketBaseUrl(), {
      path: "/socket.io",
      auth: { token },
      transports: ["websocket", "polling"],
    });
    socketRef.current = socket;
    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));
    socket.on("chat:typing", (p: any) => {
      if (activeConversationId && String(p?.conversationId) === String(activeConversationId)) {
        setTypingUser(p.isTyping ? String(p.userId) : null);
      }
    });
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token, activeConversationId]);

  useEffect(() => {
    if (activeConversationId && socketRef.current?.connected) {
      socketRef.current.emit("chat:join", { conversationId: activeConversationId });
    }
  }, [activeConversationId, connected]);

  return { socketRef, connected, typingUser };
}
