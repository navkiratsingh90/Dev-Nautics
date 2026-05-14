"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useAppSelector } from "@/redux/hooks";
import {
  Send, Paperclip, Search, MoreVertical, Phone, Video,
  Users, X, Check, CheckCheck, Image, File, Smile,
  ChevronLeft, Circle, Hash, Lock, Globe, Pin, Bell,
  BellOff, LogOut, Trash2, Copy, Reply, Download, Menu,
} from "lucide-react";

// ─── Types (mirrors Mongoose schema) ──────────────────────────────────────────
type MessageType = "text" | "media" | "file";

interface FileMeta { url: string; mimeType: string; name: string; size: number; }

interface Message {
  _id: string;
  communityId: string;
  senderId: { _id: string; username: string; avatar?: string };
  text: string;
  type: MessageType;
  fileMeta?: FileMeta;
  isDelivered: boolean;
  isRead: boolean;
  createdAt: string;
  // UI-only
  isMe: boolean;
}

interface Community {
  _id: string;
  groupName: string;
  totalMembers: number;
  onlineMembers: number;
  file?: string;   // emoji or URL
  about?: string;
  topics: string[];
  status: "online" | "offline";
  unread: number;
  lastMessage?: string;
  lastMessageTime?: string;
  visibility: "public" | "private";
  isPinned?: boolean;
}

// ─── Mock data ─────────────────────────────────────────────────────────────────
const COMMUNITIES: Community[] = [
  { _id:"c1", groupName:"AI Development Team",    totalMembers:24, onlineMembers:12, file:"🤖", about:"Building intelligent systems together.", topics:["Python","TensorFlow","LangChain"], status:"online",  unread:3, lastMessage:"Great 95% accuracy!", lastMessageTime:"10:38 AM", visibility:"public", isPinned:true },
  { _id:"c2", groupName:"React Experts",          totalMembers:15, onlineMembers:8,  file:"⚛️", about:"Modern React patterns & ecosystem.",   topics:["React","TypeScript","Next.js"],    status:"online",  unread:0, lastMessage:"Check the new hooks pattern", lastMessageTime:"9:55 AM",  visibility:"public"  },
  { _id:"c3", groupName:"Backend Architecture",   totalMembers:18, onlineMembers:5,  file:"🔧", about:"Systems design and scalability.",      topics:["Node.js","Go","PostgreSQL"],        status:"online",  unread:1, lastMessage:"Sharding strategy update",   lastMessageTime:"8:30 AM",  visibility:"private" },
  { _id:"c4", groupName:"Open Source Contributors",totalMembers:52, onlineMembers:21,file:"🌍", about:"OSS collaboration and contributions.", topics:["Git","OSS","Docs"],                 status:"online",  unread:0, lastMessage:"PR merged! 🎉",             lastMessageTime:"Yesterday",visibility:"public"  },
  { _id:"c5", groupName:"Systems & Rust",         totalMembers:9,  onlineMembers:2,  file:"🦀", about:"Low-level, performance, and Rust.",    topics:["Rust","C++","WASM"],                status:"offline", unread:0, lastMessage:"WASM performance blog post",  lastMessageTime:"Mon",      visibility:"private" },
];

