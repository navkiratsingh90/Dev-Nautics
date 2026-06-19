"use client";

import React, { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAppSelector } from "@/redux/hooks";
import axios from "axios";
import { toast } from "sonner";
import {
  Send,
  Paperclip,
  Phone,
  Video,
  Users,
  X,
  Check,
  CheckCheck,
  File,
  Smile,
  ChevronLeft,
  Hash,
  Bell,
  BellOff,
  LogOut,
  Copy,
  Download,
  Menu,
  Pin,
  MoreVertical,
} from "lucide-react";

type MemberRef = string | { _id?: string; username?: string };

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

const EMOJIS = ["😀", "😂", "🔥", "🎉", "👍", "❤️", "🚀", "✅"];

function normalizeId(value: MemberRef | undefined | null): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value._id || "";
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function fmtSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

function getSenderName(sender: MemberRef) {
  if (typeof sender === "string") return "User";
  return sender.username || "User";
}

function Avatar({ name, emoji }: { name: string; emoji?: string | null }) {
  if (emoji && typeof emoji === "string" && emoji.startsWith("http")) {
    return (
      <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-gray-100">
        <img src={emoji} alt={name} className="h-full w-full object-cover" />
      </div>
    );
  }
  if (emoji) {
    return (
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 text-xl">
        {emoji}
      </div>
    );
  }
  return (
    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-200 font-medium text-gray-700">
      {name.slice(0, 2).toUpperCase()}
    </div>
  );
}

