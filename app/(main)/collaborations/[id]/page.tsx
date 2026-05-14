"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useAppSelector } from "@/redux/hooks";
import {
  ArrowLeft, Edit3, UserPlus, Trash2, Send, Github,
  Calendar, Clock, Users, ChevronDown, X, CheckCircle, ExternalLink, Copy,
  Briefcase, Sparkles, Layers, Target, Code2, Share2, UserCheck
} from "lucide-react";

// ─── Types (unchanged) ──────────────────────────────────────────────────────
interface TeamMember {
  _id: string;
  user: { _id: string; username: string; avatar?: string };
  roleAssigned: string;
  joinedAt?: string;
}

interface Project {
  _id: string;
  title: string;
  description: string;
  problemStatement?: string;
  category: string;
  techStackUsed: string[];
  status: string;
  rolesLookingFor: string[];
  totalTeamSize: number;
  currentTeamMembers: TeamMember[];
  createdBy: { _id: string; username: string; avatar?: string };
  contact?: string;
  file?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Mock data (same as original) ───────────────────────────────────────────
const MOCK_PROJECT: Project = {
  _id: "1", title: "AI-Powered Health Tracker",
  description: "A smart wearable companion that uses ML to predict health anomalies before they become critical — real-time vitals, personalized coaching, and emergency alerts that notify your care team automatically.",
  problemStatement: "Early disease detection is expensive and inaccessible to most people globally. Existing wearables capture data but don't act on it intelligently. We want to change that with a proactive, always-on AI health layer.",
  category: "AI/ML", techStackUsed: ["Python", "TensorFlow", "React Native", "FastAPI", "PostgreSQL", "Redis"],
  status: "Open", rolesLookingFor: ["ML Engineer", "Mobile Dev", "Backend Dev", "UI/UX Designer"],
  totalTeamSize: 5,
  currentTeamMembers: [
    { _id: "m1", user: { _id: "u1", username: "navkirat" }, roleAssigned: "Project Lead", joinedAt: "2025-03-10T10:00:00Z" },
    { _id: "m2", user: { _id: "u2", username: "sophie_ml" }, roleAssigned: "ML Engineer", joinedAt: "2025-03-12T10:00:00Z" },
  ],
  createdBy: { _id: "u1", username: "navkirat" },
  contact: "nav@devconnect.io",
  file: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1200&q=80",
  createdAt: "2025-03-10T10:00:00Z", updatedAt: "2025-04-01T10:00:00Z",
};

// ─── Helpers (unchanged) ────────────────────────────────────────────────────
const fmt = (d: string) => new Date(d).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" });
const ago = (d: string) => {
  const days = Math.floor((Date.now() - new Date(d).getTime()) / 86400000);
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
};

const statusMeta: Record<string, { dot: string; text: string; bg: string }> = {
  "Open":        { dot: "bg-green-400 animate-pulse", text: "text-green-400",  bg: "bg-green-500/15 border-green-500/30"   },
  "In Progress": { dot: "bg-blue-400",                text: "text-blue-400",   bg: "bg-blue-500/15 border-blue-500/30"     },
  "On Hold":     { dot: "bg-amber-400",               text: "text-amber-400",  bg: "bg-amber-500/15 border-amber-500/30"   },
  "Completed":   { dot: "bg-gray-400",                text: "text-gray-400",   bg: "bg-gray-500/15 border-gray-500/30"     },
  "Closed":      { dot: "bg-red-400",                 text: "text-red-400",    bg: "bg-red-500/15 border-red-500/30"       },
};

const categoryColors: Record<string, string> = {
  "AI/ML":      "bg-violet-500/15 text-violet-400 border-violet-500/30",
  "Web Dev":    "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
  "Blockchain": "bg-amber-500/15 text-amber-400 border-amber-500/30",
  "IoT":        "bg-green-500/15 text-green-400 border-green-500/30",
  "App Dev":    "bg-fuchsia-500/15 text-fuchsia-400 border-fuchsia-500/30",
};

const avatarGradients = [
  "from-violet-500 to-fuchsia-500", "from-cyan-500 to-blue-500",
  "from-fuchsia-500 to-pink-500",   "from-amber-500 to-orange-500",
  "from-green-500 to-emerald-500",  "from-blue-500 to-violet-500",
];

const accentGradient = "from-violet-500 via-fuchsia-500 to-cyan-400";

// ─── Modal Components (unchanged, but reused) ───────────────────────────────
const Modal = ({ children, onClose, darkMode }: { children: React.ReactNode; onClose: () => void; darkMode: boolean }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)" }} onClick={onClose}>
    <div className={`w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden ${darkMode ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"}`} onClick={e => e.stopPropagation()}>
      {children}
    </div>
  </div>
);