const INIT_MESSAGES: Message[] = [
  { _id:"m1", communityId:"c1", senderId:{_id:"u2",username:"Alex Chen"},   text:"Hey team! How's the AI model training going?", type:"text", isDelivered:true, isRead:true, createdAt:"2025-04-12T08:30:00Z", isMe:false },
  { _id:"m2", communityId:"c1", senderId:{_id:"me",username:"You"},          text:"Going great! We've achieved 95% accuracy on the test dataset. 🚀", type:"text", isDelivered:true, isRead:true, createdAt:"2025-04-12T08:32:00Z", isMe:true },
  { _id:"m3", communityId:"c1", senderId:{_id:"u3",username:"Sarah Kim"},    text:"That's awesome! 🎉 When can we integrate it with the frontend?", type:"text", isDelivered:true, isRead:true, createdAt:"2025-04-12T08:33:00Z", isMe:false },
  { _id:"m4", communityId:"c1", senderId:{_id:"u4",username:"Mike Rodriguez"},text:"We should be ready by Friday. I'll create the API endpoints today.", type:"text", isDelivered:true, isRead:true, createdAt:"2025-04-12T08:35:00Z", isMe:false },
  { _id:"m5", communityId:"c1", senderId:{_id:"me",username:"You"},          text:"Perfect! I'll update the React components to consume the new API.", type:"text", isDelivered:true, isRead:true, createdAt:"2025-04-12T08:36:00Z", isMe:true },
  { _id:"m6", communityId:"c1", senderId:{_id:"u2",username:"Alex Chen"},   text:"Don't forget about error handling for the API calls.", type:"text", isDelivered:true, isRead:true, createdAt:"2025-04-12T08:37:00Z", isMe:false },
  { _id:"m7", communityId:"c1", senderId:{_id:"me",username:"You"},          text:"Already on it. I'm implementing proper error boundaries and loading states.", type:"text", isDelivered:true, isRead:true, createdAt:"2025-04-12T08:38:00Z", isMe:true },
  { _id:"m8", communityId:"c1", senderId:{_id:"u3",username:"Sarah Kim"},    text:"Shared the design mockups in the drive.", type:"file", fileMeta:{ url:"#", mimeType:"application/pdf", name:"AI_Dashboard_Mockups.pdf", size:2340000 }, isDelivered:true, isRead:false, createdAt:"2025-04-12T08:40:00Z", isMe:false },
  { _id:"m9", communityId:"c1", senderId:{_id:"u4",username:"Mike Rodriguez"},text:"Let's sync on Monday for the integration review. Who's available?", type:"text", isDelivered:true, isRead:false, createdAt:"2025-04-12T08:42:00Z", isMe:false },
];

const AVATAR_GRADIENTS = [
  "from-violet-500 to-fuchsia-500","from-cyan-500 to-blue-500",
  "from-fuchsia-500 to-pink-500",  "from-amber-500 to-orange-500",
  "from-green-500 to-emerald-500", "from-blue-500 to-violet-500",
];
function hashIdx(s: string) { return s.split("").reduce((a,c)=>a+c.charCodeAt(0),0)%AVATAR_GRADIENTS.length; }

function fmtTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});
}
function fmtSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes/1024).toFixed(1)} KB`;
  return `${(bytes/1048576).toFixed(1)} MB`;
}

// ─── Emoji Picker (lightweight) ───────────────────────────────────────────────
const EMOJIS = ["😀","😂","🔥","🎉","👍","❤️","🚀","✅","🤔","😅","💡","⚡","🎯","🏆","🤝","💪"];

// ─── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({ name, size="md", emoji }: { name: string; size?:"sm"|"md"|"lg"; emoji?: string }) {
  const sz = size==="sm"?"w-7 h-7 text-[10px] rounded-lg":size==="lg"?"w-12 h-12 text-base rounded-xl":"w-9 h-9 text-xs rounded-xl";
  if (emoji && emoji.length <= 2) return <div className={`${sz} flex items-center justify-center text-lg ${size==="sm"?"text-sm":""}`}>{emoji}</div>;
  return <div className={`${sz} bg-gradient-to-br ${AVATAR_GRADIENTS[hashIdx(name)]} flex items-center justify-center font-bold text-white shrink-0`}>{name.slice(0,2).toUpperCase()}</div>;
}

// ─── Message bubble ───────────────────────────────────────────────────────────
function MessageBubble({ msg, darkMode, showSender, onCopy }: {
  msg: Message; darkMode: boolean; showSender: boolean; onCopy: (t:string)=>void;
}) {
  const [hovered, setHovered] = useState(false);
  const accentGradient = "from-violet-500 via-fuchsia-500 to-cyan-400";

  const myBg    = "bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white";
  const otherBg = darkMode ? "bg-gray-800 text-gray-200" : "bg-white text-gray-800 shadow-sm";

  return (
    <div className={`flex gap-2.5 ${msg.isMe?"flex-row-reverse":"flex-row"} group`}
      onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)}>

      {/* Avatar */}
      {!msg.isMe && (
        <div className="shrink-0 self-end">
          <Avatar name={msg.senderId.username} size="sm" />
        </div>
      )}

      <div className={`flex flex-col ${msg.isMe?"items-end":"items-start"} max-w-[70%]`}>
        {/* Sender name */}
        {!msg.isMe && showSender && (
          <span className={`text-[11px] font-semibold mb-1 ml-1 ${darkMode?"text-violet-400":"text-violet-600"}`}>
            {msg.senderId.username}
          </span>
        )}

        <div className="flex items-end gap-2">
          {/* Copy button (other side) */}
          {msg.isMe && hovered && (
            <button onClick={()=>onCopy(msg.text)} className={`p-1 rounded-lg transition-all opacity-0 group-hover:opacity-100 ${darkMode?"hover:bg-gray-700 text-gray-500":"hover:bg-gray-100 text-gray-400"}`}>
              <Copy className="w-3 h-3"/>
            </button>
          )}

          {/* Bubble */}
          <div className={`px-4 py-3 rounded-2xl ${msg.isMe ? `${myBg} rounded-br-sm` : `${otherBg} rounded-bl-sm`} transition-all`}>
            {/* File message */}
            {msg.type === "file" && msg.fileMeta ? (
              <div className={`flex items-center gap-3 p-2 rounded-xl border ${msg.isMe?"border-white/20 bg-white/10":"border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-700/50"}`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${msg.isMe?"bg-white/20":"bg-violet-500/15"}`}>
                  <File className={`w-5 h-5 ${msg.isMe?"text-white":"text-violet-400"}`}/>
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-semibold truncate ${msg.isMe?"text-white":"text-gray-800 dark:text-gray-200"}`}>{msg.fileMeta.name}</p>
                  <p className={`text-[10px] mt-0.5 ${msg.isMe?"text-white/60":"text-gray-400"}`}>{fmtSize(msg.fileMeta.size)}</p>
                </div>
                <button className={`p-1.5 rounded-lg transition-all ${msg.isMe?"hover:bg-white/20 text-white":"hover:bg-gray-200 text-gray-500 dark:hover:bg-gray-600 dark:text-gray-400"}`}>
                  <Download className="w-3.5 h-3.5"/>
                </button>
              </div>
            ) : (
              <p className="text-sm leading-relaxed">{msg.text}</p>
            )}

            {/* Time + status */}
            <div className={`flex items-center justify-end gap-1 mt-1.5 ${msg.isMe?"text-white/50":"text-gray-400"}`}>
              {/* <span className="text-[10px]">{fmtTime(msg.createdAt)}</span> */}
              {msg.isMe && (
                msg.isRead
                  ? <CheckCheck className="w-3 h-3 text-cyan-300"/>
                  : msg.isDelivered
                    ? <CheckCheck className="w-3 h-3 opacity-40"/>
                    : <Check className="w-3 h-3 opacity-40"/>
              )}
            </div>
          </div>

          {/* Copy button (my side) */}
          {!msg.isMe && hovered && (
            <button onClick={()=>onCopy(msg.text)} className={`p-1 rounded-lg transition-all opacity-0 group-hover:opacity-100 ${darkMode?"hover:bg-gray-700 text-gray-500":"hover:bg-gray-100 text-gray-400"}`}>
              <Copy className="w-3 h-3"/>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Community list item ──────────────────────────────────────────────────────
function CommunityItem({ c, active, darkMode, onClick }: { c: Community; active: boolean; darkMode: boolean; onClick:()=>void }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 transition-all ${active
      ? darkMode ? "bg-violet-500/15 border-l-2 border-violet-500" : "bg-violet-50 border-l-2 border-violet-500"
      : darkMode ? "hover:bg-gray-800/60 border-l-2 border-transparent" : "hover:bg-gray-50 border-l-2 border-transparent"
    }`}>
      <div className="relative shrink-0">
        <Avatar name={c.groupName} emoji={c.file} size="md"/>
        {c.status==="online" && (
          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-400 border-2 border-gray-900"/>
        )}
      </div>
      <div className="flex-1 min-w-0 text-left">
        <div className="flex items-center justify-between">
          <p className={`text-sm font-semibold truncate ${active ? "text-violet-400" : darkMode?"text-white":"text-gray-900"}`}>{c.groupName}</p>
          <div className="flex items-center gap-1.5 ml-2 shrink-0">
            {c.isPinned && <Pin className={`w-2.5 h-2.5 ${active?"text-violet-400":"text-gray-400"}`}/>}
            {c.unread>0 && <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white text-[10px] font-bold flex items-center justify-center">{c.unread}</span>}
            <span className={`text-[10px] ${darkMode?"text-gray-500":"text-gray-400"}`}>{c.lastMessageTime}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 mt-0.5">
          <span className={`text-[11px] truncate ${darkMode?"text-gray-400":"text-gray-500"}`}>{c.lastMessage}</span>
        </div>
      </div>
    </button>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ChatPage() {
  const darkMode = useAppSelector((state:any)=>state.Theme.darkMode);

  const [messages, setMessages]       = useState<Message[]>(INIT_MESSAGES);
  const [newMessage, setNewMessage]   = useState("");
  const [activeChat, setActiveChat]   = useState<string>("c1");
  const [search, setSearch]           = useState("");
  const [showSidebar, setShowSidebar] = useState(true);
  const [showInfo, setShowInfo]       = useState(false);
  const [showEmoji, setShowEmoji]     = useState(false);
  const [muted, setMuted]             = useState(false);
  const [typing, setTyping]           = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef       = useRef<HTMLInputElement>(null);
  const fileInputRef   = useRef<HTMLInputElement>(null);

  useEffect(()=>{ messagesEndRef.current?.scrollIntoView({ behavior:"smooth" }); },[messages]);

  // Simulate typing indicator
  useEffect(()=>{
    if(newMessage.length>0){ setTyping(true); } else { setTyping(false); }
  },[newMessage]);

  const activeComm = COMMUNITIES.find(c=>c._id===activeChat);
  const filteredComm = COMMUNITIES.filter(c=>c.groupName.toLowerCase().includes(search.toLowerCase()));

  function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    const txt = newMessage.trim();
    if(!txt) return;
    const msg: Message = {
      _id: `m${Date.now()}`, communityId: activeChat,
      senderId:{_id:"me",username:"You"}, text:txt, type:"text",
      isDelivered:false, isRead:false, isMe:true,
      createdAt: new Date().toISOString(),
    };
    setMessages(p=>[...p,msg]);
    setNewMessage(""); setShowEmoji(false);

    // Simulate delivery
    setTimeout(()=>{
      setMessages(p=>p.map(m=>m._id===msg._id?{...m,isDelivered:true}:m));
    },800);
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if(!file) return;
    const msg: Message = {
      _id:`m${Date.now()}`, communityId:activeChat,
      senderId:{_id:"me",username:"You"}, text:"", type:"file",
      fileMeta:{ url:"#", mimeType:file.type, name:file.name, size:file.size },
      isDelivered:false, isRead:false, isMe:true,
      createdAt: new Date().toISOString(),
    };
    setMessages(p=>[...p,msg]);
    e.target.value="";
  }

  function copyToClipboard(text:string){ navigator.clipboard.writeText(text); }

  // ── Theme tokens ────────────────────────────────────────────────────────────
  const bg          = darkMode ? "bg-gray-900"           : "bg-gray-50";
  const sidebarBg   = darkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200";
  const chatAreaBg  = darkMode ? "bg-gray-900"           : "bg-gray-50";
  const headerBg    = darkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200";
  const inputBg     = darkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200";
  const mutedText   = darkMode ? "text-gray-400"         : "text-gray-500";
  const headingText = darkMode ? "text-white"            : "text-gray-900";
  const divider     = darkMode ? "border-gray-800"       : "border-gray-200";
  const accentGradient = "from-violet-500 via-fuchsia-500 to-cyan-400";
  const accentText     = "bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent";

  // Group messages by date and consecutive sender
  function shouldShowSender(idx: number): boolean {
    if(idx===0) return true;
    const prev = messages[idx-1];
    const curr = messages[idx];
    return prev.senderId._id !== curr.senderId._id;
  }

  return (
    <div className={`flex h-screen overflow-hidden ${bg} transition-colors duration-300 font-sans`}>

      {/* ── SIDEBAR ── */}
      <div className={`${showSidebar?"w-80":"w-0 overflow-hidden"} transition-all duration-300 shrink-0 flex flex-col border-r ${sidebarBg} z-10`}>
        {showSidebar && (
          <>
            {/* Sidebar header */}
            <div className={`px-4 py-4 border-b ${divider}`}>
              <div className="flex items-center justify-between mb-3">
                <h2 className={`text-base font-bold ${headingText}`}>
                  <span className={accentText}>Chatrooms</span>
                </h2>
                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${darkMode?"bg-green-500/10 border-green-500/25 text-green-400":"bg-green-50 border-green-200 text-green-600"}`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"/>
                  {COMMUNITIES.filter(c=>c.status==="online").length} live
                </div>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 ${mutedText}`}/>
                <input type="text" placeholder="Search rooms…" value={search} onChange={e=>setSearch(e.target.value)}
                  className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-xs outline-none transition-all focus:ring-2 focus:ring-violet-500/30 ${darkMode?"bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-violet-500/60":"bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-violet-400"}`}/>
                {search && <button onClick={()=>setSearch("")} className={`absolute right-3 top-1/2 -translate-y-1/2 ${mutedText}`}><X className="w-3 h-3"/></button>}
              </div>
            </div>

            {/* Community list */}
            <div className="flex-1 overflow-y-auto py-1">
              {filteredComm.length === 0 ? (
                <div className="text-center py-8"><p className={`text-xs ${mutedText}`}>No rooms found</p></div>
              ) : (
                filteredComm.map(c => (
                  <CommunityItem key={c._id} c={c} active={activeChat===c._id} darkMode={darkMode} onClick={()=>{setActiveChat(c._id);setShowInfo(false);}}/>
                ))
              )}
            </div>

            {/* Bottom user strip */}
            <div className={`px-4 py-3 border-t ${divider} flex items-center gap-3`}>
              <div className="relative">
                <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${AVATAR_GRADIENTS[0]} flex items-center justify-center text-xs font-bold text-white`}>ME</div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-400 border-2 border-gray-900"/>
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-semibold ${headingText}`}>You</p>
                <p className={`text-[10px] ${mutedText}`}>Active now</p>
              </div>
              <button onClick={()=>setMuted(!muted)} className={`p-1.5 rounded-lg transition-colors ${darkMode?"hover:bg-gray-800 text-gray-400":"hover:bg-gray-100 text-gray-500"}`}>
                {muted ? <BellOff className="w-3.5 h-3.5"/> : <Bell className="w-3.5 h-3.5"/>}
              </button>
            </div>
          </>
        )}
      </div>

      {/* ── MAIN CHAT AREA ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Chat Header */}
        <div className={`flex items-center justify-between px-5 py-3.5 border-b ${headerBg} shrink-0`}>
          <div className="flex items-center gap-3">
            {/* Sidebar toggle */}
            <button onClick={()=>setShowSidebar(p=>!p)} className={`p-2 rounded-xl transition-all ${darkMode?"hover:bg-gray-800 text-gray-400":"hover:bg-gray-100 text-gray-500"}`}>
              <Menu className="w-4 h-4"/>
            </button>

            {activeComm && (
              <>
                <div className="relative">
                  <Avatar name={activeComm.groupName} emoji={activeComm.file} size="md"/>
                  {activeComm.status==="online" && <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-400 border-2 border-gray-900"/>}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className={`text-sm font-bold ${headingText}`}>{activeComm.groupName}</h2>
                    {activeComm.visibility==="private" ? <Lock className={`w-3 h-3 ${mutedText}`}/> : <Globe className={`w-3 h-3 ${mutedText}`}/>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"/>
                    <p className={`text-[11px] ${mutedText}`}>
                      {activeComm.onlineMembers} online · {activeComm.totalMembers} members
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Header actions */}
          <div className="flex items-center gap-1">
            {[
              { icon:<Phone className="w-4 h-4"/>,    title:"Voice call"  },
              { icon:<Video className="w-4 h-4"/>,    title:"Video call"  },
              { icon:<Search className="w-4 h-4"/>,   title:"Search"      },
            ].map(btn => (
              <button key={btn.title} title={btn.title} className={`p-2 rounded-xl transition-all ${darkMode?"hover:bg-gray-800 text-gray-400 hover:text-gray-200":"hover:bg-gray-100 text-gray-500 hover:text-gray-700"}`}>{btn.icon}</button>
            ))}
            <button onClick={()=>setShowInfo(p=>!p)}
              className={`p-2 rounded-xl transition-all ${showInfo
                ? "bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white"
                : darkMode?"hover:bg-gray-800 text-gray-400 hover:text-gray-200":"hover:bg-gray-100 text-gray-500 hover:text-gray-700"
              }`}>
              <Users className="w-4 h-4"/>
            </button>
          </div>
        </div>

        {/* Chat body */}
        <div className="flex-1 flex overflow-hidden">

          {/* Messages area */}
          <div className={`flex-1 flex flex-col overflow-hidden ${chatAreaBg}`}>
            {/* Topics pills */}
            {activeComm?.topics && activeComm.topics.length > 0 && (
              <div className={`flex items-center gap-2 px-5 py-2 border-b ${divider} overflow-x-auto scrollbar-hide`}>
                <Hash className={`w-3 h-3 shrink-0 ${mutedText}`}/>
                {activeComm.topics.map(t => (
                  <span key={t} className={`text-[10px] font-medium px-2 py-0.5 rounded-full border shrink-0 ${darkMode?"bg-violet-500/10 border-violet-500/25 text-violet-400":"bg-violet-50 border-violet-200 text-violet-600"}`}>{t}</span>
                ))}
              </div>
            )}

            {/* Messages scroll */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">

              {/* Date divider */}
              <div className="flex items-center gap-3">
                <div className={`flex-1 h-px ${darkMode?"bg-gray-800":"bg-gray-200"}`}/>
                <span className={`text-[10px] font-medium px-2.5 py-1 rounded-full border ${darkMode?"bg-gray-800 border-gray-700 text-gray-500":"bg-gray-100 border-gray-200 text-gray-400"}`}>Today</span>
                <div className={`flex-1 h-px ${darkMode?"bg-gray-800":"bg-gray-200"}`}/>
              </div>

              {messages.map((msg,i)=>(
                <MessageBubble key={msg._id} msg={msg} darkMode={darkMode} showSender={shouldShowSender(i)} onCopy={copyToClipboard}/>
              ))}

              {/* Typing indicator */}
              {false && (
                <div className="flex items-center gap-2 pl-1">
                  <Avatar name="Sarah Kim" size="sm"/>
                  <div className={`px-3 py-2.5 rounded-2xl rounded-bl-sm ${darkMode?"bg-gray-800":"bg-white shadow-sm"}`}>
                    <div className="flex items-center gap-1">
                      {[0,1,2].map(i=><span key={i} className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay:`${i*150}ms` }}/>)}
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef}/>
            </div>

            {/* Input area */}
            <div className={`px-5 py-3.5 border-t ${divider} ${inputBg} shrink-0`}>

              {/* Emoji picker */}
              {showEmoji && (
                <div className={`mb-3 p-3 rounded-2xl border flex flex-wrap gap-2 ${darkMode?"bg-gray-800 border-gray-700":"bg-white border-gray-200"}`}>
                  {EMOJIS.map(e=>(
                    <button key={e} onClick={()=>setNewMessage(p=>p+e)} className="text-xl hover:scale-125 transition-transform">{e}</button>
                  ))}
                </div>
              )}

              <form onSubmit={sendMessage} className="flex items-end gap-2">
                {/* Attach */}
                <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileUpload}/>
                <button type="button" onClick={()=>fileInputRef.current?.click()}
                  className={`p-2.5 rounded-xl transition-all shrink-0 ${darkMode?"hover:bg-gray-800 text-gray-400 hover:text-gray-200":"hover:bg-gray-100 text-gray-500 hover:text-gray-700"}`}>
                  <Paperclip className="w-4 h-4"/>
                </button>

                {/* Emoji */}
                <button type="button" onClick={()=>setShowEmoji(p=>!p)}
                  className={`p-2.5 rounded-xl transition-all shrink-0 ${showEmoji?"bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white":darkMode?"hover:bg-gray-800 text-gray-400 hover:text-gray-200":"hover:bg-gray-100 text-gray-500 hover:text-gray-700"}`}>
                  <Smile className="w-4 h-4"/>
                </button>

                {/* Input */}
                <div className="flex-1 relative">
                  <input
                    ref={inputRef}
                    value={newMessage}
                    onChange={e=>setNewMessage(e.target.value)}
                    onKeyDown={e=>{ if(e.key==="Enter"&&!e.shiftKey){ e.preventDefault(); sendMessage(e as any); } }}
                    placeholder={`Message #${activeComm?.groupName??""}`}
                    className={`w-full px-4 py-3 rounded-2xl border text-sm outline-none transition-all focus:ring-2 focus:ring-violet-500/30 ${darkMode?"bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-violet-500/60":"bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-violet-400"}`}
                  />
                </div>

                {/* Send */}
                <button type="submit" disabled={!newMessage.trim()}
                  className={`p-3 rounded-xl transition-all shrink-0 ${newMessage.trim()
                    ? `bg-gradient-to-r ${accentGradient} text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/45 hover:scale-105 active:scale-95`
                    : darkMode?"bg-gray-800 text-gray-600":"bg-gray-100 text-gray-400"
                  } ${!newMessage.trim()?"cursor-not-allowed":""}`}>
                  <Send className="w-4 h-4"/>
                </button>
              </form>

              <p className={`text-[10px] text-center mt-2 ${mutedText}`}>
                Press <kbd className={`px-1 py-0.5 rounded text-[10px] ${darkMode?"bg-gray-700 text-gray-400":"bg-gray-100 text-gray-500"}`}>Enter</kbd> to send · <kbd className={`px-1 py-0.5 rounded text-[10px] ${darkMode?"bg-gray-700 text-gray-400":"bg-gray-100 text-gray-500"}`}>Shift+Enter</kbd> for new line
              </p>
            </div>
          </div>

          {/* ── INFO PANEL ── */}
          {showInfo && activeComm && (
            <div className={`w-72 shrink-0 border-l ${divider} flex flex-col overflow-hidden ${darkMode?"bg-gray-900":"bg-white"} transition-all`}>
              {/* Panel header */}
              <div className={`flex items-center justify-between px-5 py-4 border-b ${divider}`}>
                <h3 className={`text-sm font-bold ${headingText}`}>Room Info</h3>
                <button onClick={()=>setShowInfo(false)} className={`p-1.5 rounded-lg ${darkMode?"hover:bg-gray-800 text-gray-400":"hover:bg-gray-100 text-gray-500"} transition-colors`}><X className="w-4 h-4"/></button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-6">
                {/* Community avatar + name */}
                <div className="text-center">
                  <div className="w-16 h-16 rounded-2xl mx-auto mb-3 flex items-center justify-center text-4xl">{activeComm.file}</div>
                  <h4 className={`text-base font-bold ${headingText}`}>{activeComm.groupName}</h4>
                  <div className="flex items-center justify-center gap-1.5 mt-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"/>
                    <p className={`text-xs ${mutedText}`}>{activeComm.onlineMembers} online · {activeComm.totalMembers} members</p>
                  </div>
                </div>

                {/* About */}
                {activeComm.about && (
                  <div>
                    <p className={`text-[10px] font-bold uppercase tracking-wider mb-2 ${mutedText}`}>About</p>
                    <p className={`text-xs leading-relaxed ${darkMode?"text-gray-300":"text-gray-600"}`}>{activeComm.about}</p>
                  </div>
                )}

                {/* Topics */}
                {activeComm.topics.length > 0 && (
                  <div>
                    <p className={`text-[10px] font-bold uppercase tracking-wider mb-2 ${mutedText}`}>Topics</p>
                    <div className="flex flex-wrap gap-1.5">
                      {activeComm.topics.map(t=>(
                        <span key={t} className={`text-[11px] font-medium px-2.5 py-1 rounded-full border ${darkMode?"bg-violet-500/10 border-violet-500/25 text-violet-400":"bg-violet-50 border-violet-200 text-violet-600"}`}>{t}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label:"Total messages", value: messages.length         },
                    { label:"Media shared",   value: messages.filter(m=>m.type!=="text").length },
                  ].map(s=>(
                    <div key={s.label} className={`p-3 rounded-xl border text-center ${darkMode?"bg-gray-800 border-gray-700":"bg-gray-50 border-gray-100"}`}>
                      <div className={`text-xl font-extrabold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent`}>{s.value}</div>
                      <div className={`text-[10px] mt-0.5 ${mutedText}`}>{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  <p className={`text-[10px] font-bold uppercase tracking-wider mb-2 ${mutedText}`}>Actions</p>
                  {[
                    { icon:<Bell className="w-3.5 h-3.5"/>,  label: muted?"Unmute":"Mute",    action:()=>setMuted(p=>!p), color:"violet" },
                    { icon:<Pin className="w-3.5 h-3.5"/>,   label:"Pin room",                 action:()=>{},               color:"amber"  },
                    { icon:<LogOut className="w-3.5 h-3.5"/>,label:"Leave room",               action:()=>{},               color:"red"    },
                  ].map(a=>(
                    <button key={a.label} onClick={a.action}
                      className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border text-xs font-medium transition-all hover:scale-[1.01] ${
                        a.color==="red"
                          ? darkMode?"border-red-500/40 text-red-400 hover:bg-red-500/10":"border-red-200 text-red-500 hover:bg-red-50"
                          : a.color==="amber"
                            ? darkMode?"border-amber-500/40 text-amber-400 hover:bg-amber-500/10":"border-amber-200 text-amber-500 hover:bg-amber-50"
                            : darkMode?"border-gray-700 text-gray-400 hover:bg-gray-800":"border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}>
                      {a.icon}{a.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display:none; }
        .scrollbar-hide { -ms-overflow-style:none; scrollbar-width:none; }
      `}</style>
    </div>
  );
}