"use client";

import React, { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Plus, Search, X, Users, Clock, CheckCircle,
  TrendingUp, Filter, Star, ArrowRight,
  FolderOpen, ChevronDown, Globe, Lock,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────
export interface ProjectMember {
  _id: string; username: string; avatar: string; role: string;
}
export interface Project {
  _id: string; title: string; description: string; category: string;
  status: "Open"|"In Progress"|"On Hold"|"Completed"|"Closed";
  progress: number; visibility: "public"|"private";
  techStack: string[]; members: ProjectMember[]; totalTasks: number;
  completedTasks: number; isStarred: boolean; lastActivity: string;
  createdAt: string; role: string;
}

// ─── Mock data ─────────────────────────────────────────────────
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

// ─── Helper: hash for avatar colors ───────────────────────────
const avatarColors = [
  "bg-purple-500", "bg-cyan-500", "bg-pink-500", "bg-amber-500", "bg-green-500", "bg-blue-500",
];
const getAvatarColor = (id: string) => avatarColors[id.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % avatarColors.length];

// ─── Status and category config (simple) ──────────────────────
const statusStyles: Record<string, { bg: string; text: string }> = {
  "Open": { bg: "bg-green-100", text: "text-green-700" },
  "In Progress": { bg: "bg-blue-100", text: "text-blue-700" },
  "On Hold": { bg: "bg-amber-100", text: "text-amber-700" },
  "Completed": { bg: "bg-gray-100", text: "text-gray-700" },
  "Closed": { bg: "bg-red-100", text: "text-red-700" },
};
const categoryStyles: Record<string, string> = {
  "AI/ML": "bg-purple-100 text-purple-700",
  "Blockchain": "bg-amber-100 text-amber-700",
  "IoT": "bg-green-100 text-green-700",
  "Web Dev": "bg-cyan-100 text-cyan-700",
  "App Dev": "bg-pink-100 text-pink-700",
};
const roleStyles: Record<string, string> = {
  "Project Lead": "bg-purple-100 text-purple-700",
  "Frontend Dev": "bg-cyan-100 text-cyan-700",
  "Backend Dev": "bg-blue-100 text-blue-700",
  "Contributor": "bg-gray-100 text-gray-700",
};

// ─── Simple Modal for creating project ────────────────────────
function CreateModal({ onClose, onCreate }: { onClose: () => void; onCreate: (p: Project) => void }) {
  const [form, setForm] = useState({
    title: "", description: "", category: "Web Dev", visibility: "public" as "public" | "private",
    techStack: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error("Project name is required");
      return;
    }
    const newProject: Project = {
      _id: `p${Date.now()}`,
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category,
      status: "Open",
      progress: 0,
      visibility: form.visibility,
      techStack: form.techStack.split(",").map(t => t.trim()).filter(Boolean),
      members: [{ _id: "me", username: "you", avatar: "ME", role: "Project Lead" }],
      totalTasks: 0,
      completedTasks: 0,
      isStarred: false,
      lastActivity: "just now",
      createdAt: new Date().toISOString().slice(0, 10),
      role: "Project Lead",
    };
    onCreate(newProject);
    onClose();
    toast.success("Project created!");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-gray-200" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Create new project</h2>
            <p className="text-xs text-gray-500 mt-0.5">Set up your project workspace</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Project name *</label>
            <input className="w-full px-3 py-2 border border-gray-200 rounded-lg" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea rows={3} className="w-full px-3 py-2 border border-gray-200 rounded-lg resize-none" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select className="w-full px-3 py-2 border border-gray-200 rounded-lg" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                {["AI/ML", "Web Dev", "Blockchain", "IoT", "App Dev"].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Visibility</label>
              <div className="flex gap-2">
                <button type="button" onClick={() => setForm(f => ({ ...f, visibility: "public" }))} className={`flex-1 py-1.5 text-sm rounded-lg border ${form.visibility === "public" ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-700 border-gray-200"}`}>Public</button>
                <button type="button" onClick={() => setForm(f => ({ ...f, visibility: "private" }))} className={`flex-1 py-1.5 text-sm rounded-lg border ${form.visibility === "private" ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-700 border-gray-200"}`}>Private</button>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tech stack (comma separated)</label>
            <input className="w-full px-3 py-2 border border-gray-200 rounded-lg" placeholder="React, Node.js, MongoDB" value={form.techStack} onChange={e => setForm(f => ({ ...f, techStack: e.target.value }))} />
          </div>
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button type="button" onClick={onClose} className="flex-1 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">Cancel</button>
            <button type="submit" className="flex-1 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800">Create project</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Project Card ──────────────────────────────────────────────
function ProjectCard({ project, onStar }: { project: Project; onStar: () => void }) {
  const statusStyle = statusStyles[project.status] || statusStyles["Open"];
  const categoryStyle = categoryStyles[project.category] || "bg-gray-100 text-gray-700";
  const roleStyle = roleStyles[project.role] || "bg-gray-100 text-gray-700";
  const progress = Math.round((project.completedTasks / project.totalTasks) * 100) || 0;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
      <div className="p-5">
        {/* Header */}
        <div className="flex justify-between items-start gap-3 mb-3">
          <div>
            <div className="flex flex-wrap gap-2 mb-1.5">
              <span className={`text-xs px-2 py-0.5 rounded-full ${categoryStyle}`}>{project.category}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${statusStyle.bg} ${statusStyle.text}`}>{project.status}</span>
              {project.visibility === "private" && <Lock className="w-3 h-3 text-gray-400" />}
            </div>
            <h3 className="text-base font-bold text-gray-900">{project.title}</h3>
          </div>
          <button onClick={onStar} className="shrink-0">
            <Star className={`w-5 h-5 ${project.isStarred ? "fill-amber-400 text-amber-400" : "text-gray-300"}`} />
          </button>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{project.description}</p>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>{project.completedTasks}/{project.totalTasks} tasks</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-gray-900 rounded-full" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Tech stack */}
        {project.techStack.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {project.techStack.slice(0, 4).map(tech => (
              <span key={tech} className="text-xs px-2 py-0.5 rounded-md bg-gray-100 text-gray-700">{tech}</span>
            ))}
            {project.techStack.length > 4 && <span className="text-xs text-gray-400">+{project.techStack.length - 4}</span>}
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-between items-center pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-1">
              {project.members.slice(0, 3).map(m => (
                <div key={m._id} className={`w-6 h-6 rounded-lg ${getAvatarColor(m._id)} flex items-center justify-center text-[9px] font-bold text-white ring-1 ring-white`}>
                  {m.avatar.slice(0, 1)}
                </div>
              ))}
              {project.members.length > 3 && <div className="w-6 h-6 rounded-lg bg-gray-200 flex items-center justify-center text-[9px] font-bold text-gray-600 ring-1 ring-white">+{project.members.length - 3}</div>}
            </div>
            <span className="text-xs text-gray-500">{project.members.length} members</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs px-2 py-0.5 rounded-full ${roleStyle}`}>{project.role}</span>
            <span className="text-xs text-gray-400">{project.lastActivity}</span>
          </div>
        </div>
      </div>
      <Link href={`/team-workspace/${project._id}`}>
        <div className="px-5 py-3 border-t border-gray-100 text-sm text-gray-600 hover:bg-gray-50 flex justify-between items-center">
          <span>Open workspace</span>
          <ArrowRight className="w-4 h-4" />
        </div>
      </Link>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────
export default function WorkspaceHubPage() {
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [activeTab, setActiveTab] = useState<"all"|"leading"|"contributing"|"starred">("all");

  const stats = {
    total: projects.length,
    leading: projects.filter(p => p.role === "Project Lead").length,
    active: projects.filter(p => ["Open", "In Progress"].includes(p.status)).length,
    completed: projects.filter(p => p.status === "Completed").length,
  };

  const filtered = projects.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = !q || p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.techStack.some(t => t.toLowerCase().includes(q));
    const matchStatus = filterStatus === "All" || p.status === filterStatus;
    const matchTab = activeTab === "all" ? true : activeTab === "leading" ? p.role === "Project Lead" : activeTab === "contributing" ? p.role !== "Project Lead" : p.isStarred;
    return matchSearch && matchStatus && matchTab;
  });

  const tabs = [
    { key: "all", label: "All", count: projects.length },
    { key: "leading", label: "Leading", count: stats.leading },
    { key: "contributing", label: "Contributing", count: projects.length - stats.leading },
    { key: "starred", label: "Starred", count: projects.filter(p => p.isStarred).length },
  ] as const;

  return (
    <div className="bg-gray-50 min-h-screen font-sans py-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-3 py-1 text-xs text-green-700 mb-3">
            <FolderOpen className="w-3.5 h-3.5" /> Team Workspace · {stats.active} active projects
          </div>
          <h1 className="text-3xl font-bold text-gray-900">My Workspaces</h1>
          <p className="text-sm text-gray-500 mt-1">All your projects in one place — track tasks, manage teams, and keep collaboration on schedule.</p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-xs text-gray-500">Total</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <div className="text-xs text-gray-500">Active</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.leading}</div>
            <div className="text-xs text-gray-500">Leading</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-4 text-center">
            <div className="text-2xl font-bold text-gray-500">{stats.completed}</div>
            <div className="text-xs text-gray-500">Completed</div>
          </div>
        </div>

        {/* Controls bar */}
        <div className="flex flex-wrap gap-3 items-center justify-between">
          <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md ${activeTab === tab.key ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:bg-gray-200"}`}
              >
                {tab.label} {tab.count > 0 && `(${tab.count})`}
              </button>
            ))}
          </div>
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects, tech, roles..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
          >
            {["All", "Open", "In Progress", "On Hold", "Completed", "Closed"].map(s => <option key={s}>{s}</option>)}
          </select>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gray-900 text-white text-sm hover:bg-gray-800"
          >
            <Plus className="w-4 h-4" /> New Project
          </button>
        </div>

        {/* Project grid */}
        {filtered.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
            <div className="text-4xl mb-3">🗂️</div>
            <h3 className="text-lg font-semibold text-gray-900">No projects found</h3>
            <p className="text-sm text-gray-500 mt-1 mb-4">Try adjusting your filters or create your first project.</p>
            <button onClick={() => setShowCreate(true)} className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800">Create a project →</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(project => (
              <ProjectCard key={project._id} project={project} onStar={() => setProjects(prev => prev.map(p => p._id === project._id ? { ...p, isStarred: !p.isStarred } : p))} />
            ))}
          </div>
        )}
      </div>

      {showCreate && <CreateModal onClose={() => setShowCreate(false)} onCreate={p => setProjects(prev => [p, ...prev])} />}
    </div>
  );
}