"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Send, Paperclip, Search, MoreVertical, Phone, Video,
  Users, X, Check, CheckCheck, File, Smile,
  ChevronLeft, Hash, Lock, Globe, Pin, Bell,
  BellOff, LogOut, Copy, Download, Menu,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────
interface Message {
  _id: string;
  senderId: { _id: string; username: string };
  text: string;
  type: "text" | "file";
  fileMeta?: { name: string; size: number };
  isDelivered: boolean;
  isRead: boolean;
  createdAt: string;
  isMe: boolean;
}

interface Community {
  _id: string;
  groupName: string;
  totalMembers: number;
  onlineMembers: number;
  file?: string;
  about?: string;
  topics: string[];
  status: "online" | "offline";
  unread: number;
  lastMessage?: string;
  lastMessageTime?: string;
  visibility: "public" | "private";
  isPinned?: boolean;
}

// ─── Mock Data ──────────────────────────────────────────────────
const COMMUNITIES: Community[] = [
  { _id:"c1", groupName:"AI Development Team",    totalMembers:24, onlineMembers:12, file:"🤖", about:"Building intelligent systems together.", topics:["Python","TensorFlow"], status:"online",  unread:3, lastMessage:"Great 95% accuracy!", lastMessageTime:"10:38 AM", visibility:"public", isPinned:true },
  { _id:"c2", groupName:"React Experts",          totalMembers:15, onlineMembers:8,  file:"⚛️", about:"Modern React patterns & ecosystem.",   topics:["React","TypeScript"],    status:"online",  unread:0, lastMessage:"Check the new hooks pattern", lastMessageTime:"9:55 AM",  visibility:"public"  },
  { _id:"c3", groupName:"Backend Architecture",   totalMembers:18, onlineMembers:5,  file:"🔧", about:"Systems design and scalability.",      topics:["Node.js","Go"],          status:"online",  unread:1, lastMessage:"Sharding strategy update",   lastMessageTime:"8:30 AM",  visibility:"private" },
];

const INIT_MESSAGES: Message[] = [
  { _id:"m1", senderId:{_id:"u2",username:"Alex Chen"},   text:"Hey team! How's the AI model training going?", type:"text", isDelivered:true, isRead:true, createdAt:"2025-04-12T08:30:00Z", isMe:false },
  { _id:"m2", senderId:{_id:"me",username:"You"},          text:"Going great! We've achieved 95% accuracy!", type:"text", isDelivered:true, isRead:true, createdAt:"2025-04-12T08:32:00Z", isMe:true },
  { _id:"m3", senderId:{_id:"u3",username:"Sarah Kim"},    text:"That's awesome! When can we integrate?", type:"text", isDelivered:true, isRead:true, createdAt:"2025-04-12T08:33:00Z", isMe:false },
];

