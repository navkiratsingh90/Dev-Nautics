"use client";

import { useState, useEffect, useRef } from "react";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import Link from "next/link";

// ─── Types (mirrors your Mongoose schema) ────────────────────────────────────
interface Discussion {
  _id: string;
  groupName: string;
  totalMembers: number;
  createdBy: { _id: string; name: string; avatar?: string };
  joinedMembers: string[];
  admins: string[];
  pendingRequests: string[];
  file?: string;           // emoji or URL
  about?: string;
  onlineMembers: number;
  topics: string[];
  createdAt: string;
  updatedAt: string;
}

// ─── Mock data (replace with your API call) ──────────────────────────────────
const MOCK_DISCUSSIONS: Discussion[] = [
    {
        _id: "1",
        groupName: "React & Next.js Builders",
        totalMembers: 4821,
        onlineMembers: 312,
        createdBy: { _id: "u1", name: "Navkirat Singh" },
        joinedMembers: [],
        admins: [],
        pendingRequests: [],
        file: "⚛️",
        about: "Deep dives into React patterns, server components, hydration quirks, and everything Next.js 14+.",
        topics: ["React", "Next.js", "TypeScript", "RSC"],
        createdAt: "2024-01-10T10:00:00Z",
        updatedAt: "",
    },
    {
        _id: "2",
        groupName: "Systems & Rust Enthusiasts",
        totalMembers: 2130,
        onlineMembers: 98,
        createdBy: { _id: "u2", name: "Alex Kim" },
        joinedMembers: [],
        admins: [],
        pendingRequests: [],
        file: "🦀",
        about: "Low-level programming, memory safety, Rust ownership model, and performance optimization.",
        topics: ["Rust", "C++", "Systems", "WASM"],
        createdAt: "2024-02-03T08:00:00Z",
        updatedAt: "",
    },
    {
        _id: "3",
        groupName: "ML & AI Practitioners",
        totalMembers: 6500,
        onlineMembers: 540,
        createdBy: { _id: "u3", name: "Sophie Zhang" },
        joinedMembers: [],
        admins: [],
        pendingRequests: [],
        file: "🤖",
        about: "Cutting-edge ML research, fine-tuning LLMs, RAG pipelines, and production AI deployment.",
        topics: ["Python", "PyTorch", "LLM", "RAG", "MLOps"],
        createdAt: "2024-01-20T12:00:00Z",
        updatedAt: "",
    },
    {
        _id: "4",
        groupName: "Web3 & Solidity Devs",
        totalMembers: 1870,
        onlineMembers: 75,
        createdBy: { _id: "u4", name: "Marcus Lee" },
        joinedMembers: [],
        admins: [],
        pendingRequests: [],
        file: "🔗",
        about: "Smart contracts, DeFi protocols, NFT standards, and everything happening on-chain.",
        topics: ["Solidity", "Ethereum", "DeFi", "Hardhat"],
        createdAt: "2024-03-01T09:00:00Z",
        updatedAt: "",
    },
    {
        _id: "5",
        groupName: "DevOps & Cloud Architects",
        totalMembers: 3200,
        onlineMembers: 187,
        createdBy: { _id: "u5", name: "Priya Sharma" },
        joinedMembers: [],
        admins: [],
        pendingRequests: [],
        file: "☁️",
        about: "Kubernetes, Terraform, CI/CD pipelines, observability, and cloud-native architecture patterns.",
        topics: ["Kubernetes", "AWS", "Terraform", "Docker"],
        createdAt: "2024-01-15T11:00:00Z",
        updatedAt: "",
    },
    {
        _id: "6",
        groupName: "Open Source Contributors",
        totalMembers: 5100,
        onlineMembers: 420,
        createdBy: { _id: "u6", name: "James Okafor" },
        joinedMembers: [],
        admins: [],
        pendingRequests: [],
        file: "🌍",
        about: "Find projects to contribute to, get your PRs reviewed, and help maintain community-driven tools.",
        topics: ["Git", "OSS", "Contributing", "Docs"],
        createdAt: "2024-02-14T07:00:00Z",
        updatedAt: "",
    },
    {
        _id: "7",
        groupName: "Mobile Dev (iOS & Android)",
        totalMembers: 2780,
        onlineMembers: 143,
        createdBy: { _id: "u7", name: "Rina Tanaka" },
        joinedMembers: [],
        admins: [],
        pendingRequests: [],
        file: "📱",
        about: "Swift, Kotlin, Flutter, React Native — building beautiful mobile experiences across platforms.",
        topics: ["Swift", "Kotlin", "Flutter", "React Native"],
        createdAt: "2024-02-28T10:30:00Z",
        updatedAt: "",
    },
    {
        _id: "8",
        groupName: "Database & Backend Design",
        totalMembers: 3450,
        onlineMembers: 210,
        createdBy: { _id: "u8", name: "Carlos Vega" },
        joinedMembers: [],
        admins: [],
        pendingRequests: [],
        file: "🗄️",
        about: "Schema design, query optimization, caching strategies, and picking the right database for the job.",
        topics: ["PostgreSQL", "MongoDB", "Redis", "GraphQL"],
        createdAt: "2024-03-05T14:00:00Z",
        updatedAt: "",
    },
    {
        _id: "9",
        groupName: "UI/UX & Design Systems",
        totalMembers: 1950,
        onlineMembers: 88,
        createdBy: { _id: "u9", name: "Fatima Al-Hassan" },
        joinedMembers: [],
        admins: [],
        pendingRequests: [],
        file: "🎨",
        about: "Design tokens, accessibility, component libraries, Figma workflows, and motion design principles.",
        topics: ["Tailwind", "Figma", "a11y", "Storybook"],
        createdAt: "2024-03-10T09:00:00Z",
        updatedAt: "",
    },
];

