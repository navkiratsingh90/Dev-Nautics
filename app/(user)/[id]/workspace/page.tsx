"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAppSelector } from "@/redux/hooks";
import {
  Plus, Search, X, Users, Clock, CheckCircle,
  TrendingUp, Filter, Star, ArrowRight,
  FolderOpen, ChevronDown, Globe, Lock,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface ProjectMember {
  _id: string; username: string; avatar: string; role: string;
}
export interface Project {
  _id: string; title: string; description: string; category: string;
  status: "Open"|"In Progress"|"On Hold"|"Completed"|"Closed";
  progress: number; visibility: "public"|"private";
  techStack: string[]; members: ProjectMember[]; totalTasks: number;
  completedTasks: number; isStarred: boolean; lastActivity: string;
  createdAt: string; role: string; // current user's role in this project
}

// ─── Mock data ────────────────────────────────────────────────────────────────
const MOCK_PROJECTS: Project[] = [
  {
    _id: "p1", title: "AI Code Assistant", description: "Intelligent code completion using fine-tuned LLMs. Real-time suggestions, contextual completions, and smart refactoring.",
    category: "AI/ML", status: "In Progress", progress: 65, visibility: "public",
    techStack: ["Python", "TypeScript", "FastAPI", "React"], isStarred: true, lastActivity: "2h ago", createdAt: "2025-01-10",
    totalTasks: 12, completedTasks: 7, role: "Project Lead",
    members: [{ _id: "u1", username: "alexj", avatar: "AJ", role: "Project Lead" }, { _id: "u2", username: "sarah_k", avatar: "SK", role: "Frontend Dev" }, { _id: "u3", username: "mikeR", avatar: "MR", role: "Backend Dev" }, { _id: "u4", username: "emmaW", avatar: "EW", role: "ML Engineer" }],
  },
  {
    _id: "p2", title: "Decentralized Marketplace", description: "P2P gig economy on Ethereum. Smart contract escrow, reputation system, zero platform fees.",
    category: "Blockchain", status: "In Progress", progress: 40, visibility: "public",
    techStack: ["Solidity", "Next.js", "Hardhat", "IPFS"], isStarred: false, lastActivity: "1d ago", createdAt: "2025-02-05",
    totalTasks: 18, completedTasks: 7, role: "Frontend Dev",
    members: [{ _id: "u5", username: "alex_eth", avatar: "AE", role: "Lead" }, { _id: "u1", username: "alexj", avatar: "AJ", role: "Frontend Dev" }, { _id: "u6", username: "priya_s", avatar: "PS", role: "Blockchain Dev" }],
  },
  {
    _id: "p3", title: "Smart Campus IoT Dashboard", description: "Unified IoT platform for university campuses — energy monitoring, smart attendance, and predictive maintenance.",
    category: "IoT", status: "Open", progress: 15, visibility: "private",
    techStack: ["MQTT", "React", "InfluxDB", "Raspberry Pi"], isStarred: true, lastActivity: "3d ago", createdAt: "2025-03-01",
    totalTasks: 9, completedTasks: 1, role: "Backend Dev",
    members: [{ _id: "u7", username: "rina_iot", avatar: "RI", role: "Lead" }, { _id: "u1", username: "alexj", avatar: "AJ", role: "Backend Dev" }, { _id: "u8", username: "carlos_v", avatar: "CV", role: "IoT Engineer" }],
  },
  {
    _id: "p4", title: "react-hot-key Library", description: "Open-source keyboard shortcut library for React. Zero deps, full TypeScript support, intuitive API.",
    category: "Web Dev", status: "Completed", progress: 100, visibility: "public",
    techStack: ["TypeScript", "React", "Rollup", "Jest"], isStarred: false, lastActivity: "1w ago", createdAt: "2024-11-15",
    totalTasks: 14, completedTasks: 14, role: "Project Lead",
    members: [{ _id: "u1", username: "alexj", avatar: "AJ", role: "Project Lead" }, { _id: "u9", username: "james_b", avatar: "JB", role: "Contributor" }],
  },
  {
    _id: "p5", title: "Cross-Platform Fitness App", description: "Social fitness companion with AI workout generation, real-time multiplayer challenges, and health platform integrations.",
    category: "App Dev", status: "On Hold", progress: 30, visibility: "private",
    techStack: ["Flutter", "Dart", "Firebase", "TF Lite"], isStarred: false, lastActivity: "2w ago", createdAt: "2025-02-20",
    totalTasks: 20, completedTasks: 6, role: "Contributor",
    members: [{ _id: "u10", username: "zoey_c", avatar: "ZC", role: "Lead" }, { _id: "u1", username: "alexj", avatar: "AJ", role: "Contributor" }, { _id: "u11", username: "tom_w", avatar: "TW", role: "Mobile Dev" }, { _id: "u12", username: "ana_p", avatar: "AP", role: "Designer" }],
  },
];

// ─── Config ───────────────────────────────────────────────────────────────────
const statusConfig: Record<string, { dot: string; cls: (d: boolean) => string }> = {
  "Open":        { dot: "bg-green-400 animate-pulse", cls: d => d ? "bg-green-500/15 text-green-400 border-green-500/30"  : "bg-green-50 text-green-600 border-green-200"  },
  "In Progress": { dot: "bg-blue-400 animate-pulse",  cls: d => d ? "bg-blue-500/15 text-blue-400 border-blue-500/30"    : "bg-blue-50 text-blue-600 border-blue-200"    },
  "On Hold":     { dot: "bg-amber-400",               cls: d => d ? "bg-amber-500/15 text-amber-400 border-amber-500/30" : "bg-amber-50 text-amber-600 border-amber-200" },
  "Completed":   { dot: "bg-gray-400",                cls: d => d ? "bg-gray-500/15 text-gray-400 border-gray-500/30"   : "bg-gray-50 text-gray-600 border-gray-200"   },
  "Closed":      { dot: "bg-red-400",                 cls: d => d ? "bg-red-500/15 text-red-400 border-red-500/30"      : "bg-red-50 text-red-600 border-red-200"      },
};
const categoryColors: Record<string, string> = {
  "AI/ML":      "bg-violet-500/15 text-violet-400 border-violet-500/30",
  "Blockchain": "bg-amber-500/15 text-amber-400 border-amber-500/30",
  "IoT":        "bg-green-500/15 text-green-400 border-green-500/30",
  "Web Dev":    "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
  "App Dev":    "bg-fuchsia-500/15 text-fuchsia-400 border-fuchsia-500/30",
};
const roleColors = (d: boolean) => ({
  "Project Lead": d ? "bg-violet-500/15 text-violet-400 border-violet-500/30" : "bg-violet-50 text-violet-600 border-violet-200",
  "Frontend Dev": d ? "bg-cyan-500/15 text-cyan-400 border-cyan-500/30"       : "bg-cyan-50 text-cyan-600 border-cyan-200",
  "Backend Dev":  d ? "bg-blue-500/15 text-blue-400 border-blue-500/30"       : "bg-blue-50 text-blue-600 border-blue-200",
  "Contributor":  d ? "bg-gray-500/15 text-gray-400 border-gray-500/30"       : "bg-gray-50 text-gray-600 border-gray-200",
});
const avatarGradients = [
  "from-violet-500 to-fuchsia-500","from-cyan-500 to-blue-500",
  "from-fuchsia-500 to-pink-500",  "from-amber-500 to-orange-500",
  "from-green-500 to-emerald-500", "from-blue-500 to-violet-500",
];
const hashIdx = (s: string) => s.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % avatarGradients.length;

// ─── Create Project Modal (arrow function) ────────────────────────────────────
const CreateModal = ({ darkMode, onClose, onCreate }: {
  darkMode: boolean; onClose: () => void; onCreate: (p: Project) => void;
}) => {
  const [form, setForm] = useState({ title: "", description: "", category: "Web Dev", visibility: "public" as "public"|"private", techStack: "" });
  const overlayRef = React.useRef<HTMLDivElement>(null);
  const accentGradient = "from-violet-500 via-fuchsia-500 to-cyan-400";
  const inputCls = `w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all focus:ring-2 focus:ring-violet-500/30 ${darkMode ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-violet-500/60" : "bg-gray-50 border-gray-200 text-gray-900 focus:border-violet-400"}`;
  const labelCls = `block text-xs font-semibold mb-1.5 ${darkMode ? "text-gray-300" : "text-gray-700"}`;
  const divider  = darkMode ? "border-gray-800" : "border-gray-100";

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    onCreate({
      _id: `p${Date.now()}`, title: form.title, description: form.description,
      category: form.category, status: "Open", progress: 0, visibility: form.visibility,
      techStack: form.techStack.split(",").map(t => t.trim()).filter(Boolean),
      members: [{ _id: "me", username: "you", avatar: "ME", role: "Project Lead" }],
      totalTasks: 0, completedTasks: 0, isStarred: false, lastActivity: "just now",
      createdAt: new Date().toISOString().slice(0, 10), role: "Project Lead",
    });
    onClose();
  };

  return (
    <div ref={overlayRef} className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)" }}
      onClick={e => { if (e.target === overlayRef.current) onClose(); }}>
      <div className={`w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden ${darkMode ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"}`}
        style={{ animation: "slideUp 0.22s ease both" }}>
        <div className={`flex items-center justify-between px-6 py-5 border-b ${divider}`}>
          <div>
            <h2 className={`text-base font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>Create new project</h2>
            <p className={`text-xs mt-0.5 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Set up your project workspace and invite collaborators</p>
          </div>
          <button onClick={onClose} className={`w-8 h-8 rounded-full flex items-center justify-center ${darkMode ? "hover:bg-gray-800 text-gray-400" : "hover:bg-gray-100 text-gray-500"}`}>
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={submit} className="p-6 space-y-4">
          <div>
            <label className={labelCls}>Project name <span className="text-red-400">*</span></label>
            <input className={inputCls} placeholder="e.g. AI Health Tracker" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
          </div>
          <div>
            <label className={labelCls}>Description</label>
            <textarea rows={3} className={`${inputCls} resize-none`} placeholder="What are you building?" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Category</label>
              <div className="relative">
                <select className={`${inputCls} pr-8 appearance-none`} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                  {["AI/ML", "Web Dev", "Blockchain", "IoT", "App Dev"].map(c => <option key={c}>{c}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-gray-400" />
              </div>
            </div>
            <div>
              <label className={labelCls}>Visibility</label>
              <div className="grid grid-cols-2 gap-2">
                {(["public", "private"] as const).map(v => (
                  <button key={v} type="button" onClick={() => setForm(f => ({ ...f, visibility: v }))}
                    className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl border text-xs font-medium transition-all ${form.visibility === v ? `bg-gradient-to-r ${accentGradient} text-white border-transparent` : `${darkMode ? "border-gray-700 text-gray-400 hover:bg-gray-800" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}`}>
                    {v === "public" ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                    {v.charAt(0).toUpperCase() + v.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div>
            <label className={labelCls}>Tech stack <span className={`font-normal ${darkMode ? "text-gray-500" : "text-gray-400"}`}>(comma-separated)</span></label>
            <input className={inputCls} placeholder="React, Node.js, MongoDB" value={form.techStack} onChange={e => setForm(f => ({ ...f, techStack: e.target.value }))} />
          </div>
          <div className={`flex gap-3 pt-2 border-t ${divider}`}>
            <button type="button" onClick={onClose} className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all ${darkMode ? "border-gray-700 text-gray-400 hover:bg-gray-800" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}>Cancel</button>
            <button type="submit" className={`flex-1 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r ${accentGradient} text-white shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40 hover:scale-[1.02] transition-all`}>Create project 🚀</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Project Card (arrow function) ────────────────────────────────────────────
const ProjectCard = ({ p, darkMode, idx, onStar }: { p: Project; darkMode: boolean; idx: number; onStar: () => void }) => {
  const sc = statusConfig[p.status];
  const cc = categoryColors[p.category] ?? categoryColors["Web Dev"];
  const rc = (roleColors(darkMode) as any)[p.role] ?? (darkMode ? "bg-gray-500/15 text-gray-400 border-gray-500/30" : "bg-gray-50 text-gray-600 border-gray-200");
  const accentGradient = "from-violet-500 via-fuchsia-500 to-cyan-400";
  const mutedText  = darkMode ? "text-gray-400" : "text-gray-500";
  const headingText= darkMode ? "text-white"    : "text-gray-900";
  const cardBg     = darkMode ? "bg-gray-800 border-gray-700/60" : "bg-white border-gray-200";
  const divider    = darkMode ? "border-gray-700/50" : "border-gray-100";

  return (
    <div className={`group relative rounded-2xl border overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${cardBg} ${darkMode ? "hover:border-violet-500/40 hover:shadow-violet-500/6" : "hover:border-violet-300 hover:shadow-violet-100"}`}>
      <div className={`absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r ${accentGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${cc}`}>{p.category}</span>
              <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${sc.cls(darkMode)}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />{p.status}
              </span>
              {p.visibility === "private" && <Lock className={`w-3 h-3 ${mutedText}`} />}
            </div>
            <h3 className={`text-base font-bold leading-snug ${headingText}`}>{p.title}</h3>
          </div>
          <button onClick={e => { e.preventDefault(); onStar(); }}
            className={`p-1.5 rounded-lg transition-all hover:scale-110 shrink-0 ${p.isStarred ? "text-amber-400" : `${mutedText} hover:text-amber-400`}`}>
            <Star className={`w-4 h-4 ${p.isStarred ? "fill-amber-400" : ""}`} />
          </button>
        </div>

        {/* Description */}
        <p className={`text-xs leading-relaxed mb-4 line-clamp-2 ${mutedText}`}>{p.description}</p>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex justify-between mb-1.5">
            <span className={`text-[11px] ${mutedText}`}>{p.completedTasks}/{p.totalTasks} tasks</span>
            <span className={`text-[11px] font-semibold ${headingText}`}>{p.progress}%</span>
          </div>
          <div className={`h-1.5 rounded-full overflow-hidden ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>
            <div className={`h-full rounded-full bg-gradient-to-r ${accentGradient} transition-all duration-700`} style={{ width: `${p.progress}%` }} />
          </div>
        </div>

        {/* Tech stack */}
        {p.techStack.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {p.techStack.slice(0, 4).map(t => (
              <span key={t} className={`text-[11px] font-mono px-2 py-0.5 rounded-md border ${darkMode ? "bg-gray-700/60 border-gray-600 text-gray-300" : "bg-gray-50 border-gray-200 text-gray-600"}`}>{t}</span>
            ))}
            {p.techStack.length > 4 && <span className={`text-[11px] ${mutedText}`}>+{p.techStack.length - 4}</span>}
          </div>
        )}

        {/* Footer */}
        <div className={`flex items-center justify-between pt-3 border-t ${divider}`}>
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {p.members.slice(0, 4).map((m, i) => (
                <div key={m._id} className={`w-6 h-6 rounded-lg bg-gradient-to-br ${avatarGradients[hashIdx(m._id)]} flex items-center justify-center text-[9px] font-bold text-white ring-1 ${darkMode ? "ring-gray-800" : "ring-white"}`}>
                  {m.avatar.slice(0, 1)}
                </div>
              ))}
              {p.members.length > 4 && <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[9px] font-bold ring-1 ${darkMode ? "bg-gray-700 text-gray-400 ring-gray-800" : "bg-gray-100 text-gray-500 ring-white"}`}>+{p.members.length - 4}</div>}
            </div>
            <span className={`text-[11px] ${mutedText}`}>{p.members.length} member{p.members.length !== 1 ? "s" : ""}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-[11px] px-2 py-0.5 rounded-full border font-medium ${rc}`}>{p.role}</span>
            <span className={`text-[11px] ${mutedText}`}>{p.lastActivity}</span>
          </div>
        </div>
      </div>

      <Link href={`/team-workspace/${p._id}`}>
        <div className={`flex items-center justify-between px-5 py-3 border-t ${divider} opacity-0 group-hover:opacity-100 transition-all duration-200 ${darkMode ? "bg-gray-700/30" : "bg-gray-50/80"}`}>
          <span className={`text-xs font-semibold bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent`}>Open workspace</span>
          <ArrowRight className="w-3.5 h-3.5 text-violet-400" />
        </div>
      </Link>
    </div>
  );
};

// ─── Main Hub Page (arrow function) ──────────────────────────────────────────
const WorkspaceHubPage = () => {
  const darkMode = useAppSelector((state: any) => state.Theme.darkMode);

  const [projects, setProjects]   = useState<Project[]>(MOCK_PROJECTS);
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch]       = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [activeTab, setActiveTab] = useState<"all"|"leading"|"contributing"|"starred">("all");

  const stats = {
    total:       projects.length,
    leading:     projects.filter(p => p.role === "Project Lead").length,
    active:      projects.filter(p => ["Open","In Progress"].includes(p.status)).length,
    completed:   projects.filter(p => p.status === "Completed").length,
  };

  const filtered = projects
    .filter(p => {
      const q = search.toLowerCase();
      const matchSearch = !q || p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.techStack.some(t => t.toLowerCase().includes(q));
      const matchStatus = filterStatus === "All" || p.status === filterStatus;
      const matchTab    = activeTab === "all" ? true : activeTab === "leading" ? p.role === "Project Lead" : activeTab === "contributing" ? p.role !== "Project Lead" : p.isStarred;
      return matchSearch && matchStatus && matchTab;
    });

  // Theme tokens
  const bg          = darkMode ? "bg-gray-900 text-white"         : "bg-white text-gray-800";
  const cardBg      = darkMode ? "bg-gray-800 border-gray-700/60" : "bg-white border-gray-200";
  const mutedText   = darkMode ? "text-gray-400"                  : "text-gray-500";
  const headingText = darkMode ? "text-white"                     : "text-gray-900";
  const divider     = darkMode ? "border-gray-800"                : "border-gray-200";
  const accentGradient = "from-violet-500 via-fuchsia-500 to-cyan-400";
  const accentText     = "bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent";

  const tabs = [
    { key: "all",          label: "All",          count: projects.length                            },
    { key: "leading",      label: "Leading",       count: stats.leading                              },
    { key: "contributing", label: "Contributing",  count: projects.length - stats.leading            },
    { key: "starred",      label: "Starred",       count: projects.filter(p => p.isStarred).length  },
  ] as const;

  return (
    <div className={`min-h-screen ${bg} transition-colors duration-300 font-sans`}>
      {/* Hero */}
      <section className={`relative overflow-hidden border-b ${divider}`}>
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `linear-gradient(${darkMode ? "#fff" : "#000"} 1px, transparent 1px), linear-gradient(90deg, ${darkMode ? "#fff" : "#000"} 1px, transparent 1px)`, backgroundSize: "50px 50px" }} />
        <div className="absolute top-0 left-1/4 w-80 h-48 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/3 w-64 h-40 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div>
              <div className={`inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full border text-xs font-medium ${darkMode ? "bg-violet-500/10 border-violet-500/30 text-violet-300" : "bg-violet-50 border-violet-200 text-violet-600"}`}>
                <FolderOpen className="w-3.5 h-3.5" /> Team Workspace · {stats.active} active project{stats.active !== 1 ? "s" : ""}
              </div>
              <h1 className={`text-4xl md:text-5xl font-extrabold tracking-tight leading-tight mb-3 ${headingText}`}>
                My <span className={accentText}>Workspaces</span>
              </h1>
              <p className={`text-base ${mutedText} max-w-lg leading-relaxed`}>
                All your projects in one place — track tasks, manage teams, and keep every collaboration on schedule.
              </p>
            </div>

            {/* Stats tiles */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
              {[
                { label: "Total",     value: stats.total,     from: "from-violet-500", to: "to-fuchsia-500" },
                { label: "Active",    value: stats.active,    from: "from-green-500",  to: "to-emerald-500" },
                { label: "Leading",   value: stats.leading,   from: "from-cyan-500",   to: "to-blue-500"    },
                { label: "Done",      value: stats.completed, from: "from-gray-500",   to: "to-gray-400"    },
              ].map((s, i) => (
                <div key={s.label} className={`text-center px-5 py-4 rounded-2xl border ${cardBg}`}>
                  <div className={`text-3xl font-extrabold tracking-tight bg-gradient-to-br ${s.from} ${s.to} bg-clip-text text-transparent`}>{s.value}</div>
                  <div className={`text-[11px] mt-0.5 ${mutedText}`}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Controls */}
      <div className={`sticky top-0 z-40 border-b ${divider} ${darkMode ? "bg-gray-900/90" : "bg-white/90"} backdrop-blur-md`}>
        <div className="max-w-7xl mx-auto px-6 py-3 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          {/* Tabs */}
          <div className={`flex items-center gap-0.5 p-1 rounded-xl ${darkMode ? "bg-gray-800" : "bg-gray-100"}`}>
            {tabs.map(t => (
              <button key={t.key} onClick={() => setActiveTab(t.key)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all whitespace-nowrap ${activeTab === t.key ? `bg-gradient-to-r ${accentGradient} text-white shadow-sm` : `${darkMode ? "text-gray-400 hover:text-gray-200" : "text-gray-500 hover:text-gray-700"}`}`}>
                {t.label}
                {t.count > 0 && (
                  <span className={`min-w-[16px] h-4 px-1 rounded-full text-[10px] font-bold flex items-center justify-center ${activeTab === t.key ? "bg-white/25 text-white" : `${darkMode ? "bg-gray-700 text-gray-400" : "bg-gray-200 text-gray-500"}`}`}>{t.count}</span>
                )}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative flex-1 sm:max-w-sm">
            <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 ${mutedText}`} />
            <input type="text" placeholder="Search projects, tech, roles…" value={search} onChange={e => setSearch(e.target.value)}
              className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-xs outline-none transition-all focus:ring-2 focus:ring-violet-500/30 ${darkMode ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500" : "bg-white border-gray-200 text-gray-900 placeholder-gray-400"}`}
            />
            {search && <button onClick={() => setSearch("")} className={`absolute right-3 top-1/2 -translate-y-1/2 ${mutedText} hover:text-red-400`}><X className="w-3.5 h-3.5" /></button>}
          </div>

          {/* Status filter */}
          <div className="relative">
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              className={`pl-3 pr-7 py-2.5 rounded-xl border text-xs font-medium outline-none appearance-none ${darkMode ? "bg-gray-800 border-gray-700 text-gray-300" : "bg-white border-gray-200 text-gray-700"}`}>
              {["All", "Open", "In Progress", "On Hold", "Completed", "Closed"].map(o => <option key={o}>{o}</option>)}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none text-gray-400" />
          </div>

          <button onClick={() => setShowCreate(true)}
            className={`ml-auto flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r ${accentGradient} text-white shadow-md shadow-violet-500/20 hover:shadow-violet-500/40 hover:scale-105 transition-all whitespace-nowrap`}>
            <Plus className="w-3.5 h-3.5" /> New Project
          </button>
        </div>
      </div>

      {/* Grid */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-5">
          <p className={`text-sm ${mutedText}`}>
            <span className={`font-semibold ${headingText}`}>{filtered.length}</span> project{filtered.length !== 1 ? "s" : ""}
          </p>
        </div>

        {filtered.length === 0 ? (
          <div className={`rounded-2xl border p-16 text-center ${cardBg}`}>
            <div className="text-5xl mb-4">🗂️</div>
            <h3 className={`text-xl font-bold mb-2 ${headingText}`}>No projects found</h3>
            <p className={`text-sm ${mutedText} mb-6 max-w-xs mx-auto`}>Try adjusting your filters or create your first project.</p>
            <button onClick={() => setShowCreate(true)}
              className={`px-6 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r ${accentGradient} text-white hover:scale-105 transition-all`}>
              Create a project →
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map((p, i) => (
              <ProjectCard key={p._id} p={p} darkMode={darkMode} idx={i}
                onStar={() => setProjects(prev => prev.map(x => x._id === p._id ? { ...x, isStarred: !x.isStarred } : x))}
              />
            ))}
          </div>
        )}
      </main>

      {showCreate && (
        <CreateModal darkMode={darkMode} onClose={() => setShowCreate(false)}
          onCreate={p => { setProjects(prev => [p, ...prev]); }} />
      )}

      <style>{`
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
      `}</style>
    </div>
  );
};

export default WorkspaceHubPage;