const EditModal = ({ darkMode, project, onClose, onSave }: { darkMode: boolean; project: Project; onClose: () => void; onSave: (d: Partial<Project>) => void }) => {
  const [description, setDescription] = useState(project.description);
  const [status, setStatus] = useState(project.status);
  const [rolesStr, setRolesStr] = useState(project.rolesLookingFor.join(", "));
  const inputCls = `w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all focus:ring-2 focus:ring-violet-500/30 ${darkMode ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-violet-500/60" : "bg-gray-50 border-gray-200 text-gray-900 focus:border-violet-400"}`;
  const labelCls = `block text-xs font-semibold mb-1.5 ${darkMode ? "text-gray-300" : "text-gray-700"}`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ description, status, rolesLookingFor: rolesStr.split(",").map(r => r.trim()).filter(Boolean) });
    onClose();
  };

  return (
    <Modal darkMode={darkMode} onClose={onClose}>
      <div className={`flex items-center justify-between px-6 py-5 border-b ${darkMode ? "border-gray-800" : "border-gray-100"}`}>
        <div><h2 className={`text-base font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>Edit project requirements</h2><p className={`text-xs mt-0.5 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Update description, status, and open roles</p></div>
        <button onClick={onClose} className={`w-8 h-8 rounded-full flex items-center justify-center ${darkMode ? "hover:bg-gray-800 text-gray-400" : "hover:bg-gray-100 text-gray-500"}`}><X className="w-4 h-4" /></button>
      </div>
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div><label className={labelCls}>Description <span className="text-red-400">*</span></label><textarea rows={4} className={`${inputCls} resize-none`} value={description} onChange={e => setDescription(e.target.value)} required /></div>
        <div><label className={labelCls}>Status <span className="text-red-400">*</span></label><div className="relative"><select className={`${inputCls} pr-9 appearance-none`} value={status} onChange={e => setStatus(e.target.value)} required>{Object.keys(statusMeta).map(s => <option key={s}>{s}</option>)}</select><ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" /></div></div>
        <div><label className={labelCls}>Roles looking for <span className="text-red-400">*</span></label><input className={inputCls} value={rolesStr} onChange={e => setRolesStr(e.target.value)} placeholder="Frontend Dev, ML Engineer…" required /><p className={`text-[11px] mt-1.5 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>Separate with commas</p></div>
        <div className={`flex gap-3 pt-2 border-t ${darkMode ? "border-gray-800" : "border-gray-100"}`}><button type="button" onClick={onClose} className={`flex-1 py-2.5 rounded-xl text-sm font-medium border ${darkMode ? "border-gray-700 text-gray-400 hover:bg-gray-800" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}>Cancel</button><button type="submit" className={`flex-1 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r ${accentGradient} text-white shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40 hover:scale-[1.02] transition-all`}>Save changes</button></div>
      </form>
    </Modal>
  );
};

const AddTeammateModal = ({ darkMode, roles, onClose, onAdd }: { darkMode: boolean; roles: string[]; onClose: () => void; onAdd: (m: TeamMember) => void }) => {
  const [username, setUsername] = useState("");
  const [roleAssigned, setRoleAssigned] = useState("");
  const inputCls = `w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all focus:ring-2 focus:ring-violet-500/30 ${darkMode ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-violet-500/60" : "bg-gray-50 border-gray-200 text-gray-900 focus:border-violet-400"}`;
  const labelCls = `block text-xs font-semibold mb-1.5 ${darkMode ? "text-gray-300" : "text-gray-700"}`;
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onAdd({ _id: Date.now().toString(), user: { _id: "new", username }, roleAssigned, joinedAt: new Date().toISOString() }); onClose(); };
  return (
    <Modal darkMode={darkMode} onClose={onClose}>
      <div className={`flex items-center justify-between px-6 py-5 border-b ${darkMode ? "border-gray-800" : "border-gray-100"}`}><div><h2 className={`text-base font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>Add team member</h2><p className={`text-xs mt-0.5 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Assign a dev to an open role</p></div><button onClick={onClose} className={`w-8 h-8 rounded-full flex items-center justify-center ${darkMode ? "hover:bg-gray-800 text-gray-400" : "hover:bg-gray-100 text-gray-500"}`}><X className="w-4 h-4" /></button></div>
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div><label className={labelCls}>Username <span className="text-red-400">*</span></label><input className={inputCls} placeholder="devhandle" value={username} onChange={e => setUsername(e.target.value)} required /></div>
        <div><label className={labelCls}>Role to assign <span className="text-red-400">*</span></label><div className="relative"><select className={`${inputCls} pr-9 appearance-none`} value={roleAssigned} onChange={e => setRoleAssigned(e.target.value)} required><option value="">Select a role</option>{roles.map(r => <option key={r}>{r}</option>)}</select><ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" /></div></div>
        <div className={`flex gap-3 pt-2 border-t ${darkMode ? "border-gray-800" : "border-gray-100"}`}><button type="button" onClick={onClose} className={`flex-1 py-2.5 rounded-xl text-sm font-medium border ${darkMode ? "border-gray-700 text-gray-400 hover:bg-gray-800" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}>Cancel</button><button type="submit" className={`flex-1 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r ${accentGradient} text-white shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40 hover:scale-[1.02] transition-all`}>Add to team</button></div>
      </form>
    </Modal>
  );
};

const ApplyModal = ({ darkMode, roles, onClose }: { darkMode: boolean; roles: string[]; onClose: () => void }) => {
  const [form, setForm] = useState({ username: "", email: "", github: "", message: "", role: "" });
  const [submitted, setSubmitted] = useState(false);
  const inputCls = `w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all focus:ring-2 focus:ring-violet-500/30 ${darkMode ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-violet-500/60" : "bg-gray-50 border-gray-200 text-gray-900 focus:border-violet-400"}`;
  const labelCls = `block text-xs font-semibold mb-1.5 ${darkMode ? "text-gray-300" : "text-gray-700"}`;
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); setSubmitted(true); setTimeout(onClose, 1800); };
  if (submitted) return (<Modal darkMode={darkMode} onClose={onClose}><div className="p-10 text-center flex flex-col items-center gap-3"><div className={`w-14 h-14 rounded-full bg-gradient-to-br ${accentGradient} flex items-center justify-center`}><CheckCircle className="w-7 h-7 text-white" /></div><h3 className={`text-lg font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>Application sent!</h3><p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>The team will review your application and get back to you.</p></div></Modal>);
  return (
    <Modal darkMode={darkMode} onClose={onClose}>
      <div className={`flex items-center justify-between px-6 py-5 border-b ${darkMode ? "border-gray-800" : "border-gray-100"}`}><div><h2 className={`text-base font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>Apply as collaborator</h2><p className={`text-xs mt-0.5 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Tell the team why you're a great fit</p></div><button onClick={onClose} className={`w-8 h-8 rounded-full flex items-center justify-center ${darkMode ? "hover:bg-gray-800 text-gray-400" : "hover:bg-gray-100 text-gray-500"}`}><X className="w-4 h-4" /></button></div>
      <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
        <div className="grid grid-cols-2 gap-3"><div><label className={labelCls}>Username <span className="text-red-400">*</span></label><input className={inputCls} placeholder="devhandle" value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} required /></div><div><label className={labelCls}>Email <span className="text-red-400">*</span></label><input type="email" className={inputCls} placeholder="you@email.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required /></div></div>
        <div><label className={labelCls}>GitHub profile</label><div className="relative"><Github className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${darkMode ? "text-gray-500" : "text-gray-400"}`} /><input className={`${inputCls} pl-10`} placeholder="github.com/username" value={form.github} onChange={e => setForm(f => ({ ...f, github: e.target.value }))} /></div></div>
        <div><label className={labelCls}>Role applying for <span className="text-red-400">*</span></label><div className="relative"><select className={`${inputCls} pr-9 appearance-none`} value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} required><option value="">Select a role</option>{roles.map(r => <option key={r}>{r}</option>)}</select><ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" /></div></div>
        <div><label className={labelCls}>Why are you a great fit? <span className="text-red-400">*</span></label><textarea rows={4} className={`${inputCls} resize-none`} placeholder="Share your relevant experience, why this project excites you…" value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} required /></div>
        <div className={`flex gap-3 pt-2 border-t ${darkMode ? "border-gray-800" : "border-gray-100"}`}><button type="button" onClick={onClose} className={`flex-1 py-2.5 rounded-xl text-sm font-medium border ${darkMode ? "border-gray-700 text-gray-400 hover:bg-gray-800" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}>Cancel</button><button type="submit" className={`flex-1 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r ${accentGradient} text-white shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40 hover:scale-[1.02] transition-all flex items-center justify-center gap-2`}><Send className="w-4 h-4" /> Send application</button></div>
      </form>
    </Modal>
  );
};

// ─── Main Page (Redesigned Layout) ──────────────────────────────────────────
export default function ProjectDetailPage() {
  const darkMode = useAppSelector((state: any) => state.Theme.darkMode);
  const params = useParams();
  const id = params?.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showApply, setShowApply] = useState(false);
  const [copied, setCopied] = useState(false);

  const isLeader = true; // Replace with actual check

  React.useEffect(() => {
    setTimeout(() => { setProject(MOCK_PROJECT); setLoading(false); }, 400);
  }, [id]);

  const copyContact = () => {
    if (project?.contact) { navigator.clipboard.writeText(project.contact); setCopied(true); setTimeout(() => setCopied(false), 2000); }
  };

  if (loading) return <LoadingSkeleton darkMode={darkMode} />;
  if (!project) return <NotFound darkMode={darkMode} />;

  const stat = statusMeta[project.status] || statusMeta["Open"];
  const catCls = categoryColors[project.category] || categoryColors["Web Dev"];
  const spotsLeft = project.totalTeamSize - project.currentTeamMembers.length;
  const bg = darkMode ? "bg-gray-900 text-white" : "bg-white text-gray-800";
  const cardBg = darkMode ? "bg-gray-800/80 border-gray-700" : "bg-white border-gray-200";
  const mutedText = darkMode ? "text-gray-400" : "text-gray-500";
  const headingText = darkMode ? "text-white" : "text-gray-900";
  const divider = darkMode ? "border-gray-700/60" : "border-gray-100";

  return (
    <div className={`min-h-screen ${bg} transition-colors duration-300 font-sans`}>
      {/* Sticky Header Navigation */}
      <div className={`sticky top-0 z-40 border-b ${divider} ${darkMode ? "bg-gray-900/90" : "bg-white/90"} backdrop-blur-md`}>
        <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between gap-4">
          <Link href="/project-collaboration">
            <button className={`flex items-center gap-2 text-sm font-medium transition-all hover:scale-105 ${darkMode ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900"}`}>
              <ArrowLeft className="w-4 h-4" /> All Projects
            </button>
          </Link>
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border ${stat.bg} ${stat.text}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${stat.dot}`} />{project.status}
            </span>
            <span className={`text-xs font-medium px-3 py-1.5 rounded-full border ${catCls}`}>{project.category}</span>
          </div>
        </div>
      </div>

      {/* Hero Section with Overlay and Stats */}
      <div className="relative h-80 md:h-96 overflow-hidden">
        {project.file ? (
          <img src={project.file} alt={project.title} className="w-full h-full object-cover" />
        ) : (
          <div className={`w-full h-full flex items-center justify-center text-9xl ${darkMode ? "bg-gray-800" : "bg-gray-100"}`}>
            {project.category === "AI/ML" ? "🤖" : project.category === "Blockchain" ? "🔗" : "💻"}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight drop-shadow-lg">{project.title}</h1>
            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-white/80">
              <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Posted {ago(project.createdAt)}</span>
              <span className="hidden md:inline">•</span>
              <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> Updated {ago(project.updatedAt)}</span>
              <span className="hidden md:inline">•</span>
              <span className="flex items-center gap-1.5"><Users className="w-4 h-4" /> {project.currentTeamMembers.length}/{project.totalTeamSize} members</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content: 2-Column Layout with Sticky Sidebar */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT COLUMN (Main Content) */}
          <div className="lg:col-span-2 space-y-8">
            {/* About Section with Gradient Accent */}
            <div className={`group relative rounded-2xl border overflow-hidden transition-all duration-300 hover:shadow-xl ${cardBg}`}>
              <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${accentGradient} opacity-0 group-hover:opacity-100 transition-opacity`} />
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-violet-400" />
                  <h2 className={`text-lg font-bold ${headingText}`}>About the project</h2>
                </div>
                <p className={`text-sm leading-relaxed ${mutedText}`}>{project.description}</p>
              </div>
            </div>

            {/* Problem Statement */}
            {project.problemStatement && (
              <div className={`group relative rounded-2xl border overflow-hidden transition-all duration-300 hover:shadow-xl ${cardBg}`}>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Target className="w-5 h-5 text-fuchsia-400" />
                    <h2 className={`text-lg font-bold ${headingText}`}>Problem statement</h2>
                  </div>
                  <div className={`relative pl-4 ${darkMode ? "text-gray-300" : "text-gray-600"} text-sm leading-relaxed`}>
                    <div className={`absolute left-0 top-0 bottom-0 w-0.5 rounded-full bg-gradient-to-b ${accentGradient}`} />
                    {project.problemStatement}
                  </div>
                </div>
              </div>
            )}

            {/* Technology Stack */}
            <div className={`group relative rounded-2xl border overflow-hidden transition-all duration-300 hover:shadow-xl ${cardBg}`}>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Layers className="w-5 h-5 text-cyan-400" />
                  <h2 className={`text-lg font-bold ${headingText}`}>Tech stack</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {project.techStackUsed.map(tech => (
                    <span key={tech} className={`px-3 py-1.5 rounded-xl border text-sm font-mono font-medium transition-all hover:scale-105 ${darkMode ? "bg-gray-700/60 border-gray-600 text-gray-300" : "bg-gray-50 border-gray-200 text-gray-700"}`}>
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Open Roles with Visual Progress */}
            <div className={`group relative rounded-2xl border overflow-hidden transition-all duration-300 hover:shadow-xl ${cardBg}`}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-amber-400" />
                    <h2 className={`text-lg font-bold ${headingText}`}>Open roles</h2>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${darkMode ? "bg-green-500/15 text-green-400 border border-green-500/30" : "bg-green-50 text-green-600 border border-green-200"}`}>
                    {spotsLeft} spot{spotsLeft !== 1 ? "s" : ""} left
                  </span>
                </div>
                <div className="space-y-3">
                  {project.rolesLookingFor.map(role => {
                    const taken = project.currentTeamMembers.some(m => m.roleAssigned === role);
                    return (
                      <div key={role} className={`flex items-center justify-between p-3 rounded-xl border transition-all hover:scale-[1.01] ${taken ? `${darkMode ? "bg-gray-700/30 border-gray-700" : "bg-gray-50 border-gray-100"} opacity-70` : `${darkMode ? "bg-gray-700/40 border-gray-600/50 hover:border-violet-500/40" : "bg-white border-gray-200 hover:border-violet-300"}`}`}>
                        <div className="flex items-center gap-3">
                          <span className={`w-2 h-2 rounded-full ${taken ? "bg-gray-400" : "bg-green-400 animate-pulse"}`} />
                          <span className={`text-sm font-medium ${taken ? mutedText : headingText}`}>{role}</span>
                        </div>
                        <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${taken ? `${darkMode ? "bg-gray-600/40 text-gray-400 border-gray-600" : "bg-gray-100 text-gray-400 border-gray-200"}` : `${darkMode ? "bg-green-500/15 text-green-400 border-green-500/30" : "bg-green-50 text-green-600 border-green-200"}`}`}>
                          {taken ? "Filled" : "Open"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Current Team */}
            <div className={`group relative rounded-2xl border overflow-hidden transition-all duration-300 hover:shadow-xl ${cardBg}`}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-400" />
                    <h2 className={`text-lg font-bold ${headingText}`}>Current team</h2>
                  </div>
                  <span className={`text-xs ${mutedText}`}>{project.currentTeamMembers.length}/{project.totalTeamSize} members</span>
                </div>
                {project.currentTeamMembers.length === 0 ? (
                  <p className={`text-sm ${mutedText} text-center py-4`}>No members yet — be the first to join!</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {project.currentTeamMembers.map((m, i) => (
                      <div key={m._id} className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all hover:scale-[1.01] ${darkMode ? "bg-gray-700/40 border-gray-600/40 hover:border-gray-500" : "bg-gray-50 border-gray-100 hover:border-gray-200"}`}>
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${avatarGradients[i % avatarGradients.length]} flex items-center justify-center text-sm font-bold text-white shrink-0`}>
                          {m.user.username.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className={`text-sm font-semibold truncate ${headingText}`}>{m.user.username}</p>
                          <p className={`text-xs truncate ${darkMode ? "text-violet-400" : "text-violet-600"}`}>{m.roleAssigned}</p>
                          {m.joinedAt && <p className={`text-[10px] mt-0.5 ${mutedText}`}>Joined {ago(m.joinedAt)}</p>}
                        </div>
                      </div>
                    ))}
                    {Array.from({ length: Math.max(0, project.totalTeamSize - project.currentTeamMembers.length) }).map((_, i) => (
                      <div key={`empty-${i}`} className={`flex items-center gap-3 p-3.5 rounded-xl border border-dashed ${darkMode ? "border-gray-700 opacity-40" : "border-gray-200 opacity-50"}`}>
                        <div className={`w-10 h-10 rounded-xl border-2 border-dashed flex items-center justify-center ${darkMode ? "border-gray-600" : "border-gray-300"}`}>
                          <span className={`text-lg ${mutedText}`}>?</span>
                        </div>
                        <div><p className={`text-xs font-medium ${mutedText}`}>Open spot</p><p className={`text-[11px] ${mutedText}`}>Waiting for you</p></div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN (Sticky Sidebar) */}
          <div className="space-y-6 lg:sticky lg:top-24 self-start">
            {/* Leader Card */}
            <div className={`rounded-2xl border p-5 transition-all hover:shadow-lg ${cardBg}`}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${avatarGradients[0]} flex items-center justify-center font-bold text-white text-lg`}>
                  {project.createdBy.username[0].toUpperCase()}
                </div>
                <div>
                  <p className={`font-semibold text-sm ${headingText}`}>{project.createdBy.username}</p>
                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${darkMode ? "bg-amber-500/15 text-amber-400" : "bg-amber-50 text-amber-600"}`}>Project Lead</span>
                </div>
              </div>
              <div className={`space-y-2 text-xs border-t pt-3 ${divider}`}>
                <div className="flex justify-between"><span className={mutedText}>Posted</span><span className={headingText}>{fmt(project.createdAt)}</span></div>
                <div className="flex justify-between"><span className={mutedText}>Updated</span><span className={headingText}>{fmt(project.updatedAt)}</span></div>
                <div className="flex justify-between"><span className={mutedText}>Team size</span><span className={headingText}>{project.currentTeamMembers.length} / {project.totalTeamSize}</span></div>
              </div>
            </div>

            {/* Quick Stats Card */}
            <div className={`rounded-2xl border p-5 ${cardBg}`}>
              <h3 className={`text-sm font-bold mb-3 flex items-center gap-2 ${headingText}`}><Sparkles className="w-4 h-4 text-violet-400" /> Quick stats</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className={`p-2 text-center rounded-xl ${darkMode ? "bg-gray-700/40" : "bg-gray-50"}`}>
                  <div className="text-2xl font-bold text-violet-400">{spotsLeft}</div>
                  <div className="text-[10px]">Spots left</div>
                </div>
                <div className={`p-2 text-center rounded-xl ${darkMode ? "bg-gray-700/40" : "bg-gray-50"}`}>
                  <div className="text-2xl font-bold text-cyan-400">{project.currentTeamMembers.length}</div>
                  <div className="text-[10px]">Members</div>
                </div>
                <div className={`p-2 text-center rounded-xl ${darkMode ? "bg-gray-700/40" : "bg-gray-50"}`}>
                  <div className="text-2xl font-bold text-fuchsia-400">{project.rolesLookingFor.length}</div>
                  <div className="text-[10px]">Open roles</div>
                </div>
                <div className={`p-2 text-center rounded-xl ${darkMode ? "bg-gray-700/40" : "bg-gray-50"}`}>
                  <div className="text-2xl font-bold text-amber-400">{project.techStackUsed.length}</div>
                  <div className="text-[10px]">Tech stack</div>
                </div>
              </div>
            </div>

            {/* Contact */}
            {project.contact && (
              <div className={`rounded-2xl border p-5 ${cardBg}`}>
                <h3 className={`text-sm font-bold mb-3 flex items-center gap-2 ${headingText}`}><UserCheck className="w-4 h-4 text-green-400" /> Contact</h3>
                <div className={`flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl border text-xs ${darkMode ? "bg-gray-700/50 border-gray-600/50 text-gray-300" : "bg-gray-50 border-gray-200 text-gray-600"}`}>
                  <span className="truncate">{project.contact}</span>
                  <button onClick={copyContact} className={`shrink-0 transition-colors ${copied ? "text-green-400" : darkMode ? "text-gray-400 hover:text-gray-200" : "text-gray-400 hover:text-gray-700"}`}>
                    {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Primary CTA */}
            <button onClick={() => setShowApply(true)}
              className={`w-full py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 bg-gradient-to-r ${accentGradient} text-white shadow-xl shadow-violet-500/20 hover:shadow-violet-500/40 transition-all hover:scale-[1.02] active:scale-[0.98]`}>
              <Send className="w-4 h-4" /> Apply as collaborator
            </button>

            {/* Management Section (only for leader) */}
            {isLeader && (
              <div className={`rounded-2xl border p-5 space-y-2 ${cardBg}`}>
                <h3 className={`text-sm font-bold mb-3 flex items-center gap-2 ${headingText}`}><Briefcase className="w-4 h-4" /> Management</h3>
                <button onClick={() => setShowAddMember(true)}
                  className={`w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all hover:scale-[1.01] ${darkMode ? "border-violet-500/40 text-violet-400 hover:bg-violet-500/10" : "border-violet-200 text-violet-600 hover:bg-violet-50"}`}>
                  <UserPlus className="w-4 h-4" /> Add team member
                </button>
                <button onClick={() => setShowEdit(true)}
                  className={`w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all hover:scale-[1.01] ${darkMode ? "border-amber-500/40 text-amber-400 hover:bg-amber-500/10" : "border-amber-200 text-amber-600 hover:bg-amber-50"}`}>
                  <Edit3 className="w-4 h-4" /> Edit requirements
                </button>
                <button
                  className={`w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all hover:scale-[1.01] ${darkMode ? "border-red-500/40 text-red-400 hover:bg-red-500/10" : "border-red-200 text-red-500 hover:bg-red-50"}`}>
                  <Trash2 className="w-4 h-4" /> Delete project
                </button>
              </div>
            )}

            {/* Share */}
            <div className={`rounded-2xl border p-5 ${cardBg}`}>
              <h3 className={`text-sm font-bold mb-3 flex items-center gap-2 ${headingText}`}><Share2 className="w-4 h-4" /> Share</h3>
              <button onClick={() => navigator.clipboard.writeText(window.location.href)}
                className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all hover:scale-[1.01] ${darkMode ? "border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-gray-200" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
                <ExternalLink className="w-4 h-4" /> Copy project link
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showEdit && <EditModal darkMode={darkMode} project={project} onClose={() => setShowEdit(false)} onSave={d => setProject(p => p ? { ...p, ...d } : p)} />}
      {showAddMember && <AddTeammateModal darkMode={darkMode} roles={project.rolesLookingFor} onClose={() => setShowAddMember(false)} onAdd={m => setProject(p => p ? { ...p, currentTeamMembers: [...p.currentTeamMembers, m] } : p)} />}
      {showApply && <ApplyModal darkMode={darkMode} roles={project.rolesLookingFor} onClose={() => setShowApply(false)} />}
    </div>
  );
}

// ─── Loading & Error Components ──────────────────────────────────────────────
function LoadingSkeleton({ darkMode }: { darkMode: boolean }) {
  return (
    <div className={`min-h-screen ${darkMode ? "bg-gray-900" : "bg-white"} transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6 animate-pulse">
        <div className={`h-10 w-40 rounded-xl ${darkMode ? "bg-gray-800" : "bg-gray-100"}`} />
        <div className={`h-80 rounded-2xl ${darkMode ? "bg-gray-800" : "bg-gray-100"}`} />
        <div className="grid grid-cols-3 gap-8">
          <div className="col-span-2 space-y-6"><div className={`h-48 rounded-2xl ${darkMode ? "bg-gray-800" : "bg-gray-100"}`} /><div className={`h-48 rounded-2xl ${darkMode ? "bg-gray-800" : "bg-gray-100"}`} /></div>
          <div className="space-y-6"><div className={`h-64 rounded-2xl ${darkMode ? "bg-gray-800" : "bg-gray-100"}`} /><div className={`h-32 rounded-2xl ${darkMode ? "bg-gray-800" : "bg-gray-100"}`} /></div>
        </div>
      </div>
    </div>
  );
}

function NotFound({ darkMode }: { darkMode: boolean }) {
  return (
    <div className={`min-h-screen ${darkMode ? "bg-gray-900 text-white" : "bg-white text-gray-800"} flex items-center justify-center`}>
      <div className="text-center">
        <div className="text-5xl mb-4">🔍</div>
        <h2 className={`text-xl font-bold mb-2 ${darkMode ? "text-white" : "text-gray-900"}`}>Project not found</h2>
        <Link href="/project-collaboration">
          <button className={`mt-4 px-6 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r ${accentGradient} text-white`}>← Back to projects</button>
        </Link>
      </div>
    </div>
  );
}