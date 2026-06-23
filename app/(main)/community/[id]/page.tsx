// app/community/[id]/page.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAppSelector } from "@/redux/hooks";
import axios from "axios";
import { toast } from "sonner";
import { Hash } from "lucide-react";
import { socket } from "@/lib/socket";

import { ChatHeader } from "@/components/ChatHeader";
import { RoomInfoPanel } from "@/components/RoomInfoPanel";
import { MessageInput } from "@/components/MessageInput";
import { MessageBubble } from "@/components/MessageBubble";

// ─── Types ──────────────────────────────────────────────────────────────
type MemberRef = { _id?: string; username?: string };

interface Message {
  _id: string;
  communityId: string;
  senderId: MemberRef;
  text: string;
  type: "text" | "media" | "file";
  file?: string | null;
  fileMeta?: {
    url: string;
    mimeType: string;
    name: string;
    size: number;
  };
  isDelivered?: boolean;
  isRead?: boolean;
  createdAt: string;
  updatedAt: string;
  isMe?: boolean;
}

interface Community {
  _id: string;
  communityName: string;
  slug: string;
  totalMembers: number;
  onlineMembers: number;
  createdBy: MemberRef;
  joinedMembers: MemberRef[];
  admins: MemberRef[];
  pendingRequests: MemberRef[];
  file?: string;
  about?: string;
  topics: string[];
  createdAt: string;
  updatedAt: string;
}

function normalizeId(value: MemberRef | undefined | null): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value._id || "";
}

