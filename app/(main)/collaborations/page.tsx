"use client";

import React, { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Search, X, Plus, Users, Calendar, ArrowRight, Briefcase, ChevronDown, Layers } from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────
interface Project {
  _id: string;
  title: string;
  description: string;
  category: string;
  techStackUsed: string[];
  status: "Open" | "In Progress" | "On Hold" | "Completed";
  rolesLookingFor: string[];
  totalTeamSize: number;
  currentTeamMembers: { _id: string; username: string }[];
  createdBy: { _id: string; username: string };
  file?: string;
  createdAt: string;
}

// ─── Mock Data ──────────────────────────────────────────────────────
const MOCK_PROJECTS: Project[] = [
  { _id: "1", title: "AI-Powered Health Tracker", description: "Smart wearable companion using ML to predict health anomalies.", category: "AI/ML", techStackUsed: ["Python", "TensorFlow", "React Native"], status: "Open", rolesLookingFor: ["ML Engineer", "Mobile Dev"], totalTeamSize: 5, currentTeamMembers: [{ _id: "u1", username: "navkirat" }], createdBy: { _id: "u1", username: "navkirat" }, file: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&q=80", createdAt: "2025-03-10T10:00:00Z" },
  { _id: "2", title: "Decentralized Freelance Marketplace", description: "Peer-to-peer gig platform on Ethereum with smart contracts.", category: "Blockchain", techStackUsed: ["Solidity", "Next.js", "Hardhat"], status: "In Progress", rolesLookingFor: ["Blockchain Dev", "Frontend Dev"], totalTeamSize: 4, currentTeamMembers: [{ _id: "u2", username: "alex_eth" }], createdBy: { _id: "u2", username: "alex_eth" }, file: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&q=80", createdAt: "2025-02-20T08:00:00Z" },
  { _id: "3", title: "Open Source Code Review AI", description: "GitHub bot that performs deep semantic code review using LLMs.", category: "Web Dev", techStackUsed: ["TypeScript", "Node.js", "OpenAI"], status: "Open", rolesLookingFor: ["Backend Dev", "ML Engineer"], totalTeamSize: 3, currentTeamMembers: [], createdBy: { _id: "u4", username: "marcus_oss" }, file: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=400&q=80", createdAt: "2025-03-25T12:00:00Z" },
];

const CATEGORIES = ["All", "AI/ML", "Web Dev", "Blockchain", "IoT", "App Dev"];
const STATUSES = ["All", "Open", "In Progress", "On Hold", "Completed"];
const ROLES = ["All Roles", "Frontend Dev", "Backend Dev", "ML Engineer", "Blockchain Dev"];

function timeAgo(date: string) {
  const days = Math.floor((Date.now() - new Date(date).getTime()) / 86400000);
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

// ─── Components ─────────────────────────────────────────────────────
function ProjectCard({ project }: { project: Project }) {
  const statusColor = project.status === "Open" ? "text-green-700 bg-green-50" : "text-gray-600 bg-gray-100";

  return (
    <div className="bg-white border border-[#E8EDF2] rounded-2xl overflow-hidden hover:shadow-md transition">
      <div className="flex flex-col sm:flex-row">
        {project.file && (
          <div className="sm:w-48 h-40 sm:h-auto overflow-hidden">
            <img src={project.file} alt={project.title} className="w-full h-full object-cover" />
          </div>
        )}
        <div className="flex-1 p-5">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-lg font-bold text-[#0D1B2A]">{project.title}</h3>
              <div className="flex items-center gap-2 mt-1 text-xs">
                <span className={`px-2 py-0.5 rounded-full ${statusColor}`}>{project.status}</span>
                <span className="text-[#64748B]">· {timeAgo(project.createdAt)}</span>
                <span className="text-[#64748B]">· {project.category}</span>
              </div>
            </div>
            <div className="text-right text-xs text-[#64748B]">
              <div className="flex items-center gap-1"><Users className="w-3 h-3" /> {project.currentTeamMembers.length}/{project.totalTeamSize}</div>
            </div>
          </div>
          <p className="text-sm text-[#64748B] mt-2 mb-3 line-clamp-2">{project.description}</p>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {project.techStackUsed.slice(0, 4).map(t => (
              <span key={t} className="text-[11px] px-2 py-1 rounded-full bg-[#F8FAFB] border border-[#E8EDF2] text-[#0D1B2A]">{t}</span>
            ))}
          </div>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex flex-wrap gap-1.5">
              {project.rolesLookingFor.map(r => (
                <span key={r} className="text-[11px] px-2 py-1 rounded-full bg-[#EDF7F3] text-[#0EA472]">{r}</span>
              ))}
            </div>
            <Link href={`/project-collaboration/${project._id}`}>
              <button className="flex items-center gap-1.5 text-sm font-medium text-white bg-[#0D1B2A] px-4 py-1.5 rounded-xl hover:bg-[#1E3A5F] transition">
                View <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Create Project Modal (simplified) ─────────────────────────────
function CreateModal({ onClose, onCreate }: { onClose: () => void; onCreate: (p: Project) => void }) {
  const [form, setForm] = useState({ title: "", description: "", category: "AI/ML", techStack: "", roles: "", teamSize: "3", file: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    const newProject: Project = {
      _id: Date.now().toString(),
      title: form.title,
      description: form.description,
      category: form.category,
      techStackUsed: form.techStack.split(",").map(s => s.trim()).filter(Boolean),
      status: "Open",
      rolesLookingFor: form.roles.split(",").map(s => s.trim()).filter(Boolean),
      totalTeamSize: parseInt(form.teamSize) || 3,
      currentTeamMembers: [],
      createdBy: { _id: "me", username: "you" },
      file: form.file || undefined,
      createdAt: new Date().toISOString(),
    };
    onCreate(newProject);
    onClose();
    toast.success("Project posted!");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg border border-[#E8EDF2]">
        <div className="px-6 py-4 border-b border-[#E8EDF2] flex justify-between items-center">
          <h2 className="text-lg font-bold text-[#0D1B2A]">Post a new project</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#0D1B2A] mb-1">Title *</label>
            <input className="w-full px-3 py-2 border border-[#E8EDF2] rounded-xl focus:ring-2 focus:ring-[#0EA472]/30 focus:border-[#0EA472] outline-none" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#0D1B2A] mb-1">Description</label>
            <textarea rows={3} className="w-full px-3 py-2 border border-[#E8EDF2] rounded-xl resize-none focus:ring-2 focus:ring-[#0EA472]/30 focus:border-[#0EA472] outline-none" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-[#0D1B2A] mb-1">Category</label>
              <select className="w-full px-3 py-2 border border-[#E8EDF2] rounded-xl" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                {CATEGORIES.filter(c => c !== "All").map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0D1B2A] mb-1">Team size</label>
              <input type="number" className="w-full px-3 py-2 border border-[#E8EDF2] rounded-xl" value={form.teamSize} onChange={e => setForm(f => ({ ...f, teamSize: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#0D1B2A] mb-1">Tech stack (comma separated)</label>
            <input className="w-full px-3 py-2 border border-[#E8EDF2] rounded-xl" placeholder="React, Node.js, MongoDB" value={form.techStack} onChange={e => setForm(f => ({ ...f, techStack: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#0D1B2A] mb-1">Roles needed (comma separated)</label>
            <input className="w-full px-3 py-2 border border-[#E8EDF2] rounded-xl" placeholder="Frontend Dev, Backend Dev" value={form.roles} onChange={e => setForm(f => ({ ...f, roles: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#0D1B2A] mb-1">Cover image URL (optional)</label>
            <input className="w-full px-3 py-2 border border-[#E8EDF2] rounded-xl" placeholder="https://..." value={form.file} onChange={e => setForm(f => ({ ...f, file: e.target.value }))} />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2 rounded-xl border border-[#E8EDF2] text-[#64748B] hover:bg-gray-50">Cancel</button>
            <button type="submit" className="flex-1 py-2 rounded-xl bg-[#0D1B2A] text-white hover:bg-[#1E3A5F]">Post Project</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────
export default function ProjectCollabPage() {
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState({ category: "All", status: "All", role: "All Roles", search: "" });
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const filtered = projects.filter(p => {
    const matchSearch = !filters.search || p.title.toLowerCase().includes(filters.search.toLowerCase()) || p.description.toLowerCase().includes(filters.search.toLowerCase());
    const matchCat = filters.category === "All" || p.category === filters.category;
    const matchStatus = filters.status === "All" || p.status === filters.status;
    const matchRole = filters.role === "All Roles" || p.rolesLookingFor.includes(filters.role);
    return matchSearch && matchCat && matchStatus && matchRole;
  });

  const activeFilterCount = [filters.category !== "All", filters.status !== "All", filters.role !== "All Roles", !!filters.search].filter(Boolean).length;

  return (
    <div className="font-['Inter',-apple-system,sans-serif] bg-[#F8FAFB] min-h-screen">
      {/* Hero Banner */}
      <div className="border-b border-[#E8EDF2] bg-white px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="inline-flex items-center gap-1.5 bg-[#EDF7F3] border border-[#A7F3D0] rounded-full py-1 px-3 mb-4">
            <Briefcase className="w-3.5 h-3.5 text-[#0EA472]" />
            <span className="text-xs font-medium text-[#047857]">{projects.filter(p => p.status === "Open").length} projects looking for collaborators</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#0D1B2A] tracking-tight">Find your next <span className="text-[#0EA472]">dream team</span></h1>
          <p className="text-sm text-[#64748B] mt-1 max-w-xl">Browse open projects, pitch your skills, and ship something great together.</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="sticky top-0 z-30 bg-white border-b border-[#E8EDF2] px-6 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap gap-3 items-center">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#E8EDF2] text-sm text-[#0D1B2A] hover:bg-gray-50">
            <Layers className="w-4 h-4" /> Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
          </button>
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
            <input type="text" placeholder="Search projects, tech, roles..." value={filters.search} onChange={e => setFilters(f => ({ ...f, search: e.target.value }))} className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#E8EDF2] text-sm focus:ring-2 focus:ring-[#0EA472]/30 focus:border-[#0EA472] outline-none" />
          </div>
          <button onClick={() => setShowModal(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0D1B2A] text-white text-sm font-medium hover:bg-[#1E3A5F]"><Plus className="w-4 h-4" /> Post Project</button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8 flex gap-6">
        {/* Sidebar Filters */}
        {sidebarOpen && (
          <aside className="w-64 shrink-0 hidden lg:block">
            <div className="bg-white border border-[#E8EDF2] rounded-2xl p-5 space-y-5 sticky top-24">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-[#0D1B2A]">Filters</h3>
                {activeFilterCount > 0 && <button onClick={() => setFilters({ category: "All", status: "All", role: "All Roles", search: "" })} className="text-xs text-[#0EA472] hover:underline">Clear all</button>}
              </div>
              <div>
                <label className="text-xs font-semibold text-[#64748B] uppercase block mb-2">Category</label>
                <div className="space-y-1">
                  {CATEGORIES.map(c => (
                    <button key={c} onClick={() => setFilters(f => ({ ...f, category: c }))} className={`w-full text-left px-2 py-1.5 text-sm rounded-lg ${filters.category === c ? "bg-[#EDF7F3] text-[#0EA472] font-medium" : "text-[#64748B] hover:bg-gray-50"}`}>{c}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-[#64748B] uppercase block mb-2">Status</label>
                <div className="space-y-1">
                  {STATUSES.map(s => (
                    <button key={s} onClick={() => setFilters(f => ({ ...f, status: s }))} className={`w-full text-left px-2 py-1.5 text-sm rounded-lg ${filters.status === s ? "bg-[#EDF7F3] text-[#0EA472] font-medium" : "text-[#64748B] hover:bg-gray-50"}`}>{s}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-[#64748B] uppercase block mb-2">Role needed</label>
                <select value={filters.role} onChange={e => setFilters(f => ({ ...f, role: e.target.value }))} className="w-full px-3 py-2 border border-[#E8EDF2] rounded-xl text-sm">
                  {ROLES.map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
              <div className="pt-4 border-t border-[#E8EDF2] text-center">
                <div className="text-2xl font-bold text-[#0EA472]">{filtered.length}</div>
                <div className="text-xs text-[#64748B]">projects found</div>
              </div>
            </div>
          </aside>
        )}

        {/* Project List */}
        <main className="flex-1 min-w-0 space-y-4">
          {filtered.length === 0 ? (
            <div className="bg-white border border-[#E8EDF2] rounded-2xl p-12 text-center">
              <div className="text-4xl mb-2">🔍</div>
              <h3 className="font-semibold text-[#0D1B2A] mb-1">No projects found</h3>
              <p className="text-sm text-[#64748B]">Try adjusting your filters or post a new project.</p>
              <button onClick={() => setShowModal(true)} className="mt-4 px-5 py-2 rounded-xl bg-[#0D1B2A] text-white text-sm">Post a project →</button>
            </div>
          ) : (
            filtered.map(p => <ProjectCard key={p._id} project={p} />)
          )}
        </main>
      </div>

      {showModal && <CreateModal onClose={() => setShowModal(false)} onCreate={p => setProjects(prev => [p, ...prev])} />}
    </div>
  );
}