const EMOJIS = ["😀","😂","🔥","🎉","👍","❤️","🚀","✅"];

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});
}
function fmtSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes/1024).toFixed(1)} KB`;
  return `${(bytes/1048576).toFixed(1)} MB`;
}

// ─── Components ─────────────────────────────────────────────────
function Avatar({ name, emoji }: { name: string; emoji?: string }) {
  if (emoji) return <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-xl">{emoji}</div>;
  return <div className="w-9 h-9 rounded-xl bg-gray-200 flex items-center justify-center font-medium text-gray-700">{name.slice(0,2).toUpperCase()}</div>;
}

function MessageBubble({ msg, showSender, onCopy }: { msg: Message; showSender: boolean; onCopy: (t: string) => void }) {
  return (
    <div className={`flex gap-2 ${msg.isMe ? "flex-row-reverse" : "flex-row"}`}>
      {!msg.isMe && <Avatar name={msg.senderId.username} />}
      <div className={`max-w-[70%] ${msg.isMe ? "items-end" : "items-start"}`}>
        {!msg.isMe && showSender && (
          <div className="text-xs font-medium text-[#0EA472] mb-1 ml-1">{msg.senderId.username}</div>
        )}
        <div className="flex items-end gap-1">
          {msg.isMe && (
            <button onClick={() => onCopy(msg.text)} className="text-gray-400 hover:text-gray-600"><Copy className="w-3 h-3" /></button>
          )}
          <div className={`px-3 py-2 rounded-2xl ${msg.isMe ? "bg-[#0D1B2A] text-white rounded-br-sm" : "bg-white border border-gray-200 text-gray-800 rounded-bl-sm"}`}>
            {msg.type === "file" && msg.fileMeta ? (
              <div className="flex items-center gap-2">
                <File className="w-4 h-4 text-gray-500" />
                <div>
                  <div className="text-sm font-medium">{msg.fileMeta.name}</div>
                  <div className="text-xs text-gray-400">{fmtSize(msg.fileMeta.size)}</div>
                </div>
                <Download className="w-4 h-4 text-gray-500 cursor-pointer" />
              </div>
            ) : (
              <p className="text-sm">{msg.text}</p>
            )}
            <div className={`text-[10px] mt-1 flex justify-end gap-1 ${msg.isMe ? "text-white/50" : "text-gray-400"}`}>
              <span>{fmtTime(msg.createdAt)}</span>
              {msg.isMe && (msg.isRead ? <CheckCheck className="w-3 h-3" /> : <Check className="w-3 h-3" />)}
            </div>
          </div>
          {!msg.isMe && (
            <button onClick={() => onCopy(msg.text)} className="text-gray-400 hover:text-gray-600"><Copy className="w-3 h-3" /></button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────
export default function ChatPage() {
  const [messages, setMessages] = useState(INIT_MESSAGES);
  const [newMessage, setNewMessage] = useState("");
  const [activeChatId, setActiveChatId] = useState("c1");
  const [search, setSearch] = useState("");
  const [showSidebar, setShowSidebar] = useState(true);
  const [showInfo, setShowInfo] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [muted, setMuted] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
  }, [messages]);

  const activeComm = COMMUNITIES.find(c => c._id === activeChatId);
  const filteredCommunities = COMMUNITIES.filter(c =>
    c.groupName.toLowerCase().includes(search.toLowerCase())
  );

  function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    const text = newMessage.trim();
    if (!text) return;
    const newMsg: Message = {
      _id: Date.now().toString(),
      senderId: { _id: "me", username: "You" },
      text,
      type: "text",
      isDelivered: true,
      isRead: false,
      createdAt: new Date().toISOString(),
      isMe: true,
    };
    setMessages(prev => [...prev, newMsg]);
    setNewMessage("");
    setShowEmoji(false);
    // Simulate read receipt
    setTimeout(() => {
      setMessages(prev => prev.map(m => m._id === newMsg._id ? { ...m, isRead: true } : m));
    }, 1000);
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const newMsg: Message = {
      _id: Date.now().toString(),
      senderId: { _id: "me", username: "You" },
      text: "",
      type: "file",
      fileMeta: { name: file.name, size: file.size },
      isDelivered: true,
      isRead: false,
      createdAt: new Date().toISOString(),
      isMe: true,
    };
    setMessages(prev => [...prev, newMsg]);
    e.target.value = "";
  }

  function copyMessage(text: string) {
    navigator.clipboard.writeText(text);
  }

  function shouldShowSender(idx: number): boolean {
    if (idx === 0) return true;
    return messages[idx].senderId._id !== messages[idx-1].senderId._id;
  }

  return (
    <div className="flex h-screen bg-[#F8FAFB] font-sans">
      {/* Sidebar */}
      <div className={`${showSidebar ? "w-80" : "w-0"} flex flex-col border-r border-gray-200 bg-white transition-all overflow-hidden`}>
        {showSidebar && (
          <>
            <div className="p-4 border-b border-gray-200">
              <div className="flex justify-between items-center mb-3">
                <h2 className="font-bold text-gray-900">Chatrooms</h2>
                <div className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                  {COMMUNITIES.filter(c => c.status === "online").length} live
                </div>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search rooms…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {filteredCommunities.map(c => (
                <button
                  key={c._id}
                  onClick={() => { setActiveChatId(c._id); setShowInfo(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 ${activeChatId === c._id ? "bg-gray-100 border-l-2 border-[#0EA472]" : ""}`}
                >
                  <Avatar name={c.groupName} emoji={c.file} />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-900">{c.groupName}</span>
                      <div className="flex items-center gap-1">
                        {c.unread > 0 && <span className="bg-[#0EA472] text-white text-[10px] px-1.5 rounded-full">{c.unread}</span>}
                        <span className="text-xs text-gray-400">{c.lastMessageTime}</span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 truncate">{c.lastMessage}</div>
                  </div>
                </button>
              ))}
            </div>
            <div className="p-3 border-t border-gray-200 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium">ME</div>
              <div className="flex-1">
                <div className="text-sm font-medium">You</div>
                <div className="text-xs text-gray-500">Active now</div>
              </div>
              <button onClick={() => setMuted(!muted)} className="p-1 text-gray-500 hover:text-gray-700">
                {muted ? <BellOff className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Chat header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <button onClick={() => setShowSidebar(!showSidebar)} className="p-1 text-gray-500 hover:text-gray-700">
              <Menu className="w-5 h-5" />
            </button>
            {activeComm && (
              <>
                <Avatar name={activeComm.groupName} emoji={activeComm.file} />
                <div>
                  <div className="flex items-center gap-1">
                    <h2 className="font-semibold text-gray-900">{activeComm.groupName}</h2>
                    {activeComm.visibility === "private" ? <Lock className="w-3 h-3 text-gray-400" /> : <Globe className="w-3 h-3 text-gray-400" />}
                  </div>
                  <div className="text-xs text-gray-500">
                    {activeComm.onlineMembers} online · {activeComm.totalMembers} members
                  </div>
                </div>
              </>
            )}
          </div>
          <div className="flex gap-1">
            <button className="p-2 text-gray-500 hover:text-gray-700"><Phone className="w-4 h-4" /></button>
            <button className="p-2 text-gray-500 hover:text-gray-700"><Video className="w-4 h-4" /></button>
            <button onClick={() => setShowInfo(!showInfo)} className="p-2 text-gray-500 hover:text-gray-700">
              <Users className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Messages area */}
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 flex flex-col">
            {/* Topics bar */}
            {activeComm?.topics && activeComm.topics.length > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-100 overflow-x-auto">
                <Hash className="w-3 h-3 text-gray-400" />
                {activeComm.topics.map(t => (
                  <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{t}</span>
                ))}
              </div>
            )}
            {/* Messages scroll */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg, i) => (
                <MessageBubble key={msg._id} msg={msg} showSender={shouldShowSender(i)} onCopy={copyMessage} />
              ))}
              <div ref={messagesEndRef} />
            </div>
            {/* Input area */}
            <div className="border-t border-gray-200 p-3">
              {showEmoji && (
                <div className="mb-2 p-2 border border-gray-200 rounded-lg flex gap-2">
                  {EMOJIS.map(e => (
                    <button key={e} onClick={() => setNewMessage(prev => prev + e)} className="text-xl hover:bg-gray-100 p-1 rounded">{e}</button>
                  ))}
                </div>
              )}
              <form onSubmit={sendMessage} className="flex gap-2">
                <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
                <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 text-gray-500 hover:text-gray-700">
                  <Paperclip className="w-4 h-4" />
                </button>
                <button type="button" onClick={() => setShowEmoji(!showEmoji)} className="p-2 text-gray-500 hover:text-gray-700">
                  <Smile className="w-4 h-4" />
                </button>
                <input
                  type="text"
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  placeholder={`Message ${activeComm?.groupName || ""}`}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#0EA472]"
                />
                <button type="submit" disabled={!newMessage.trim()} className="p-2 bg-[#0D1B2A] text-white rounded-lg disabled:opacity-50">
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>

          {/* Info panel */}
          {showInfo && activeComm && (
            <div className="w-72 border-l border-gray-200 bg-gray-50 flex flex-col overflow-y-auto">
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="font-semibold text-gray-900">Room Info</h3>
                <button onClick={() => setShowInfo(false)} className="text-gray-500 hover:text-gray-700"><X className="w-4 h-4" /></button>
              </div>
              <div className="p-4 space-y-4">
                <div className="text-center">
                  <div className="text-4xl mb-2">{activeComm.file}</div>
                  <h4 className="font-bold text-gray-900">{activeComm.groupName}</h4>
                  <div className="text-xs text-gray-500 mt-1">{activeComm.onlineMembers} online · {activeComm.totalMembers} members</div>
                </div>
                {activeComm.about && (
                  <div>
                    <div className="text-xs font-semibold text-gray-500 uppercase mb-1">About</div>
                    <p className="text-sm text-gray-700">{activeComm.about}</p>
                  </div>
                )}
                <div>
                  <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Topics</div>
                  <div className="flex flex-wrap gap-1">
                    {activeComm.topics.map(t => (
                      <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-gray-200 text-gray-700">{t}</span>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <button onClick={() => setMuted(!muted)} className="w-full flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-100">
                    {muted ? <BellOff className="w-4 h-4" /> : <Bell className="w-4 h-4" />} {muted ? "Unmute" : "Mute"}
                  </button>
                  <button className="w-full flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-100">
                    <Pin className="w-4 h-4" /> Pin room
                  </button>
                  <button className="w-full flex items-center gap-2 px-3 py-2 text-sm border border-red-200 rounded-lg text-red-600 hover:bg-red-50">
                    <LogOut className="w-4 h-4" /> Leave room
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