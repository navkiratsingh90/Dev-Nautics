"use client";

import React, { useEffect, useState, useRef } from "react";
import { useAppSelector } from "@/redux/hooks";
import { toast } from "sonner";
import { Check, X, Users, MessageSquare, Bell, UserCheck, Clock, ChevronRight, Search, Filter } from "lucide-react";
// import { approveConnectionRequest, getPendingRequests, declineConnectionRequest } from "@/services/userApis";
// import { approveDiscussionRequest, getCommunityPendingRequests } from "@/services/discussionApis";

// ─── Types ────────────────────────────────────────────────────────────────────
interface ConnectionRequest {
  id: string;
  username: string;
  about: string;
  allSkills: string[];
  mutualConnections?: number;
  sentAt?: string;
}

interface CommunityRequest {
  userId: string;
  username: string;
  about?: string;
  allSkills?: string[];
  communityId: string;
  communityName: string;
  communityIcon?: string;
  communityMembers?: number;
  sentAt?: string;
}

// ─── Mock data ────────────────────────────────────────────────────────────────
const MOCK_CONNECTIONS: ConnectionRequest[] = [
  { id: "r1", username: "ankitml",      about: "ML Engineer @ Google Brain. Love building LLM pipelines and contributing to open-source.", allSkills: ["Python", "PyTorch", "LangChain", "MLOps", "FastAPI"], mutualConnections: 12, sentAt: "2025-04-10T10:00:00Z" },
  { id: "r2", username: "sophie_builds",about: "Full-stack dev, TypeScript fanatic. Currently building a no-code AI workflow tool.", allSkills: ["TypeScript", "React", "Node.js", "Postgres", "Tailwind"], mutualConnections: 5, sentAt: "2025-04-09T08:00:00Z" },
  { id: "r3", username: "rustacean_x",  about: "Systems programmer obsessed with Rust and WASM. Contributor to the Tokio ecosystem.",  allSkills: ["Rust", "C++", "WASM", "Linux", "Embedded"], mutualConnections: 3, sentAt: "2025-04-08T14:00:00Z" },
];

const MOCK_COMMUNITY_REQUESTS: CommunityRequest[] = [
  { userId: "u4", username: "zoey_codes",   about: "Frontend dev passionate about design systems.", allSkills: ["React", "Figma", "CSS", "Next.js"], communityId: "c1", communityName: "React & Next.js Builders", communityIcon: "⚛️", communityMembers: 4821, sentAt: "2025-04-11T09:00:00Z" },
  { userId: "u5", username: "miradev",      about: "Open-source contributor and backend architect.", allSkills: ["Go", "Docker", "Kubernetes", "gRPC"],  communityId: "c1", communityName: "React & Next.js Builders", communityIcon: "⚛️", communityMembers: 4821, sentAt: "2025-04-10T15:00:00Z" },
  { userId: "u6", username: "deepak_ml",    about: "Data scientist and Kaggle grandmaster.", allSkills: ["Python", "TensorFlow", "XGBoost", "SQL"],  communityId: "c2", communityName: "ML & AI Practitioners",   communityIcon: "🤖", communityMembers: 6500, sentAt: "2025-04-10T11:00:00Z" },
  { userId: "u7", username: "sara_eth",     about: "Blockchain dev building DeFi protocols on Ethereum.",  allSkills: ["Solidity", "Hardhat", "Ethers.js"],  communityId: "c2", communityName: "ML & AI Practitioners",   communityIcon: "🤖", communityMembers: 6500, sentAt: "2025-04-09T16:00:00Z" },
];

const MOCK_STATS = { connections: 428, profileViews: 1200, communitiesAdmin: 2 };

const avatarGradients = [
  "from-violet-500 to-fuchsia-500", "from-cyan-500 to-blue-500",
  "from-fuchsia-500 to-pink-500",   "from-amber-500 to-orange-500",
  "from-green-500 to-emerald-500",  "from-blue-500 to-violet-500",
  "from-rose-500 to-fuchsia-500",   "from-teal-500 to-cyan-500",
];

