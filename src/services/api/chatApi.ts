import { baseApi } from "./baseApi";

export interface ChatConversation {
  _id: string;
  jobId: any;
  applicationId: any;
  employerId: any;
  candidateId: any;
  lastMessage?: string;
  lastMessageAt?: string;
  lastSenderId?: string;
  lastMessageId?: string;
  lastMessageStatus?: "SENT" | "DELIVERED" | "READ";
  unread?: number;
  unreadEmployer?: number;
  unreadCandidate?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ChatMessage {
  _id: string;
  conversationId: string;
  senderId: string;
  senderRole: string;
  text: string;
  messageType?: "text" | "image" | "pdf" | "doc";
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  status?: "SENT" | "DELIVERED" | "READ";
  isRead?: boolean;
  createdAt: string;
}

export const chatApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getConversations: builder.query<ChatConversation[], void>({
      query: () => "/chat/conversations",
      transformResponse: (res: any) => res.conversations || res.data || [],
      providesTags: ["Chat"],
    }),
    getOrCreateConversation: builder.mutation<
      { conversation: ChatConversation },
      { applicationId: string }
    >({
      query: (body) => ({ url: "/chat/conversations", method: "POST", body }),
      transformResponse: (res: any) => ({
        conversation: res.conversation || res.data,
      }),
      invalidatesTags: ["Chat"],
    }),
    getMessages: builder.query<ChatMessage[], { id: string; limit?: number }>({
      query: ({ id, limit }) =>
        `/chat/conversations/${id}/messages${limit ? `?limit=${limit}` : ""}`,
      transformResponse: (res: any) => res.messages || res.data || [],
      providesTags: (_r, _e, arg) => [{ type: "Chat" as const, id: arg.id }],
    }),
    sendMessage: builder.mutation<ChatMessage, { id: string; text: string }>({
      query: ({ id, text }) => ({
        url: `/chat/conversations/${id}/messages`,
        method: "POST",
        body: { text },
      }),
      transformResponse: (res: any) => res.message || res.data,
      invalidatesTags: (_r, _e, arg) => ["Chat", { type: "Chat" as const, id: arg.id }],
    }),
    sendFileMessage: builder.mutation<ChatMessage, { id: string; file: File; text?: string }>({
      query: ({ id, file, text }) => {
        const fd = new FormData();
        fd.append("file", file);
        if (text) fd.append("text", text);
        return { url: `/chat/conversations/${id}/files`, method: "POST", body: fd };
      },
      transformResponse: (res: any) => res.message || res.data,
      invalidatesTags: (_r, _e, arg) => ["Chat", { type: "Chat" as const, id: arg.id }],
    }),
    markConversationRead: builder.mutation<void, string>({
      query: (id) => ({ url: `/chat/conversations/${id}/read`, method: "PATCH" }),
      invalidatesTags: ["Chat"],
    }),
    getUnreadCount: builder.query<number, void>({
      query: () => "/chat/unread-count",
      transformResponse: (res: any) => res.unread ?? 0,
      providesTags: ["Chat"],
    }),
  }),
});

export const {
  useGetConversationsQuery,
  useGetOrCreateConversationMutation,
  useGetMessagesQuery,
  useSendMessageMutation,
  useSendFileMessageMutation,
  useMarkConversationReadMutation,
  useGetUnreadCountQuery,
} = chatApi;