// ─── Main Page ──────────────────────────────────────────────────────────
export default function ChatPage() {
  const router = useRouter();
  const params = useParams();
  const communityId = String((params as { id?: string })?.id || "");

  const currentUser = useAppSelector((state: any) => state.User.userData);
  const userId = String(currentUser?._id || "");

  const [community, setCommunity] = useState<Community | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [joining, setJoining] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const [newMessage, setNewMessage] = useState("");
  const [showInfo, setShowInfo] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  // ─── Data fetching ──────────────────────────────────────────────────
  const fetchCommunity = async () => {
    const { data } = await axios.get(`/api/community/${communityId}`);
    setCommunity(data.community || null);
    return data.community || null;
  };

  const fetchMessages = async () => {
    const { data } = await axios.get(`/api/messages/${communityId}`);
    const messagesData: Message[] = data.messages || [];
    const withMe = messagesData.map((msg) => ({
      ...msg,
      isMe: normalizeId(msg.senderId) === userId,
    }));
    setMessages(withMe);
  };

  const loadAll = async () => {
    if (!communityId) return;
    setLoading(true);
    try {
      await Promise.all([fetchCommunity(), fetchMessages()]);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to load chat");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, [communityId, userId]);

  // ─── Socket ──────────────────────────────────────────────────────────
  useEffect(() => {
    socket.connect();

    socket.emit("join-community", communityId);

    socket.on("receive-message", (message) => {
      setMessages((prev) => [
        ...prev,
        {
          ...message,
          isMe: message.senderId?._id === userId,
        },
      ]);
    });

    socket.on("connect", () => {
      console.log("🟢 Connected:", socket.id);
    });

    socket.on("connect_error", (err) => {
      console.log("🔴 Connection error:", err.message);
    });

    return () => {
      socket.off("receive-message");
      socket.off("connect");
      socket.off("connect_error");
      socket.disconnect();
    };
  }, [communityId, userId]);

  // ─── Auto-scroll ────────────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages]);

  // ─── Handlers ──────────────────────────────────────────────────────
  const isJoined = community?.joinedMembers?.some((m) => normalizeId(m) === userId) ?? false;
  const isCreator = normalizeId(community?.createdBy) === userId;

  const handleJoin = async () => {
    if (!communityId) return;
    if (!userId) {
      toast.error("Please log in to join");
      return;
    }
    try {
      setJoining(true);
      const { data } = await axios.post(`/api/community/${communityId}/join`);
      toast.success(data.message || "Joined community");
      await loadAll();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to join community");
    } finally {
      setJoining(false);
    }
  };

  const handleLeave = async () => {
    if (!communityId) return;
    try {
      setLeaving(true);
      const { data } = await axios.post(`/api/community/${communityId}/leave`);
      toast.success(data.message || "Left community");
      await loadAll();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to leave community");
    } finally {
      setLeaving(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isJoined) {
      toast.error("Join the community first");
      return;
    }
    const text = newMessage.trim();
    const file = selectedFile;
    if (!text && !file) return;

    try {
      setSending(true);
      const formData = new FormData();
      formData.append("communityId", communityId);
      formData.append("text", text);
      if (file) formData.append("file", file);

      const { data } = await axios.post("/api/messages", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      socket.emit("send-message", data.message);
      setNewMessage("");
      setSelectedFile(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const makeAdmin = async (memberId: string) => {
    if (!communityId) return;
    try {
      const { data } = await axios.post(`/api/community/${communityId}/admin`, { userIdToMakeAdmin: memberId });
      toast.success(data.message || "Admin added");
      setCommunity((prev) => {
        if (!prev) return prev;
        const newAdmins = [...(prev.admins || []), { _id: memberId }];
        return { ...prev, admins: newAdmins };
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to make admin");
    }
  };

  const removeAdmin = async (memberId: string) => {
    if (!communityId) return;
    try {
      const { data } = await axios.post(`/api/community/${communityId}/admin`, { userIdToMakeAdmin: memberId });
      toast.success(data.message || "Admin removed");
      setCommunity((prev) => {
        if (!prev) return prev;
        const newAdmins = (prev.admins || []).filter((a) => normalizeId(a) !== memberId);
        return { ...prev, admins: newAdmins };
      });
    } catch (error: any) {
      console.error(error.response?.data?.message);
    }
  };

  const copyMessage = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Copy failed");
    }
  };

  // ─── Loading / Error ─────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F8FAFB]">
        <div className="text-gray-500">Loading chat...</div>
      </div>
    );
  }

  if (!community) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F8FAFB]">
        <div className="text-gray-500">Community not found</div>
      </div>
    );
  }

  // ─── Render ─────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen bg-[#F8FAFB] font-sans">
      <div className="flex flex-1 flex-col bg-white">
        <ChatHeader
          community={community}
          onBack={() => router.back()}
          onToggleInfo={() => setShowInfo((v) => !v)}
        />

        <div className="flex flex-1 overflow-hidden">
          <div className="flex flex-1 flex-col">
            {community.topics?.length > 0 && (
              <div className="flex items-center gap-2 overflow-x-auto border-b border-gray-100 px-4 py-2">
                <Hash className="h-3 w-3 text-gray-400" />
                {community.topics.map((t) => (
                  <span key={t} className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                    {t}
                  </span>
                ))}
              </div>
            )}

            <div className="flex-1 space-y-3 overflow-y-auto p-4" ref={chatRef}>
              {messages.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center text-sm text-gray-500">
                  No messages yet. Start the conversation.
                </div>
              ) : (
                messages.map((msg, i) => {
                  const prevSender = messages[i - 1]?.senderId;
                  const showSender = i === 0 || normalizeId(prevSender) !== normalizeId(msg.senderId);
                  return (
                    <MessageBubble key={msg._id} msg={msg} showSender={showSender} onCopy={copyMessage} />
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <MessageInput
              isJoined={isJoined}
              communityName={community.communityName}
              newMessage={newMessage}
              setNewMessage={setNewMessage}
              onSend={handleSendMessage}
              onJoin={handleJoin}
              onLeave={handleLeave}
              joining={joining}
              leaving={leaving}
              sending={sending}
              selectedFile={selectedFile}
              setSelectedFile={setSelectedFile}
            />
          </div>

          {showInfo && (
            <RoomInfoPanel
              community={community}
              userId={userId}
              onClose={() => setShowInfo(false)}
              onLeave={handleLeave}
              onMakeAdmin={makeAdmin}
              onRemoveAdmin={removeAdmin}
              leaving={leaving}
            />
          )}
        </div>
      </div>
    </div>
  );
}