const ALL_TOPICS = ["React", "Next.js", "TypeScript", "Rust", "Python", "Node.js", "Go", "Flutter", "Solidity", "Kubernetes", "Docker", "GraphQL", "PostgreSQL", "MongoDB", "AWS", "OSS"];

function useInView(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const d = Math.floor(diff / 86400000);
  if (d === 0) return "today";
  if (d === 1) return "yesterday";
  if (d < 30) return `${d}d ago`;
  return `${Math.floor(d / 30)}mo ago`;
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function DiscussionCard({
  d, darkMode, index, joined, onJoin, onRequest,
}: {
  d: Discussion; darkMode: boolean; index: number; joined: boolean;
  onJoin: (id: string) => void; onRequest: (id: string) => void;
}) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.08 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const accentGradient = "from-violet-500 via-fuchsia-500 to-cyan-400";
  const cardBg  = darkMode ? "bg-gray-800 border-gray-700/60 hover:border-violet-500/40" : "bg-white border-gray-200 hover:border-violet-300";
  const mutedText = darkMode ? "text-gray-400" : "text-gray-500";
  const headingText = darkMode ? "text-white" : "text-gray-900";
  const topicBg = darkMode ? "bg-gray-700/70 text-gray-300 border-gray-600" : "bg-gray-100 text-gray-600 border-gray-200";

  return (
    <div
      ref={ref}
      className={`group relative rounded-2xl border p-5 flex flex-col gap-4 transition-all duration-300 cursor-default ${cardBg} hover:shadow-xl hover:shadow-violet-500/5 hover:-translate-y-0.5`}
      style={{ opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(28px)", transition: `opacity 0.55s ease ${index * 0.06}s, transform 0.55s ease ${index * 0.06}s, box-shadow 0.2s, border-color 0.2s` }}
    >
      {/* Top accent line on hover */}
      <div className={`absolute inset-x-0 top-0 h-0.5 rounded-t-2xl bg-gradient-to-r ${accentGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

      {/* Header row */}
      <div className="flex items-start gap-3">
        {/* Icon / Emoji */}
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 border ${darkMode ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-200"}`}>
          {d.file && d.file.startsWith("http") ? (
            <img src={d.file} alt={d.groupName} className="w-8 h-8 rounded-md object-cover" />
          ) : (
            <span>{d.file ?? "💬"}</span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className={`font-bold text-sm leading-tight ${headingText}`}>{d.groupName}</h3>
            {d.onlineMembers > 200 && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/15 text-green-400 font-medium border border-green-500/20">🔥 Active</span>
            )}
          </div>
          <div className={`flex items-center gap-3 mt-1 text-xs ${mutedText}`}>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block animate-pulse" />
              {d.onlineMembers.toLocaleString()} online
            </span>
            <span>·</span>
            <span>{d.totalMembers.toLocaleString()} members</span>
            <span>·</span>
            <span>Created {timeAgo(d.createdAt)}</span>
          </div>
        </div>
      </div>

      {/* About */}
      {d.about && (
        <p className={`text-xs leading-relaxed ${mutedText} line-clamp-2`}>{d.about}</p>
      )}

      {/* Topics */}
      {d.topics.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {d.topics.slice(0, 4).map((t) => (
            <span key={t} className={`text-[11px] px-2 py-0.5 rounded-full border font-medium ${topicBg}`}>{t}</span>
          ))}
          {d.topics.length > 4 && (
            <span className={`text-[11px] px-2 py-0.5 rounded-full border font-medium ${topicBg}`}>+{d.topics.length - 4}</span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className={`flex items-center justify-between pt-3 border-t ${darkMode ? "border-gray-700/50" : "border-gray-100"}`}>
        <div className={`flex items-center gap-1.5 text-xs ${mutedText}`}>
          <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold ${darkMode ? "bg-gray-600 text-gray-300" : "bg-gray-200 text-gray-600"}`}>
            {d.createdBy.name[0]}
          </div>
          <span>{d.createdBy.name}</span>
        </div>

        {joined ? (
          <Link href={`/chatrooms/${d._id}`}>
            <button className={`text-xs font-semibold px-4 py-1.5 rounded-lg bg-gradient-to-r ${accentGradient} text-white hover:scale-105 transition-all shadow-sm shadow-violet-500/20`}>
              Enter →
            </button>
          </Link>
        ) : (
          <button
            onClick={() => onJoin(d._id)}
            className={`text-xs font-semibold px-4 py-1.5 rounded-lg border transition-all hover:scale-105 ${darkMode ? "border-violet-500/50 text-violet-400 hover:bg-violet-500/10" : "border-violet-300 text-violet-600 hover:bg-violet-50"}`}
          >
            + Join
          </button>
        )}
      </div>
    </div>
  );
}

function CreateGroupModal({ darkMode, onClose, onCreate }: { darkMode: boolean; onClose: () => void; onCreate: (g: Partial<Discussion>) => void }) {
  const [form, setForm] = useState({ groupName: "", about: "", file: "", topics: "" });
  const [error, setError] = useState("");
  const overlayRef = useRef<HTMLDivElement>(null);

  const accentGradient = "from-violet-500 via-fuchsia-500 to-cyan-400";
  const inputCls = `w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all focus:ring-2 focus:ring-violet-500/40 ${darkMode ? "bg-gray-700/60 border-gray-600 text-white placeholder-gray-500" : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400"}`;
  const labelCls = `block text-xs font-semibold mb-1.5 ${darkMode ? "text-gray-300" : "text-gray-700"}`;

  function handleSubmit() {
    if (!form.groupName.trim()) { setError("Group name is required."); return; }
    onCreate({ groupName: form.groupName, about: form.about, file: form.file || "💬", topics: form.topics.split(",").map(t => t.trim()).filter(Boolean), totalMembers: 1, onlineMembers: 1, createdAt: new Date().toISOString(), updatedAt: "", _id: Math.random().toString(36).slice(2), joinedMembers: [], admins: [], pendingRequests: [], createdBy: { _id: "me", name: "You" } });
    onClose();
  }

  return (
    <div ref={overlayRef} className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}>
      <div className={`w-full max-w-md rounded-2xl border p-6 shadow-2xl ${darkMode ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"}`}
        style={{ animation: "scaleIn 0.2s ease both" }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className={`text-lg font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>Create a chatroom</h2>
            <p className={`text-xs mt-0.5 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Build a space around a topic you care about</p>
          </div>
          <button onClick={onClose} className={`w-8 h-8 rounded-full flex items-center justify-center text-lg transition-colors ${darkMode ? "hover:bg-gray-700 text-gray-400" : "hover:bg-gray-100 text-gray-500"}`}>×</button>
        </div>

        <div className="space-y-4">
          <div>
            <label className={labelCls}>Group icon (emoji or URL)</label>
            <input className={inputCls} placeholder="e.g. 🚀 or https://..." value={form.file} onChange={e => setForm(f => ({ ...f, file: e.target.value }))} />
          </div>
          <div>
            <label className={labelCls}>Group name <span className="text-red-400">*</span></label>
            <input className={inputCls} placeholder="e.g. TypeScript Wizards" value={form.groupName} onChange={e => { setForm(f => ({ ...f, groupName: e.target.value })); setError(""); }} />
            {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
          </div>
          <div>
            <label className={labelCls}>About</label>
            <textarea className={`${inputCls} resize-none`} rows={3} placeholder="What's this group about?" value={form.about} onChange={e => setForm(f => ({ ...f, about: e.target.value }))} />
          </div>
          <div>
            <label className={labelCls}>Topics <span className={`font-normal ${darkMode ? "text-gray-500" : "text-gray-400"}`}>(comma-separated)</span></label>
            <input className={inputCls} placeholder="React, TypeScript, Next.js" value={form.topics} onChange={e => setForm(f => ({ ...f, topics: e.target.value }))} />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all ${darkMode ? "border-gray-600 text-gray-400 hover:bg-gray-800" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}>Cancel</button>
          <button onClick={handleSubmit} className={`flex-1 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r ${accentGradient} text-white hover:shadow-lg hover:shadow-violet-500/30 transition-all hover:scale-105 active:scale-95`}>Create Group</button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function DiscussionsPage() {
  const darkMode = useAppSelector((state: any) => state.Theme.darkMode);

  const [discussions, setDiscussions] = useState<Discussion[]>(MOCK_DISCUSSIONS);
  const [search, setSearch] = useState("");
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"members" | "online" | "newest">("online");
  const [joinedIds, setJoinedIds] = useState<Set<string>>(new Set(["1", "3"]));
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "joined" | "trending">("all");
  const [mounted, setMounted] = useState(false);

  const heroSection  = useInView();
  const statsSection = useInView();

  useEffect(() => { setMounted(true); }, []);

  // ─── Derived data ────────────────────────────────────────────────
  const filtered = discussions
    .filter(d => {
      const q = search.toLowerCase();
      const matchSearch = !q || d.groupName.toLowerCase().includes(q) || d.about?.toLowerCase().includes(q) || d.topics.some(t => t.toLowerCase().includes(q));
      const matchTopic  = !selectedTopic || d.topics.includes(selectedTopic);
      const matchTab    = activeTab === "all" ? true : activeTab === "joined" ? joinedIds.has(d._id) : d.onlineMembers > 150;
      return matchSearch && matchTopic && matchTab;
    })
    .sort((a, b) => sortBy === "members" ? b.totalMembers - a.totalMembers : sortBy === "online" ? b.onlineMembers - a.onlineMembers : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const totalOnline = discussions.reduce((s, d) => s + d.onlineMembers, 0);
  const totalMembers = discussions.reduce((s, d) => s + d.totalMembers, 0);

  // ─── Theme ───────────────────────────────────────────────────────
  const bg          = darkMode ? "bg-gray-900 text-white"       : "bg-white text-gray-800";
  const surfaceBg   = darkMode ? "bg-gray-800/40"               : "bg-gray-50";
  const cardBg      = darkMode ? "bg-gray-800 border-gray-700"  : "bg-white border-gray-200";
  const mutedText   = darkMode ? "text-gray-400"                : "text-gray-500";
  const headingText = darkMode ? "text-white"                   : "text-gray-900";
  const divider     = darkMode ? "border-gray-800"              : "border-gray-200";
  const inputCls    = `w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm outline-none transition-all focus:ring-2 focus:ring-violet-500/40 ${darkMode ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500" : "bg-white border-gray-200 text-gray-900 placeholder-gray-400"}`;
  const accentGradient = "from-violet-500 via-fuchsia-500 to-cyan-400";
  const accentText     = "bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent";

  return (
    <div className={`min-h-screen ${bg} transition-colors duration-300 font-sans`}>

      {/* ── HERO BANNER ── */}
      <section className={`relative overflow-hidden border-b ${divider}`}>
        {/* grid bg */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `linear-gradient(${darkMode ? "#fff" : "#000"} 1px, transparent 1px), linear-gradient(90deg, ${darkMode ? "#fff" : "#000"} 1px, transparent 1px)`, backgroundSize: "50px 50px" }} />
        <div className="absolute top-0 left-1/3 w-72 h-72 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-6 py-14">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div className="max-w-xl" style={{ animation: mounted ? "fadeUp 0.6s ease both" : "none" }}>
              <div className={`inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full border text-xs font-medium ${darkMode ? "bg-violet-500/10 border-violet-500/30 text-violet-300" : "bg-violet-50 border-violet-200 text-violet-600"}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block" />
                {totalOnline.toLocaleString()} developers online now
              </div>
              <h1 className={`text-4xl md:text-5xl font-extrabold tracking-tight leading-tight mb-3 ${headingText}`}>
                Join the <span className={accentText}>Community</span>
              </h1>
              <p className={`text-base ${mutedText} leading-relaxed`}>
                Topic-based chatrooms for every tech stack. Find your community, share knowledge, get help, and build in public.
              </p>
            </div>

            {/* Quick stats */}
            <div ref={statsSection.ref} className="grid grid-cols-3 gap-4 lg:gap-6">
              {[
                { value: discussions.length, label: "Rooms", suffix: "" },
                { value: totalMembers, label: "Members", suffix: "+" },
                { value: totalOnline, label: "Online", suffix: "" },
              ].map((s, i) => (
                <div key={s.label} className={`text-center px-4 py-3 rounded-xl border ${cardBg}`}
                  style={{ opacity: statsSection.inView ? 1 : 0, transform: statsSection.inView ? "none" : "translateY(16px)", transition: `opacity 0.5s ease ${i * 0.1}s, transform 0.5s ease ${i * 0.1}s` }}>
                  <div className={`text-2xl font-extrabold tracking-tight ${accentText}`}>{s.value.toLocaleString()}{s.suffix}</div>
                  <div className={`text-xs mt-0.5 ${mutedText}`}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CONTROLS BAR ── */}
      <div className={`sticky top-0 z-40 border-b ${divider} ${darkMode ? "bg-gray-900/90" : "bg-white/90"} backdrop-blur-md`}>
        <div className="max-w-7xl mx-auto px-6 py-3 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">

          {/* Tabs */}
          <div className={`flex items-center gap-1 p-1 rounded-xl ${darkMode ? "bg-gray-800" : "bg-gray-100"}`}>
            {(["all", "joined", "trending"] as const).map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${activeTab === tab
                  ? `bg-gradient-to-r ${accentGradient} text-white shadow-sm`
                  : `${darkMode ? "text-gray-400 hover:text-gray-200" : "text-gray-500 hover:text-gray-700"}`}`}>
                {tab === "joined" ? `Joined (${joinedIds.size})` : tab}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 flex-1 sm:max-w-sm sm:ml-4">
            {/* Search */}
            <div className="relative flex-1">
              <svg className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${mutedText}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              <input type="text" placeholder="Search rooms, topics..." value={search} onChange={e => setSearch(e.target.value)} className={inputCls} />
            </div>

            {/* Sort */}
            <select value={sortBy} onChange={e => setSortBy(e.target.value as any)}
              className={`px-3 py-2.5 rounded-xl border text-xs font-medium outline-none transition-all ${darkMode ? "bg-gray-800 border-gray-700 text-gray-300" : "bg-white border-gray-200 text-gray-700"}`}>
              <option value="online">By Online</option>
              <option value="members">By Members</option>
              <option value="newest">Newest</option>
            </select>
          </div>

          {/* Create button */}
          <button onClick={() => setShowModal(true)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r ${accentGradient} text-white shadow-md shadow-violet-500/20 hover:shadow-violet-500/40 transition-all hover:scale-105 active:scale-95 whitespace-nowrap`}>
            + Create Room
          </button>
        </div>

        {/* Topic pills */}
        <div className={`max-w-7xl mx-auto px-6 pb-3 flex items-center gap-2 overflow-x-auto scrollbar-hide`}>
          <button onClick={() => setSelectedTopic(null)}
            className={`shrink-0 text-[11px] px-3 py-1 rounded-full border font-medium transition-all ${!selectedTopic
              ? `bg-gradient-to-r ${accentGradient} text-white border-transparent`
              : `${darkMode ? "border-gray-700 text-gray-400 hover:border-gray-500 hover:text-gray-200" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}`}>
            All topics
          </button>
          {ALL_TOPICS.map((t) => (
            <button key={t} onClick={() => setSelectedTopic(selectedTopic === t ? null : t)}
              className={`shrink-0 text-[11px] px-3 py-1 rounded-full border font-medium transition-all ${selectedTopic === t
                ? `bg-gradient-to-r ${accentGradient} text-white border-transparent`
                : `${darkMode ? "border-gray-700 text-gray-400 hover:border-gray-500 hover:text-gray-200" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* ── MAIN GRID ── */}
      <main className="max-w-7xl mx-auto px-6 py-10">

        {/* Result count */}
        <div className={`flex items-center justify-between mb-6`}>
          <p className={`text-sm ${mutedText}`}>
            Showing <span className={`font-semibold ${headingText}`}>{filtered.length}</span> room{filtered.length !== 1 ? "s" : ""}
            {selectedTopic && <> in <span className={`font-semibold ${headingText}`}>{selectedTopic}</span></>}
          </p>
          {joinedIds.size > 0 && (
            <p className={`text-xs ${mutedText}`}>You&apos;ve joined <span className="font-semibold text-violet-400">{joinedIds.size}</span> room{joinedIds.size !== 1 ? "s" : ""}</p>
          )}
        </div>

        {/* Cards grid */}
        {filtered.length === 0 ? (
          <div className="py-24 text-center">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className={`text-lg font-bold mb-2 ${headingText}`}>No rooms found</h3>
            <p className={`text-sm ${mutedText} mb-6`}>Try a different search or topic, or create your own room.</p>
            <button onClick={() => setShowModal(true)} className={`px-6 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r ${accentGradient} text-white hover:scale-105 transition-all`}>Create a room →</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((d, i) => (
              <DiscussionCard
                key={d._id} d={d} darkMode={darkMode} index={i}
                joined={joinedIds.has(d._id)}
                onJoin={(id) => setJoinedIds(prev => { const next = new Set(prev); next.add(id); return next; })}
                onRequest={(id) => console.log("request", id)}
              />
            ))}
          </div>
        )}
      </main>

      {/* ── TRENDING TOPICS SIDEBAR-LIKE SECTION ── */}
      <section className={`border-t ${divider} ${surfaceBg} py-16`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-10">

            {/* Trending topics */}
            <div className="flex-1">
              <h2 className={`text-xl font-bold mb-6 ${headingText}`}>🔥 Trending topics</h2>
              <div className="flex flex-wrap gap-2">
                {ALL_TOPICS.map((t, i) => {
                  const count = discussions.filter(d => d.topics.includes(t)).length;
                  return (
                    <button key={t} onClick={() => { setSelectedTopic(t); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-all hover:scale-105 ${darkMode ? "bg-gray-800 border-gray-700 text-gray-300 hover:border-violet-500/50" : "bg-white border-gray-200 text-gray-700 hover:border-violet-300"}`}>
                      {t}
                      {count > 0 && <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${darkMode ? "bg-gray-700 text-gray-400" : "bg-gray-100 text-gray-500"}`}>{count}</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Most active rooms */}
            <div className="lg:w-72 shrink-0">
              <h2 className={`text-xl font-bold mb-6 ${headingText}`}>⚡ Most active</h2>
              <div className="space-y-3">
                {[...discussions].sort((a, b) => b.onlineMembers - a.onlineMembers).slice(0, 5).map((d, i) => (
                  <div key={d._id} className={`flex items-center gap-3 p-3 rounded-xl border transition-all hover:scale-[1.01] ${cardBg}`}>
                    <span className={`w-6 h-6 flex items-center justify-center text-xs font-bold rounded-lg ${i === 0 ? "bg-amber-500/20 text-amber-400" : darkMode ? "bg-gray-700 text-gray-400" : "bg-gray-100 text-gray-500"}`}>{i + 1}</span>
                    <span className="text-lg">{d.file ?? "💬"}</span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-semibold truncate ${headingText}`}>{d.groupName}</p>
                      <p className={`text-[11px] ${mutedText}`}>{d.onlineMembers} online</p>
                    </div>
                    {!joinedIds.has(d._id) && (
                      <button onClick={() => setJoinedIds(p => { const n = new Set(p); n.add(d._id); return n; })}
                        className={`text-[10px] font-semibold px-2 py-1 rounded-lg border transition-all ${darkMode ? "border-violet-500/40 text-violet-400 hover:bg-violet-500/10" : "border-violet-200 text-violet-600 hover:bg-violet-50"}`}>
                        Join
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CREATE MODAL ── */}
      {showModal && (
        <CreateGroupModal
          darkMode={darkMode}
          onClose={() => setShowModal(false)}
          onCreate={(g) => setDiscussions(prev => [g as Discussion, ...prev])}
        />
      )}

      <style>{`
        @keyframes fadeUp   { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes scaleIn  { from { opacity:0; transform:scale(0.94); }     to { opacity:1; transform:scale(1); } }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        .line-clamp-2 { display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
      `}</style>
    </div>
  );
}