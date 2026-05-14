"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAppSelector } from "@/redux/hooks";
import Link from "next/link";
import { Search, SlidersHorizontal, X, Plus, Users, Calendar, ArrowRight, Layers, Briefcase, ChevronDown } from "lucide-react";
// import { getAllProjects, createProjectCollab } from "@/services/collabApis";

// ─── Types ────────────────────────────────────────────────────────────────────
interface TeamMember { _id: string; username: string; avatar?: string; }
interface Project {
  _id: string;
  title: string;
  description: string;
  problemStatement?: string;
  category: string;
  techStackUsed: string[];
  status: "Open" | "In Progress" | "On Hold" | "Completed" | "Closed";
  rolesLookingFor: string[];
  totalTeamSize: number;
  currentTeamMembers: TeamMember[];
  createdBy: { _id: string; username: string; avatar?: string };
  contact?: string;
  file?: string;
  createdAt: string;
}

// ─── Mock data ────────────────────────────────────────────────────────────────
const MOCK: Project[] = [
  { _id: "1", title: "AI-Powered Health Tracker", description: "A smart wearable companion that uses ML to predict health anomalies before they become critical — real-time vitals, personalized coaching, and emergency alerts.", problemStatement: "Early disease detection is expensive and inaccessible.", category: "AI/ML", techStackUsed: ["Python", "TensorFlow", "React Native", "FastAPI"], status: "Open", rolesLookingFor: ["ML Engineer", "Mobile Dev", "Backend Dev"], totalTeamSize: 5, currentTeamMembers: [{ _id: "u1", username: "navkirat" }], createdBy: { _id: "u1", username: "navkirat" }, contact: "nav@devconnect.io", file: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&q=80", createdAt: "2025-03-10T10:00:00Z" },
  { _id: "2", title: "Decentralized Freelance Marketplace", description: "Peer-to-peer gig economy platform on Ethereum. Smart contracts handle escrow, reputation, and dispute resolution — zero platform fees, full ownership.", problemStatement: "Centralized platforms take 20%+ cuts and censor arbitrarily.", category: "Blockchain", techStackUsed: ["Solidity", "Next.js", "Hardhat", "IPFS"], status: "In Progress", rolesLookingFor: ["Blockchain Dev", "Frontend Dev", "Designer"], totalTeamSize: 4, currentTeamMembers: [{ _id: "u2", username: "alex_eth" }, { _id: "u3", username: "priya_ui" }], createdBy: { _id: "u2", username: "alex_eth" }, file: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&q=80", createdAt: "2025-02-20T08:00:00Z" },
  { _id: "3", title: "Open Source Code Review AI", description: "GitHub bot that performs deep semantic code review using LLMs — finds bugs, suggests refactors, enforces best practices, and explains every decision.", problemStatement: "Junior devs lack access to senior-level code review.", category: "Web Dev", techStackUsed: ["TypeScript", "Node.js", "OpenAI", "GitHub API"], status: "Open", rolesLookingFor: ["Backend Dev", "ML Engineer", "DevOps"], totalTeamSize: 3, currentTeamMembers: [], createdBy: { _id: "u4", username: "marcus_oss" }, file: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=400&q=80", createdAt: "2025-03-25T12:00:00Z" },
  { _id: "4", title: "Smart Campus IoT Dashboard", description: "Unified IoT platform for university campuses — energy monitoring, smart attendance, classroom occupancy prediction, and predictive maintenance alerts.", problemStatement: "Campuses waste 30%+ energy due to poor monitoring.", category: "IoT", techStackUsed: ["Raspberry Pi", "MQTT", "React", "InfluxDB"], status: "Open", rolesLookingFor: ["IoT Engineer", "Frontend Dev", "Backend Dev"], totalTeamSize: 4, currentTeamMembers: [{ _id: "u5", username: "rina_iot" }], createdBy: { _id: "u5", username: "rina_iot" }, file: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&q=80", createdAt: "2025-03-01T09:00:00Z" },
  { _id: "5", title: "Cross-Platform Fitness App", description: "Social fitness companion with AI workout generation, real-time multiplayer challenges, and Apple Health / Google Fit integration. Think Strava meets Duolingo.", problemStatement: "Fitness apps are either too generic or too expensive.", category: "App Dev", techStackUsed: ["Flutter", "Dart", "Firebase", "TensorFlow Lite"], status: "Open", rolesLookingFor: ["Mobile Dev", "Backend Dev", "Designer"], totalTeamSize: 3, currentTeamMembers: [], createdBy: { _id: "u6", username: "zoey_codes" }, file: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=80", createdAt: "2025-04-01T07:00:00Z" },
];

const CATEGORIES = ["All", "AI/ML", "Web Dev", "Blockchain", "IoT", "App Dev"];
const STATUSES   = ["All", "Open", "In Progress", "On Hold", "Completed", "Closed"];
const ROLES      = ["All Roles", "Frontend Dev", "Backend Dev", "ML Engineer", "Blockchain Dev", "Mobile Dev", "Designer", "IoT Engineer", "DevOps"];

const categoryMeta: Record<string, { color: string; bg: string; darkBg: string }> = {
  "AI/ML":      { color: "text-violet-400",  bg: "bg-violet-500/15 border-violet-500/30",  darkBg: "bg-violet-500/15 border-violet-500/30"  },
  "Web Dev":    { color: "text-cyan-400",    bg: "bg-cyan-500/15 border-cyan-500/30",      darkBg: "bg-cyan-500/15 border-cyan-500/30"      },
  "Blockchain": { color: "text-amber-400",   bg: "bg-amber-500/15 border-amber-500/30",    darkBg: "bg-amber-500/15 border-amber-500/30"    },
  "IoT":        { color: "text-green-400",   bg: "bg-green-500/15 border-green-500/30",    darkBg: "bg-green-500/15 border-green-500/30"    },
  "App Dev":    { color: "text-fuchsia-400", bg: "bg-fuchsia-500/15 border-fuchsia-500/30",darkBg: "bg-fuchsia-500/15 border-fuchsia-500/30"},
};

const statusMeta: Record<string, { dot: string; text: string; bg: string }> = {
  "Open":        { dot: "bg-green-400",  text: "text-green-400",  bg: "bg-green-500/15 border-green-500/30"   },
  "In Progress": { dot: "bg-blue-400",   text: "text-blue-400",   bg: "bg-blue-500/15 border-blue-500/30"     },
  "On Hold":     { dot: "bg-amber-400",  text: "text-amber-400",  bg: "bg-amber-500/15 border-amber-500/30"   },
  "Completed":   { dot: "bg-gray-400",   text: "text-gray-400",   bg: "bg-gray-500/15 border-gray-500/30"     },
  "Closed":      { dot: "bg-red-400",    text: "text-red-400",    bg: "bg-red-500/15 border-red-500/30"       },
};

function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
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

// ─── Project Card ─────────────────────────────────────────────────────────────
function ProjectCard({ p, darkMode, idx }: { p: Project; darkMode: boolean; idx: number }) {
  const { ref, inView } = useInView();
  const cat  = categoryMeta[p.category] ?? categoryMeta["Web Dev"];
  const stat = statusMeta[p.status]     ?? statusMeta["Open"];
  const accentGradient = "from-violet-500 via-fuchsia-500 to-cyan-400";
  const mutedText  = darkMode ? "text-gray-400" : "text-gray-500";
  const headingText= darkMode ? "text-white"    : "text-gray-900";

  return (
    <div ref={ref}
      className={`group relative rounded-2xl border overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl ${
        darkMode
          ? "bg-gray-800 border-gray-700/60 hover:border-violet-500/40 hover:shadow-violet-500/5"
          : "bg-white border-gray-200 hover:border-violet-300 hover:shadow-violet-100"
      }`}
      style={{ opacity: inView ? 1 : 0, transform: inView ? "none" : "translateY(28px)", transition: `opacity 0.55s ease ${idx * 0.07}s, transform 0.55s ease ${idx * 0.07}s, box-shadow 0.2s, border-color 0.2s` }}
    >
      {/* Gradient accent top bar */}
      <div className={`absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r ${accentGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

      <div className="flex flex-col sm:flex-row">
        {/* Image */}
        <div className="sm:w-52 sm:shrink-0 h-44 sm:h-auto overflow-hidden relative">
          {p.file ? (
            <img src={p.file} alt={p.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
          ) : (
            <div className={`w-full h-full flex items-center justify-center text-4xl ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>
              {p.category === "AI/ML" ? "🤖" : p.category === "Blockchain" ? "🔗" : p.category === "IoT" ? "📡" : p.category === "App Dev" ? "📱" : "💻"}
            </div>
          )}
          {/* Category badge over image */}
          <span className={`absolute top-3 left-3 text-[11px] font-semibold px-2.5 py-1 rounded-full border backdrop-blur-sm ${cat.bg} ${cat.color}`}>
            {p.category}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 flex flex-col gap-3 min-w-0">
          {/* Top row */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 className={`text-lg font-bold leading-snug mb-1 ${headingText}`}>{p.title}</h3>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full border ${stat.bg} ${stat.text}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${stat.dot} ${p.status === "Open" ? "animate-pulse" : ""}`} />
                  {p.status}
                </span>
                <span className={`text-xs ${mutedText}`}>·</span>
                <span className={`text-xs ${mutedText} flex items-center gap-1`}>
                  <Calendar className="w-3 h-3" /> Posted {timeAgo(p.createdAt)}
                </span>
              </div>
            </div>
            <div className={`text-right shrink-0 text-xs ${mutedText}`}>
              <div className="flex items-center gap-1 justify-end">
                <Users className="w-3.5 h-3.5" />
                <span>{p.currentTeamMembers.length}/{p.totalTeamSize}</span>
              </div>
              <div className="mt-0.5">members</div>
            </div>
          </div>

          {/* Description */}
          <p className={`text-sm leading-relaxed line-clamp-2 ${mutedText}`}>{p.description}</p>

          {/* Tech Stack */}
          {p.techStackUsed?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {p.techStackUsed.slice(0, 5).map(t => (
                <span key={t} className={`text-[11px] px-2 py-0.5 rounded-md font-mono font-medium border ${darkMode ? "bg-gray-700/60 border-gray-600 text-gray-300" : "bg-gray-50 border-gray-200 text-gray-600"}`}>{t}</span>
              ))}
              {p.techStackUsed.length > 5 && <span className={`text-[11px] px-2 py-0.5 rounded-md border ${darkMode ? "border-gray-600 text-gray-500 bg-gray-700/40" : "border-gray-200 text-gray-400 bg-gray-50"}`}>+{p.techStackUsed.length - 5}</span>}
            </div>
          )}

          {/* Footer */}
          <div className={`flex items-center justify-between pt-3 border-t gap-3 flex-wrap ${darkMode ? "border-gray-700/50" : "border-gray-100"}`}>
            {/* Roles */}
            <div className="flex flex-wrap gap-1.5">
              {p.rolesLookingFor.slice(0, 3).map(r => (
                <span key={r} className={`text-[11px] px-2 py-0.5 rounded-full border font-medium ${darkMode ? "bg-violet-500/10 border-violet-500/25 text-violet-400" : "bg-violet-50 border-violet-200 text-violet-600"}`}>{r}</span>
              ))}
              {p.rolesLookingFor.length > 3 && <span className={`text-[11px] ${mutedText}`}>+{p.rolesLookingFor.length - 3} more</span>}
            </div>

            <div className="flex items-center gap-3">
              <div className={`flex items-center gap-1.5 text-xs ${mutedText}`}>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold ${darkMode ? "bg-gray-600 text-gray-300" : "bg-gray-200 text-gray-600"}`}>
                  {p.createdBy.username[0].toUpperCase()}
                </div>
                {p.createdBy.username}
              </div>
              <Link href={`/project-collaboration/${p._id}`}>
                <button className={`flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl bg-gradient-to-r ${accentGradient} text-white shadow-sm shadow-violet-500/20 hover:shadow-violet-500/40 hover:scale-105 transition-all`}>
                  View Project <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Create Modal ─────────────────────────────────────────────────────────────
function CreateModal({ darkMode, onClose, onCreate }: { darkMode: boolean; onClose: () => void; onCreate: (p: Project) => void }) {
  const [form, setForm] = useState({ title: "", description: "", problemStatement: "", category: "AI/ML", techStackUsed: "", status: "Open", rolesLookingFor: "", totalTeamSize: "3", contact: "", file: "" });
  const [step, setStep] = useState(1);
  const overlayRef = useRef<HTMLDivElement>(null);

  const accentGradient = "from-violet-500 via-fuchsia-500 to-cyan-400";
  const inputCls = `w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all focus:ring-2 focus:ring-violet-500/30 ${darkMode ? "bg-gray-700/60 border-gray-600 text-white placeholder-gray-500 focus:border-violet-500/60" : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-violet-400"}`;
  const labelCls = `block text-xs font-semibold mb-1.5 ${darkMode ? "text-gray-300" : "text-gray-700"}`;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;
    onCreate({ _id: Math.random().toString(36).slice(2), title: form.title, description: form.description, problemStatement: form.problemStatement, category: form.category, techStackUsed: form.techStackUsed.split(",").map(t => t.trim()).filter(Boolean), status: form.status as any, rolesLookingFor: form.rolesLookingFor.split(",").map(r => r.trim()).filter(Boolean), totalTeamSize: parseInt(form.totalTeamSize) || 3, currentTeamMembers: [], createdBy: { _id: "me", username: "you" }, contact: form.contact, file: form.file, createdAt: new Date().toISOString() });
    onClose();
  }

  return (
    <div ref={overlayRef} className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)" }}
      onClick={e => { if (e.target === overlayRef.current) onClose(); }}>
      <div className={`w-full max-w-2xl rounded-2xl border shadow-2xl overflow-hidden ${darkMode ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"}`}
        style={{ animation: "slideUp 0.25s ease both", maxHeight: "90vh", display: "flex", flexDirection: "column" }}>

        {/* Modal header */}
        <div className={`flex items-center justify-between px-6 py-5 border-b ${darkMode ? "border-gray-800" : "border-gray-100"}`}>
          <div>
            <h2 className={`text-lg font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>Post a new project</h2>
            <p className={`text-xs mt-0.5 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Share your idea and find the perfect collaborators</p>
          </div>
          <div className="flex items-center gap-4">
            {/* Step indicator */}
            <div className="flex items-center gap-1.5">
              {[1, 2].map(s => (
                <div key={s} className={`h-1.5 rounded-full transition-all ${s === step ? `w-6 bg-gradient-to-r ${accentGradient}` : `w-3 ${darkMode ? "bg-gray-700" : "bg-gray-200"}`}`} />
              ))}
            </div>
            <button onClick={onClose} className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${darkMode ? "hover:bg-gray-700 text-gray-400" : "hover:bg-gray-100 text-gray-500"}`}>
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-4">
            {step === 1 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className={labelCls}>Project title <span className="text-red-400">*</span></label>
                    <input className={inputCls} placeholder="e.g. AI-Powered Health Tracker" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
                  </div>
                  <div>
                    <label className={labelCls}>Category</label>
                    <div className="relative">
                      <select className={`${inputCls} pr-8 appearance-none`} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                        {CATEGORIES.filter(c => c !== "All").map(c => <option key={c}>{c}</option>)}
                      </select>
                      <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${darkMode ? "text-gray-400" : "text-gray-400"}`} />
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Status</label>
                    <div className="relative">
                      <select className={`${inputCls} pr-8 appearance-none`} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                        {STATUSES.filter(s => s !== "All").map(s => <option key={s}>{s}</option>)}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-gray-400" />
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Tech stack <span className={`font-normal ${darkMode ? "text-gray-500" : "text-gray-400"}`}>(comma-separated)</span></label>
                    <input className={inputCls} placeholder="React, Node.js, MongoDB" value={form.techStackUsed} onChange={e => setForm(f => ({ ...f, techStackUsed: e.target.value }))} />
                  </div>
                  <div>
                    <label className={labelCls}>Team size needed</label>
                    <input type="number" min={1} max={20} className={inputCls} value={form.totalTeamSize} onChange={e => setForm(f => ({ ...f, totalTeamSize: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Project description</label>
                  <textarea rows={3} className={`${inputCls} resize-none`} placeholder="What does your project do?" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className={labelCls}>Problem statement</label>
                  <textarea rows={3} className={`${inputCls} resize-none`} placeholder="What problem are you solving?" value={form.problemStatement} onChange={e => setForm(f => ({ ...f, problemStatement: e.target.value }))} />
                </div>
                <div>
                  <label className={labelCls}>Roles needed <span className={`font-normal ${darkMode ? "text-gray-500" : "text-gray-400"}`}>(comma-separated)</span></label>
                  <input className={inputCls} placeholder="Frontend Dev, ML Engineer, Designer" value={form.rolesLookingFor} onChange={e => setForm(f => ({ ...f, rolesLookingFor: e.target.value }))} />
                </div>
                <div>
                  <label className={labelCls}>Contact <span className={`font-normal ${darkMode ? "text-gray-500" : "text-gray-400"}`}>(email or Discord)</span></label>
                  <input className={inputCls} placeholder="you@email.com" value={form.contact} onChange={e => setForm(f => ({ ...f, contact: e.target.value }))} />
                </div>
                <div>
                  <label className={labelCls}>Cover image URL <span className={`font-normal ${darkMode ? "text-gray-500" : "text-gray-400"}`}>(optional)</span></label>
                  <input className={inputCls} placeholder="https://..." value={form.file} onChange={e => setForm(f => ({ ...f, file: e.target.value }))} />
                </div>
                {/* Preview tags */}
                {form.techStackUsed && (
                  <div>
                    <p className={`text-xs font-semibold mb-2 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Tech preview</p>
                    <div className="flex flex-wrap gap-1.5">
                      {form.techStackUsed.split(",").map(t => t.trim()).filter(Boolean).map(t => (
                        <span key={t} className={`text-[11px] px-2 py-0.5 rounded-md font-mono border ${darkMode ? "bg-gray-700/60 border-gray-600 text-gray-300" : "bg-gray-50 border-gray-200 text-gray-600"}`}>{t}</span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          <div className={`flex items-center justify-between px-6 py-4 border-t ${darkMode ? "border-gray-800" : "border-gray-100"}`}>
            <button type="button" onClick={step === 1 ? onClose : () => setStep(1)}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium border transition-all hover:scale-[1.02] ${darkMode ? "border-gray-600 text-gray-400 hover:bg-gray-800" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
              {step === 1 ? "Cancel" : "← Back"}
            </button>
            {step === 1 ? (
              <button type="button" onClick={() => { if (form.title.trim()) setStep(2); }}
                className={`px-6 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r ${accentGradient} text-white shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40 transition-all hover:scale-[1.02] active:scale-[0.98]`}>
                Next →
              </button>
            ) : (
              <button type="submit"
                className={`px-6 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r ${accentGradient} text-white shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40 transition-all hover:scale-[1.02] active:scale-[0.98]`}>
                Post Project 🚀
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ProjectCollabPage() {
  const darkMode = useAppSelector((state: any) => state.Theme.darkMode);

  const [projects, setProjects]     = useState<Project[]>(MOCK);
  const [loading, setLoading]       = useState(false);
  const [showModal, setShowModal]   = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mounted, setMounted]       = useState(false);

  const [filters, setFilters]       = useState({ category: "All", status: "All", role: "All Roles", searchQuery: "" });
  const [sortBy, setSortBy]         = useState("dateNewest");

  const heroSection = useInView();

  useEffect(() => {
    setMounted(true);
    // Replace mock fetch below with: const res = await getAllProjects({...}); setProjects(res.data.data);
    setLoading(false);
  }, []);

  // ── Derived list ──────────────────────────────────────────────────────────
  const filtered = projects
    .filter(p => {
      const q = filters.searchQuery.toLowerCase();
      const matchSearch = !q || p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.techStackUsed.some(t => t.toLowerCase().includes(q));
      const matchCat    = filters.category === "All" || p.category === filters.category;
      const matchStatus = filters.status   === "All" || p.status   === filters.status;
      const matchRole   = filters.role     === "All Roles" || p.rolesLookingFor.includes(filters.role);
      return matchSearch && matchCat && matchStatus && matchRole;
    })
    .sort((a, b) => {
      if (sortBy === "dateNewest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === "dateOldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortBy === "titleAZ")    return a.title.localeCompare(b.title);
      if (sortBy === "titleZA")    return b.title.localeCompare(a.title);
      if (sortBy === "teamSize")   return b.totalTeamSize - a.totalTeamSize;
      return 0;
    });

  const activeFiltersCount = [filters.category !== "All", filters.status !== "All", filters.role !== "All Roles", !!filters.searchQuery].filter(Boolean).length;

  // ── Theme tokens ──────────────────────────────────────────────────────────
  const bg          = darkMode ? "bg-gray-900 text-white"       : "bg-white text-gray-800";
  const surfaceBg   = darkMode ? "bg-gray-800/40"               : "bg-gray-50";
  const cardBg      = darkMode ? "bg-gray-800 border-gray-700"  : "bg-white border-gray-200";
  const mutedText   = darkMode ? "text-gray-400"                : "text-gray-500";
  const headingText = darkMode ? "text-white"                   : "text-gray-900";
  const divider     = darkMode ? "border-gray-800"              : "border-gray-200";
  const inputCls    = `w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all focus:ring-2 focus:ring-violet-500/30 ${darkMode ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-violet-500/60" : "bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-violet-400"}`;
  const selectCls   = `w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all focus:ring-2 focus:ring-violet-500/30 appearance-none ${darkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-200 text-gray-900"}`;
  const accentGradient = "from-violet-500 via-fuchsia-500 to-cyan-400";
  const accentText     = "bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent";

  return (
    <div className={`min-h-screen ${bg} transition-colors duration-300 font-sans`}>

      {/* ── HERO ── */}
      <section className={`relative overflow-hidden border-b ${divider}`}>
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `linear-gradient(${darkMode ? "#fff" : "#000"} 1px, transparent 1px), linear-gradient(90deg, ${darkMode ? "#fff" : "#000"} 1px, transparent 1px)`, backgroundSize: "50px 50px" }} />
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-fuchsia-500/10 rounded-full blur-3xl pointer-events-none" />

        <div ref={heroSection.ref} className="relative max-w-7xl mx-auto px-6 py-14">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div className="max-w-xl" style={{ opacity: heroSection.inView ? 1 : 0, transform: heroSection.inView ? "none" : "translateY(20px)", transition: "opacity 0.6s ease, transform 0.6s ease" }}>
              <div className={`inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full border text-xs font-medium ${darkMode ? "bg-fuchsia-500/10 border-fuchsia-500/30 text-fuchsia-300" : "bg-fuchsia-50 border-fuchsia-200 text-fuchsia-600"}`}>
                <Briefcase className="w-3.5 h-3.5" /> {projects.filter(p => p.status === "Open").length} projects looking for collaborators
              </div>
              <h1 className={`text-4xl md:text-5xl font-extrabold tracking-tight leading-tight mb-3 ${headingText}`}>
                Find your next <span className={accentText}>dream team</span>
              </h1>
              <p className={`text-base ${mutedText} leading-relaxed`}>
                Browse open projects, pitch your skills, and ship something great together. Every legendary product started with the right team.
              </p>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-4" style={{ opacity: heroSection.inView ? 1 : 0, transform: heroSection.inView ? "none" : "translateY(20px)", transition: "opacity 0.6s ease 0.15s, transform 0.6s ease 0.15s" }}>
              {[
                { label: "Projects",     value: projects.length                                  },
                { label: "Open",         value: projects.filter(p => p.status === "Open").length  },
                { label: "Roles needed", value: [...new Set(projects.flatMap(p => p.rolesLookingFor))].length },
              ].map(s => (
                <div key={s.label} className={`text-center px-5 py-4 rounded-xl border ${cardBg}`}>
                  <div className={`text-3xl font-extrabold tracking-tight ${accentText}`}>{s.value}</div>
                  <div className={`text-xs mt-1 ${mutedText}`}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── TOOLBAR ── */}
      <div className={`sticky top-0 z-40 border-b ${divider} ${darkMode ? "bg-gray-900/90" : "bg-white/90"} backdrop-blur-md`}>
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-3">
          {/* Sidebar toggle */}
          <button onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-medium transition-all shrink-0 ${sidebarOpen ? `bg-gradient-to-r ${accentGradient} text-white border-transparent` : `${darkMode ? "border-gray-700 text-gray-400 hover:border-gray-600 hover:text-gray-200" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}`}>
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {activeFiltersCount > 0 && <span className="w-4 h-4 rounded-full bg-white/25 flex items-center justify-center text-[10px] font-bold">{activeFiltersCount}</span>}
          </button>

          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${mutedText}`} />
            <input type="text" placeholder="Search projects, tech, roles…" value={filters.searchQuery}
              onChange={e => setFilters(f => ({ ...f, searchQuery: e.target.value }))}
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm outline-none transition-all focus:ring-2 focus:ring-violet-500/30 ${darkMode ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-violet-500/60" : "bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-violet-400"}`}
            />
            {filters.searchQuery && (
              <button onClick={() => setFilters(f => ({ ...f, searchQuery: "" }))} className={`absolute right-3 top-1/2 -translate-y-1/2 ${mutedText} hover:text-red-400 transition-colors`}>
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Sort */}
          <div className="relative hidden sm:block">
            <select value={sortBy} onChange={e => setSortBy(e.target.value)}
              className={`pl-3 pr-8 py-2.5 rounded-xl border text-xs font-medium outline-none appearance-none ${darkMode ? "bg-gray-800 border-gray-700 text-gray-300" : "bg-white border-gray-200 text-gray-700"}`}>
              <option value="dateNewest">Newest</option>
              <option value="dateOldest">Oldest</option>
              <option value="titleAZ">A → Z</option>
              <option value="titleZA">Z → A</option>
              <option value="teamSize">Team size</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none text-gray-400" />
          </div>

          <div className="ml-auto">
            <button onClick={() => setShowModal(true)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r ${accentGradient} text-white shadow-md shadow-violet-500/20 hover:shadow-violet-500/40 transition-all hover:scale-105 active:scale-95 whitespace-nowrap`}>
              <Plus className="w-4 h-4" /> Post Project
            </button>
          </div>
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="max-w-7xl mx-auto px-6 py-8 flex gap-7">

        {/* ── SIDEBAR ── */}
        {sidebarOpen && (
          <aside className="w-64 shrink-0 hidden lg:block">
            <div className={`sticky top-24 rounded-2xl border overflow-hidden ${cardBg}`}>
              <div className={`px-5 py-4 border-b ${divider} flex items-center justify-between`}>
                <span className={`text-sm font-bold ${headingText}`}>Filters</span>
                {activeFiltersCount > 0 && (
                  <button onClick={() => setFilters({ category: "All", status: "All", role: "All Roles", searchQuery: "" })}
                    className={`text-xs font-medium ${darkMode ? "text-violet-400 hover:text-violet-300" : "text-violet-600 hover:text-violet-700"} transition-colors`}>
                    Clear all
                  </button>
                )}
              </div>

              <div className="p-5 space-y-5">
                {/* Category */}
                <div>
                  <label className={`text-xs font-semibold uppercase tracking-wider mb-3 block ${mutedText}`}>Category</label>
                  <div className="space-y-1">
                    {CATEGORIES.map(c => (
                      <button key={c} onClick={() => setFilters(f => ({ ...f, category: c }))}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all ${filters.category === c
                          ? `bg-gradient-to-r ${accentGradient} text-white font-semibold`
                          : `${darkMode ? "text-gray-400 hover:text-gray-200 hover:bg-gray-700/50" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"}`}`}>
                        <span>{c}</span>
                        <span className={`text-xs ${filters.category === c ? "text-white/70" : mutedText}`}>
                          {c === "All" ? projects.length : projects.filter(p => p.category === c).length}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className={`h-px ${darkMode ? "bg-gray-700" : "bg-gray-100"}`} />

                {/* Status */}
                <div>
                  <label className={`text-xs font-semibold uppercase tracking-wider mb-3 block ${mutedText}`}>Status</label>
                  <div className="space-y-1">
                    {STATUSES.map(s => {
                      const sm = statusMeta[s];
                      return (
                        <button key={s} onClick={() => setFilters(f => ({ ...f, status: s }))}
                          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all ${filters.status === s
                            ? `${darkMode ? "bg-gray-700 text-white" : "bg-gray-100 text-gray-900"} font-semibold`
                            : `${darkMode ? "text-gray-400 hover:text-gray-200 hover:bg-gray-700/50" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"}`}`}>
                          {sm && <span className={`w-2 h-2 rounded-full shrink-0 ${sm.dot}`} />}
                          {s}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className={`h-px ${darkMode ? "bg-gray-700" : "bg-gray-100"}`} />

                {/* Roles */}
                <div>
                  <label className={`text-xs font-semibold uppercase tracking-wider mb-2 block ${mutedText}`}>Role needed</label>
                  <div className="relative">
                    <select value={filters.role} onChange={e => setFilters(f => ({ ...f, role: e.target.value }))} className={`${selectCls} pr-8`}>
                      {ROLES.map(r => <option key={r}>{r}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none text-gray-400" />
                  </div>
                </div>

                {/* Active filter chips */}
                {activeFiltersCount > 0 && (
                  <div className={`pt-4 border-t ${divider}`}>
                    <p className={`text-xs font-semibold mb-2 ${mutedText}`}>Active</p>
                    <div className="flex flex-wrap gap-1.5">
                      {filters.category !== "All" && <span className={`text-[11px] px-2 py-0.5 rounded-full border ${darkMode ? "bg-violet-500/15 border-violet-500/30 text-violet-400" : "bg-violet-50 border-violet-200 text-violet-600"}`}>{filters.category}</span>}
                      {filters.status   !== "All" && <span className={`text-[11px] px-2 py-0.5 rounded-full border ${darkMode ? "bg-green-500/15 border-green-500/30 text-green-400" : "bg-green-50 border-green-200 text-green-600"}`}>{filters.status}</span>}
                      {filters.role !== "All Roles" && <span className={`text-[11px] px-2 py-0.5 rounded-full border ${darkMode ? "bg-fuchsia-500/15 border-fuchsia-500/30 text-fuchsia-400" : "bg-fuchsia-50 border-fuchsia-200 text-fuchsia-600"}`}>{filters.role}</span>}
                    </div>
                  </div>
                )}
              </div>

              {/* Result count */}
              <div className={`px-5 py-4 border-t ${divider} text-center`}>
                <div className={`text-2xl font-extrabold tracking-tight ${accentText}`}>{filtered.length}</div>
                <div className={`text-xs ${mutedText}`}>project{filtered.length !== 1 ? "s" : ""} found</div>
              </div>
            </div>
          </aside>
        )}

        {/* ── PROJECT LIST ── */}
        <main className="flex-1 min-w-0">
          <div className={`flex items-center justify-between mb-5`}>
            <p className={`text-sm ${mutedText}`}>
              <span className={`font-semibold ${headingText}`}>{filtered.length}</span> project{filtered.length !== 1 ? "s" : ""} found
              {activeFiltersCount > 0 && <span className={`ml-1`}> · filtered</span>}
            </p>
          </div>

          {loading ? (
            <div className="space-y-5">
              {[1, 2, 3].map(i => (
                <div key={i} className={`h-48 rounded-2xl border animate-pulse ${cardBg}`} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className={`rounded-2xl border p-16 text-center ${cardBg}`}>
              <div className="text-5xl mb-4">🔍</div>
              <h3 className={`text-xl font-bold mb-2 ${headingText}`}>No projects found</h3>
              <p className={`text-sm ${mutedText} mb-6 max-w-xs mx-auto`}>Try adjusting your filters or be the first to post a project in this space.</p>
              <div className="flex gap-3 justify-center">
                <button onClick={() => setFilters({ category: "All", status: "All", role: "All Roles", searchQuery: "" })}
                  className={`px-5 py-2.5 rounded-xl text-sm font-medium border transition-all hover:scale-105 ${darkMode ? "border-gray-700 text-gray-400 hover:bg-gray-800" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
                  Clear filters
                </button>
                <button onClick={() => setShowModal(true)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r ${accentGradient} text-white hover:scale-105 transition-all`}>
                  Post a project →
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {filtered.map((p, i) => <ProjectCard key={p._id} p={p} darkMode={darkMode} idx={i} />)}
            </div>
          )}
        </main>
      </div>

      {/* ── CREATE MODAL ── */}
      {showModal && (
        <CreateModal
          darkMode={darkMode}
          onClose={() => setShowModal(false)}
          onCreate={p => setProjects(prev => [p, ...prev])}
        />
      )}

      <style>{`
        @keyframes slideUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
      `}</style>
    </div>
  );
}