function MessageBubble({ msg, showSender, onCopy }: { msg: Message; showSender: boolean; onCopy: (t: string) => void }) {
  const senderName = getSenderName(msg.senderId);

  return (
    <div className={`flex gap-2 ${msg.isMe ? "flex-row-reverse" : "flex-row"}`}>
      {!msg.isMe && <Avatar name={senderName} />}
      <div className={`max-w-[75%] ${msg.isMe ? "items-end" : "items-start"}`}>
        {!msg.isMe && showSender && (
          <div className="mb-1 ml-1 text-xs font-medium text-[#0EA472]">{senderName}</div>
        )}
        <div className="flex items-end gap-1">
          {msg.isMe && (
            <button onClick={() => onCopy(msg.text)} className="text-gray-400 hover:text-gray-600" type="button">
              <Copy className="h-3 w-3" />
            </button>
          )}
          <div
            className={`rounded-2xl px-3 py-2 ${
              msg.isMe
                ? "rounded-br-sm bg-[#0D1B2A] text-white"
                : "rounded-bl-sm border border-gray-200 bg-white text-gray-800"
            }`}
          >
            {msg.type === "file" && (msg.fileMeta?.url || msg.file) ? (
              <div className="flex items-center gap-2">
                <File className="h-4 w-4 text-gray-500" />
                <div>
                  <div className="text-sm font-medium">{msg.fileMeta?.name || "Attachment"}</div>
                  <div className={`text-xs ${msg.isMe ? "text-white/60" : "text-gray-400"}`}>
                    {msg.fileMeta?.size ? fmtSize(msg.fileMeta.size) : "File"}
                  </div>
                </div>
                <a
                  href={msg.fileMeta?.url || msg.file || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-gray-700"
                >
                  <Download className="h-4 w-4" />
                </a>
              </div>
            ) : (
              <p className="whitespace-pre-wrap break-words text-sm">{msg.text}</p>
            )}
            <div className={`mt-1 flex justify-end gap-1 text-[10px] ${msg.isMe ? "text-white/50" : "text-gray-400"}`}>
              <span>{fmtTime(msg.createdAt)}</span>
              {msg.isMe && (msg.isRead ? <CheckCheck className="h-3 w-3" /> : <Check className="h-3 w-3" />)}
            </div>
          </div>
          {!msg.isMe && (
            <button onClick={() => onCopy(msg.text)} className="text-gray-400 hover:text-gray-600" type="button">
              <Copy className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

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
  const [showEmoji, setShowEmoji] = useState(false);
  const [muted, setMuted] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };

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
    scrollToBottom();
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

  const isJoined = community?.joinedMembers?.some((m) => normalizeId(m) === userId) ?? false;
  const activeMembers = community?.joinedMembers || [];
  const creatorId = normalizeId(community?.createdBy);
  const isCreator = creatorId === userId;

  // Admin management functions
  const makeAdmin = async (memberId: string) => {
    if (!communityId) return;
    try {
      const { data } = await axios.post(`/api/community/${communityId}/admin`, { userId: memberId });
      toast.success(data.message || "Admin added");
      // Update community admins locally
      setCommunity((prev) => {
        if (!prev) return prev;
        const newAdmins = [...(prev.admins || []), memberId];
        return { ...prev, admins: newAdmins };
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to make admin");
    }
  };

  const removeAdmin = async (memberId: string) => {
    if (!communityId) return;
    try {
      const { data } = await axios.delete(`/api/community/${communityId}/admin`, { data: { userId: memberId } });
      toast.success(data.message || "Admin removed");
      setCommunity((prev) => {
        if (!prev) return prev;
        const newAdmins = (prev.admins || []).filter((id) => normalizeId(id) !== memberId);
        return { ...prev, admins: newAdmins };
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to remove admin");
    }
  };

  // ... (handleJoin, handleLeave, handleSendMessage, handleFilePick, copyMessage remain the same)
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

      await axios.post("/api/messages", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setNewMessage("");
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setShowEmoji(false);
      await fetchMessages();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
  };

  const copyMessage = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Copy failed");
    }
  };

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

  return (
    <div className="flex h-screen bg-[#F8FAFB] font-sans">
      {/* Sidebar */}
      <div
        className={`${
          showSidebar ? "w-80" : "w-0"
        } flex flex-col overflow-hidden border-r border-gray-200 bg-white transition-all`}
      >
        {showSidebar && (
          <>
            <div className="border-b border-gray-200 p-4">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-bold text-gray-900">Members</h2>
                <button onClick={() => setShowSidebar(false)} className="text-gray-400 hover:text-gray-700">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-[#E8EDF2] p-3">
                <Avatar name={community.communityName} emoji={community.file} />
                <div className="min-w-0">
                  <div className="truncate font-medium text-gray-900">{community.communityName}</div>
                  <div className="text-xs text-gray-500">{community.totalMembers} members</div>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <div className="mb-3 text-xs font-semibold uppercase text-gray-500">Joined Members</div>
              <div className="space-y-2">
                {activeMembers.length === 0 ? (
                  <div className="text-sm text-gray-500">No members found</div>
                ) : (
                  activeMembers.map((m, idx) => {
                    const id = normalizeId(m);
                    const name = typeof m === "string" ? "User" : m.username || "User";
                    return (
                      <div
                        key={id || idx}
                        className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2"
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-xs font-semibold text-gray-700">
                          {name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="truncate text-sm text-gray-700">{name}</div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="border-t border-gray-200 p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-sm font-medium">
                  {currentUser?.username?.slice(0, 2).toUpperCase() || "U"}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">{currentUser?.username || "User"}</div>
                  <div className="text-xs text-gray-500">Active now</div>
                </div>
                <button onClick={() => setMuted((v) => !v)} className="p-1 text-gray-500 hover:text-gray-700">
                  {muted ? <BellOff className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Main chat */}
      <div className="flex flex-1 flex-col bg-white">
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="p-1 text-gray-500 hover:text-gray-700">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button onClick={() => setShowSidebar((v) => !v)} className="p-1 text-gray-500 hover:text-gray-700">
              <Menu className="h-5 w-5" />
            </button>
            <Avatar name={community.communityName} emoji={community.file} />
            <div>
              <h2 className="font-semibold text-gray-900">{community.communityName}</h2>
              <div className="text-xs text-gray-500">
                {community.onlineMembers} online · {community.totalMembers} members
              </div>
            </div>
          </div>
          <div className="flex gap-1">
            <button className="p-2 text-gray-500 hover:text-gray-700">
              <Phone className="h-4 w-4" />
            </button>
            <button className="p-2 text-gray-500 hover:text-gray-700">
              <Video className="h-4 w-4" />
            </button>
            <button onClick={() => setShowInfo((v) => !v)} className="p-2 text-gray-500 hover:text-gray-700">
              <Users className="h-4 w-4" />
            </button>
          </div>
        </div>

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

            <div className="flex-1 space-y-3 overflow-y-auto p-4">
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

            <div className="border-t border-gray-200 p-3">
              {showEmoji && (
                <div className="mb-2 flex gap-2 rounded-lg border border-gray-200 p-2">
                  {EMOJIS.map((e) => (
                    <button
                      key={e}
                      type="button"
                      onClick={() => setNewMessage((prev) => prev + e)}
                      className="rounded p-1 text-xl hover:bg-gray-100"
                    >
                      {e}
                    </button>
                  ))}
                </div>
              )}

              {selectedFile && (
                <div className="mb-2 flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm">
                  <span className="truncate">{selectedFile.name}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}

              {!isJoined ? (
                <div className="flex items-center justify-between rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3">
                  <p className="text-sm text-yellow-800">Join this community to send messages.</p>
                  <button
                    onClick={handleJoin}
                    disabled={joining}
                    className="rounded-lg bg-[#0D1B2A] px-4 py-2 text-sm text-white hover:bg-[#1E3A5F] disabled:opacity-60"
                  >
                    {joining ? "Joining..." : "Join"}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFilePick}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 text-gray-500 hover:text-gray-700"
                  >
                    <Paperclip className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowEmoji((v) => !v)}
                    className="p-2 text-gray-500 hover:text-gray-700"
                  >
                    <Smile className="h-4 w-4" />
                  </button>
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={`Message ${community.communityName}`}
                    className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#0EA472]"
                  />
                  <button
                    type="submit"
                    disabled={sending || (!newMessage.trim() && !selectedFile)}
                    className="rounded-lg bg-[#0D1B2A] p-2 text-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleLeave}
                    disabled={leaving}
                    className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50 disabled:opacity-60"
                    title="Leave room"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Room Info Panel with Members and Admin Management */}
          {showInfo && (
            <div className="flex w-72 flex-col overflow-y-auto border-l border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between border-b border-gray-200 p-4">
                <h3 className="font-semibold text-gray-900">Room Info</h3>
                <button onClick={() => setShowInfo(false)} className="text-gray-500 hover:text-gray-700">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="p-4 space-y-4">
                {/* Community details */}
                <div className="text-center">
                  <div className="mb-2 text-4xl">
                    {community.file && community.file.startsWith("http") ? "🖼️" : community.file || "💬"}
                  </div>
                  <h4 className="font-bold text-gray-900">{community.communityName}</h4>
                  <div className="mt-1 text-xs text-gray-500">
                    {community.onlineMembers} online · {community.totalMembers} members
                  </div>
                </div>

                {community.about && (
                  <div>
                    <div className="mb-1 text-xs font-semibold uppercase text-gray-500">About</div>
                    <p className="text-sm text-gray-700">{community.about}</p>
                  </div>
                )}

                <div>
                  <div className="mb-1 text-xs font-semibold uppercase text-gray-500">Topics</div>
                  <div className="flex flex-wrap gap-1.5">
                    {community.topics.map((t) => (
                      <span key={t} className="rounded-full bg-gray-200 px-2 py-0.5 text-xs text-gray-700">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Members list with admin controls */}
                <div>
                  <div className="mb-2 text-xs font-semibold uppercase text-gray-500">Members</div>
                  <div className="space-y-2">
                    {activeMembers.map((m) => {
                      const id = normalizeId(m);
                      const name = typeof m === "string" ? "User" : m.username || "User";
                      const isAdmin = (community.admins || []).some((a) => normalizeId(a) === id);
                      const isCreator = id === creatorId;

                      return (
                        <div key={id} className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2">
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-xs font-semibold text-gray-700">
                              {name.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{name}</div>
                              <div className="text-xs text-gray-500">
                                {isCreator ? "Creator" : isAdmin ? "Admin" : "Member"}
                              </div>
                            </div>
                          </div>

                          {/* Dropdown for creator only */}
                          {isCreator && creatorId !== id && (
                            <div className="relative">
                              <button
                                onClick={() => setDropdownOpen(dropdownOpen === id ? null : id)}
                                className="p-1 text-gray-400 hover:text-gray-600"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </button>
                              {dropdownOpen === id && (
                                <div className="absolute right-0 mt-1 w-36 rounded-md border border-gray-200 bg-white shadow-md z-10">
                                  {isAdmin ? (
                                    <button
                                      onClick={() => {
                                        removeAdmin(id);
                                        setDropdownOpen(null);
                                      }}
                                      className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                      Remove Admin
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => {
                                        makeAdmin(id);
                                        setDropdownOpen(null);
                                      }}
                                      className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                      Make Admin
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Mute/Pin/Leave actions (unchanged) */}
                <div className="space-y-2">
                  <button
                    onClick={() => setMuted((v) => !v)}
                    className="flex w-full items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    {muted ? <BellOff className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
                    {muted ? "Unmute" : "Mute"}
                  </button>
                  <button className="flex w-full items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    <Pin className="h-4 w-4" /> Pin room
                  </button>
                  <button
                    onClick={handleLeave}
                    disabled={leaving}
                    className="flex w-full items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-60"
                  >
                    <LogOut className="h-4 w-4" />
                    {leaving ? "Leaving..." : "Leave room"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}