function ago(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)   return "just now";
  if (m < 60)  return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24)  return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function useInView(threshold = 0.08) {
  const ref = useRef<HTMLDivElement>(null);
  const [v, setV] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setV(true); o.disconnect(); } }, { threshold });
    o.observe(el); return () => o.disconnect();
  }, [threshold]);
  return { ref, inView: v };
}

// ─── Shared skill chip ────────────────────────────────────────────────────────
function SkillChip({ label, darkMode }: { label: string; darkMode: boolean }) {
  return (
    <span className={`text-[11px] px-2.5 py-0.5 rounded-full border font-medium ${darkMode ? "bg-gray-700/60 border-gray-600 text-gray-300" : "bg-gray-50 border-gray-200 text-gray-600"}`}>
      {label}
    </span>
  );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({ username, size = "md", index = 0 }: { username: string; size?: "sm" | "md" | "lg"; index?: number }) {
  const sz = size === "sm" ? "w-9 h-9 text-xs" : size === "lg" ? "w-14 h-14 text-lg" : "w-11 h-11 text-sm";
  return (
    <div className={`${sz} rounded-xl bg-gradient-to-br ${avatarGradients[index % avatarGradients.length]} flex items-center justify-center font-bold text-white shrink-0`}>
      {username.slice(0, 2).toUpperCase()}
    </div>
  );
}

// ─── Connection Request Card ──────────────────────────────────────────────────
function ConnectionCard({ req, idx, darkMode, onAccept, onDecline }: {
  req: ConnectionRequest; idx: number; darkMode: boolean;
  onAccept: (id: string) => void; onDecline: (id: string) => void;
}) {
  const { ref, inView } = useInView();
  const [acting, setActing] = useState<"accept" | "decline" | null>(null);
  const cardBg    = darkMode ? "bg-gray-800 border-gray-700/60" : "bg-white border-gray-200";
  const mutedText = darkMode ? "text-gray-400" : "text-gray-500";
  const headingText = darkMode ? "text-white" : "text-gray-900";
  const accentGradient = "from-violet-500 via-fuchsia-500 to-cyan-400";

  async function accept() {
    setActing("accept");
    await new Promise(r => setTimeout(r, 350));
    onAccept(req.id);
  }
  async function decline() {
    setActing("decline");
    await new Promise(r => setTimeout(r, 350));
    onDecline(req.id);
  }

  return (
    <div ref={ref}
      className={`group relative rounded-2xl border transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl overflow-hidden ${cardBg} ${darkMode ? "hover:border-violet-500/40 hover:shadow-violet-500/5" : "hover:border-violet-300 hover:shadow-violet-100"}`}
      style={{ opacity: inView ? 1 : 0, transform: inView ? "none" : "translateY(24px)", transition: `opacity 0.5s ease ${idx * 0.08}s, transform 0.5s ease ${idx * 0.08}s, box-shadow 0.2s, border-color 0.2s` }}
    >
      {/* Gradient accent bar */}
      <div className={`absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r ${accentGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

      <div className="p-5">
        <div className="flex gap-4">
          <Avatar username={req.username} index={idx} />

          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-start justify-between gap-2 mb-1">
              <div>
                <h3 className={`font-bold text-sm ${headingText}`}>{req.username}</h3>
                {req.mutualConnections && (
                  <p className={`text-[11px] flex items-center gap-1 mt-0.5 ${darkMode ? "text-violet-400" : "text-violet-600"}`}>
                    <UserCheck className="w-3 h-3" /> {req.mutualConnections} mutual connections
                  </p>
                )}
              </div>
              {req.sentAt && <span className={`text-[11px] shrink-0 ${mutedText}`}>{ago(req.sentAt)}</span>}
            </div>

            {/* About */}
            <p className={`text-xs leading-relaxed mb-3 line-clamp-2 ${mutedText}`}>{req.about}</p>

            {/* Skills */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {req.allSkills.slice(0, 5).map(s => <SkillChip key={s} label={s} darkMode={darkMode} />)}
              {req.allSkills.length > 5 && <span className={`text-[11px] ${mutedText}`}>+{req.allSkills.length - 5}</span>}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button onClick={accept} disabled={!!acting}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all hover:scale-[1.02] active:scale-[0.97] ${
                  acting === "accept"
                    ? "bg-green-500/20 text-green-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-sm shadow-green-500/20 hover:shadow-green-500/40"
                }`}>
                <Check className="w-3.5 h-3.5" />
                {acting === "accept" ? "Accepting…" : "Accept"}
              </button>
              <button onClick={decline} disabled={!!acting}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold border transition-all hover:scale-[1.02] active:scale-[0.97] ${
                  acting === "decline"
                    ? `${darkMode ? "bg-gray-700" : "bg-gray-100"} cursor-not-allowed opacity-50`
                    : `${darkMode ? "border-gray-600 text-gray-400 hover:bg-gray-700 hover:text-gray-200" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`
                }`}>
                <X className="w-3.5 h-3.5" />
                {acting === "decline" ? "Declining…" : "Decline"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Community Request Card ───────────────────────────────────────────────────
function CommunityCard({ req, idx, darkMode, onAccept, onDecline }: {
  req: CommunityRequest; idx: number; darkMode: boolean;
  onAccept: (userId: string, communityId: string) => void;
  onDecline: (userId: string, communityId: string) => void;
}) {
  const { ref, inView } = useInView();
  const [acting, setActing] = useState<"accept" | "decline" | null>(null);
  const cardBg    = darkMode ? "bg-gray-800 border-gray-700/60" : "bg-white border-gray-200";
  const mutedText = darkMode ? "text-gray-400" : "text-gray-500";
  const headingText = darkMode ? "text-white" : "text-gray-900";
  const accentGradient = "from-violet-500 via-fuchsia-500 to-cyan-400";

  async function accept() {
    setActing("accept");
    await new Promise(r => setTimeout(r, 350));
    onAccept(req.userId, req.communityId);
  }
  async function decline() {
    setActing("decline");
    await new Promise(r => setTimeout(r, 350));
    onDecline(req.userId, req.communityId);
  }

  return (
    <div ref={ref}
      className={`group relative rounded-2xl border transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl overflow-hidden ${cardBg} ${darkMode ? "hover:border-fuchsia-500/40 hover:shadow-fuchsia-500/5" : "hover:border-fuchsia-300 hover:shadow-fuchsia-100"}`}
      style={{ opacity: inView ? 1 : 0, transform: inView ? "none" : "translateY(24px)", transition: `opacity 0.5s ease ${idx * 0.08}s, transform 0.5s ease ${idx * 0.08}s, box-shadow 0.2s, border-color 0.2s` }}
    >
      <div className={`absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-fuchsia-500 via-violet-500 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

      <div className="p-5">
        {/* Community badge */}
        <div className={`flex items-center gap-2 mb-4 pb-3 border-b ${darkMode ? "border-gray-700/50" : "border-gray-100"}`}>
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm border ${darkMode ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-200"}`}>
            {req.communityIcon ?? "💬"}
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-[11px] font-semibold truncate ${darkMode ? "text-fuchsia-400" : "text-fuchsia-600"}`}>{req.communityName}</p>
            <p className={`text-[10px] ${mutedText}`}>{req.communityMembers?.toLocaleString()} members</p>
          </div>
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${darkMode ? "bg-fuchsia-500/15 text-fuchsia-400 border border-fuchsia-500/30" : "bg-fuchsia-50 text-fuchsia-600 border border-fuchsia-200"}`}>Admin</span>
        </div>

        <div className="flex gap-4">
          <Avatar username={req.username} index={idx + 3} />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className={`font-bold text-sm ${headingText}`}>{req.username}</h3>
              {req.sentAt && <span className={`text-[11px] shrink-0 ${mutedText}`}>{ago(req.sentAt)}</span>}
            </div>
            {req.about && <p className={`text-xs leading-relaxed mb-3 line-clamp-2 ${mutedText}`}>{req.about}</p>}
            {req.allSkills && req.allSkills.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {req.allSkills.slice(0, 4).map(s => <SkillChip key={s} label={s} darkMode={darkMode} />)}
                {req.allSkills.length > 4 && <span className={`text-[11px] ${mutedText}`}>+{req.allSkills.length - 4}</span>}
              </div>
            )}
            <div className="flex gap-2">
              <button onClick={accept} disabled={!!acting}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all hover:scale-[1.02] active:scale-[0.97] ${
                  acting === "accept"
                    ? "bg-green-500/20 text-green-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-sm shadow-green-500/20 hover:shadow-green-500/40"
                }`}>
                <Check className="w-3.5 h-3.5" />
                {acting === "accept" ? "Approving…" : "Approve"}
              </button>
              <button onClick={decline} disabled={!!acting}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold border transition-all hover:scale-[1.02] active:scale-[0.97] ${
                  acting === "decline"
                    ? `${darkMode ? "bg-gray-700" : "bg-gray-100"} cursor-not-allowed opacity-50`
                    : `${darkMode ? "border-gray-600 text-gray-400 hover:bg-gray-700 hover:text-gray-200" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`
                }`}>
                <X className="w-3.5 h-3.5" />
                {acting === "decline" ? "Declining…" : "Decline"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyState({ type, darkMode }: { type: "connections" | "community"; darkMode: boolean }) {
  const mutedText   = darkMode ? "text-gray-400" : "text-gray-500";
  const headingText = darkMode ? "text-white"    : "text-gray-900";
  const cardBg      = darkMode ? "bg-gray-800/50 border-gray-700" : "bg-gray-50 border-gray-200";
  const accentGradient = "from-violet-500 via-fuchsia-500 to-cyan-400";
  const icon = type === "connections" ? "🤝" : "💬";
  const title = type === "connections" ? "No connection requests" : "No community requests";
  const desc  = type === "connections"
    ? "You're all caught up! New connection requests will appear here."
    : "No one is waiting to join your communities right now.";

  return (
    <div className={`rounded-2xl border p-10 text-center ${cardBg}`}>
      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${accentGradient} flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg shadow-violet-500/20`}>{icon}</div>
      <h3 className={`text-base font-bold mb-2 ${headingText}`}>{title}</h3>
      <p className={`text-sm ${mutedText} max-w-xs mx-auto`}>{desc}</p>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function InboxPage() {
  const darkMode = useAppSelector((state: any) => state.Theme.darkMode);

  const [connections,  setConnections]  = useState<ConnectionRequest[]>(MOCK_CONNECTIONS);
  const [communityReqs,setCommunityReqs] = useState<CommunityRequest[]>(MOCK_COMMUNITY_REQUESTS);
  const [loading, setLoading]           = useState(false);
  const [activeTab, setActiveTab]       = useState<"all" | "connections" | "community">("all");
  const [search, setSearch]             = useState("");
  const [mounted, setMounted]           = useState(false);

  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    // Replace with real API calls:
    // const [connRes, commRes] = await Promise.all([getPendingRequests(), getCommunityPendingRequests()]);
    // processPendingRequests(connRes); setCommunityReqs(commRes.data);
    setLoading(false);
  }, []);

  // ── Actions ────────────────────────────────────────────────────────────────
  function acceptConnection(id: string) {
    // await approveConnectionRequest(id);
    setConnections(p => p.filter(r => r.id !== id));
    toast.success("Connection accepted! 🎉");
  }
  function declineConnection(id: string) {
    setConnections(p => p.filter(r => r.id !== id));
    toast.info("Request declined");
  }
  function acceptCommunity(userId: string, communityId: string) {
    // await approveDiscussionRequest(communityId, userId);
    setCommunityReqs(p => p.filter(r => !(r.userId === userId && r.communityId === communityId)));
    toast.success("Member approved! 🎉");
  }
  function declineCommunity(userId: string, communityId: string) {
    setCommunityReqs(p => p.filter(r => !(r.userId === userId && r.communityId === communityId)));
    toast.info("Request declined");
  }

  // ── Bulk actions ───────────────────────────────────────────────────────────
  function acceptAllConnections() { connections.forEach(r => acceptConnection(r.id)); }
  function acceptAllCommunity()   { communityReqs.forEach(r => acceptCommunity(r.userId, r.communityId)); }

  // ── Filtered data ──────────────────────────────────────────────────────────
  const q = search.toLowerCase();
  const filteredConn = connections.filter(r => !q || r.username.toLowerCase().includes(q) || r.allSkills.some(s => s.toLowerCase().includes(q)));
  const filteredComm = communityReqs.filter(r => !q || r.username.toLowerCase().includes(q) || r.communityName.toLowerCase().includes(q) || (r.allSkills ?? []).some(s => s.toLowerCase().includes(q)));

  // ── Group community requests by community ─────────────────────────────────
  const communityGroups = filteredComm.reduce<Record<string, { name: string; icon?: string; members?: number; requests: CommunityRequest[] }>>((acc, r) => {
    if (!acc[r.communityId]) acc[r.communityId] = { name: r.communityName, icon: r.communityIcon, members: r.communityMembers, requests: [] };
    acc[r.communityId].requests.push(r);
    return acc;
  }, {});

  const totalPending = connections.length + communityReqs.length;

  // ── Theme tokens ──────────────────────────────────────────────────────────
  const bg          = darkMode ? "bg-gray-900 text-white"       : "bg-white text-gray-800";
  const cardBg      = darkMode ? "bg-gray-800 border-gray-700"  : "bg-white border-gray-200";
  const surfaceBg   = darkMode ? "bg-gray-800/30"               : "bg-gray-50";
  const mutedText   = darkMode ? "text-gray-400"                : "text-gray-500";
  const headingText = darkMode ? "text-white"                   : "text-gray-900";
  const divider     = darkMode ? "border-gray-800"              : "border-gray-200";
  const accentGradient = "from-violet-500 via-fuchsia-500 to-cyan-400";
  const accentText     = "bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent";

  const tabs = [
    { key: "all",         label: "All",         count: totalPending                  },
    { key: "connections", label: "Connections", count: connections.length,  icon: Users          },
    { key: "community",   label: "Communities", count: communityReqs.length, icon: MessageSquare },
  ] as const;

  if (loading) return (
    <div className={`min-h-screen ${bg} flex items-center justify-center`}>
      <div className="space-y-4 w-full max-w-2xl mx-auto px-6 animate-pulse">
        {[1, 2, 3].map(i => <div key={i} className={`h-36 rounded-2xl ${darkMode ? "bg-gray-800" : "bg-gray-100"}`} />)}
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen ${bg} transition-colors duration-300 font-sans`}>

      {/* ── HERO ── */}
      <section className={`relative overflow-hidden border-b ${divider}`}>
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `linear-gradient(${darkMode ? "#fff" : "#000"} 1px, transparent 1px), linear-gradient(90deg, ${darkMode ? "#fff" : "#000"} 1px, transparent 1px)`, backgroundSize: "50px 50px" }} />
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/3 w-64 h-64 bg-fuchsia-500/10 rounded-full blur-3xl pointer-events-none" />

        <div ref={heroRef} className="relative max-w-4xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6"
            style={{ opacity: mounted ? 1 : 0, transform: mounted ? "none" : "translateY(20px)", transition: "opacity 0.6s ease, transform 0.6s ease" }}>
            <div>
              <div className={`inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full border text-xs font-medium ${darkMode ? "bg-violet-500/10 border-violet-500/30 text-violet-300" : "bg-violet-50 border-violet-200 text-violet-600"}`}>
                <Bell className="w-3.5 h-3.5" />
                {totalPending > 0 ? `${totalPending} notification${totalPending !== 1 ? "s" : ""} need your attention` : "You're all caught up!"}
              </div>
              <h1 className={`text-4xl md:text-5xl font-extrabold tracking-tight leading-tight mb-2 ${headingText}`}>
                Your <span className={accentText}>Inbox</span>
              </h1>
              <p className={`text-sm ${mutedText}`}>
                Manage connection requests and community membership approvals in one place.
              </p>
            </div>

            {/* Stats */}
            <div className="flex gap-3 shrink-0">
              {[
                { label: "Pending",     value: totalPending,                 accent: "violet" },
                { label: "Connections", value: MOCK_STATS.connections,       accent: "cyan"   },
                { label: "Profile views",value: `${(MOCK_STATS.profileViews / 1000).toFixed(1)}K`, accent: "fuchsia" },
              ].map((s, i) => (
                <div key={s.label} className={`text-center px-4 py-3 rounded-xl border min-w-[80px] ${cardBg}`}
                  style={{ opacity: mounted ? 1 : 0, transform: mounted ? "none" : "translateY(16px)", transition: `opacity 0.5s ease ${i * 0.1 + 0.2}s, transform 0.5s ease ${i * 0.1 + 0.2}s` }}>
                  <div className={`text-2xl font-extrabold tracking-tight bg-gradient-to-r ${
                    s.accent === "violet"  ? "from-violet-400 to-fuchsia-400" :
                    s.accent === "cyan"    ? "from-cyan-400 to-blue-400" :
                    "from-fuchsia-400 to-pink-400"
                  } bg-clip-text text-transparent`}>{s.value}</div>
                  <div className={`text-[11px] mt-0.5 ${mutedText}`}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CONTROLS ── */}
      <div className={`sticky top-0 z-40 border-b ${divider} ${darkMode ? "bg-gray-900/90" : "bg-white/90"} backdrop-blur-md`}>
        <div className="max-w-4xl mx-auto px-6 py-3 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          {/* Tabs */}
          <div className={`flex items-center gap-1 p-1 rounded-xl ${darkMode ? "bg-gray-800" : "bg-gray-100"}`}>
            {tabs.map(({ key, label, count }) => (
              <button key={key} onClick={() => setActiveTab(key)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  activeTab === key
                    ? `bg-gradient-to-r ${accentGradient} text-white shadow-sm`
                    : `${darkMode ? "text-gray-400 hover:text-gray-200" : "text-gray-500 hover:text-gray-700"}`
                }`}>
                {label}
                {count > 0 && (
                  <span className={`min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    activeTab === key ? "bg-white/25 text-white" : `${darkMode ? "bg-gray-700 text-gray-400" : "bg-gray-200 text-gray-500"}`
                  }`}>{count}</span>
                )}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative flex-1 sm:max-w-xs">
            <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 ${mutedText}`} />
            <input type="text" placeholder="Search by name, skill, community…" value={search}
              onChange={e => setSearch(e.target.value)}
              className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-xs outline-none transition-all focus:ring-2 focus:ring-violet-500/30 ${darkMode ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-violet-500/60" : "bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-violet-400"}`}
            />
            {search && <button onClick={() => setSearch("")} className={`absolute right-3 top-1/2 -translate-y-1/2 ${mutedText} hover:text-red-400 transition-colors`}><X className="w-3.5 h-3.5" /></button>}
          </div>

          {/* Bulk accept */}
          {totalPending > 0 && (
            <button onClick={() => { if (activeTab === "community") acceptAllCommunity(); else if (activeTab === "connections") acceptAllConnections(); else { acceptAllConnections(); acceptAllCommunity(); } }}
              className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all hover:scale-105 whitespace-nowrap ${darkMode ? "border-green-500/40 text-green-400 hover:bg-green-500/10" : "border-green-300 text-green-600 hover:bg-green-50"}`}>
              <Check className="w-3.5 h-3.5 inline mr-1" />
              Accept all
            </button>
          )}
        </div>
      </div>

      {/* ── CONTENT ── */}
      <main className="max-w-4xl mx-auto px-6 py-8 space-y-10">

        {/* Connection Requests */}
        {(activeTab === "all" || activeTab === "connections") && (
          <section>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${accentGradient} flex items-center justify-center`}>
                  <Users className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className={`text-base font-bold ${headingText}`}>Connection requests</h2>
                  <p className={`text-xs ${mutedText}`}>{filteredConn.length} pending</p>
                </div>
              </div>
              {filteredConn.length > 1 && (
                <button onClick={acceptAllConnections} className={`text-xs font-medium transition-colors ${darkMode ? "text-violet-400 hover:text-violet-300" : "text-violet-600 hover:text-violet-700"}`}>
                  Accept all →
                </button>
              )}
            </div>

            {filteredConn.length === 0
              ? <EmptyState type="connections" darkMode={darkMode} />
              : <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredConn.map((r, i) => (
                    <ConnectionCard key={r.id} req={r} idx={i} darkMode={darkMode} onAccept={acceptConnection} onDecline={declineConnection} />
                  ))}
                </div>
            }
          </section>
        )}

        {/* Community Requests — grouped by community */}
        {(activeTab === "all" || activeTab === "community") && (
          <section>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-xl bg-gradient-to-br from-fuchsia-500 to-cyan-400 flex items-center justify-center`}>
                  <MessageSquare className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className={`text-base font-bold ${headingText}`}>Community join requests</h2>
                  <p className={`text-xs ${mutedText}`}>{filteredComm.length} pending across {Object.keys(communityGroups).length} communities</p>
                </div>
              </div>
              {filteredComm.length > 1 && (
                <button onClick={acceptAllCommunity} className={`text-xs font-medium transition-colors ${darkMode ? "text-fuchsia-400 hover:text-fuchsia-300" : "text-fuchsia-600 hover:text-fuchsia-700"}`}>
                  Approve all →
                </button>
              )}
            </div>

            {filteredComm.length === 0 ? (
              <EmptyState type="community" darkMode={darkMode} />
            ) : (
              <div className="space-y-8">
                {Object.entries(communityGroups).map(([cId, group]) => (
                  <div key={cId}>
                    {/* Community header */}
                    <div className={`flex items-center gap-3 mb-3 px-1`}>
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xl border ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
                        {group.icon ?? "💬"}
                      </div>
                      <div className="flex-1">
                        <h3 className={`text-sm font-bold ${headingText}`}>{group.name}</h3>
                        <p className={`text-[11px] ${mutedText}`}>{group.members?.toLocaleString()} members · {group.requests.length} request{group.requests.length !== 1 ? "s" : ""}</p>
                      </div>
                      <div className={`text-[11px] font-medium px-2.5 py-1 rounded-full border ${darkMode ? "bg-fuchsia-500/15 text-fuchsia-400 border-fuchsia-500/30" : "bg-fuchsia-50 text-fuchsia-600 border-fuchsia-200"}`}>
                        You&apos;re admin
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {group.requests.map((r, i) => (
                        <CommunityCard key={`${r.communityId}-${r.userId}`} req={r} idx={i} darkMode={darkMode}
                          onAccept={acceptCommunity} onDecline={declineCommunity} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* All clear */}
        {totalPending === 0 && !search && (
          <div className={`rounded-2xl border p-14 text-center ${cardBg}`}>
            <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${accentGradient} flex items-center justify-center text-4xl mx-auto mb-5 shadow-xl shadow-violet-500/20`}>✅</div>
            <h2 className={`text-2xl font-extrabold mb-2 ${headingText}`}>All caught up!</h2>
            <p className={`text-sm ${mutedText} max-w-sm mx-auto mb-6`}>
              No pending requests right now. New connection and community requests will show up here.
            </p>
            <button className={`px-8 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r ${accentGradient} text-white shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40 hover:scale-105 transition-all`}>
              Discover developers →
            </button>
          </div>
        )}
      </main>

      <style>{`
        .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
      `}</style>
    </div>
  );
}