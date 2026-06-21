"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAppSelector } from "@/redux/hooks";
import { toast } from "sonner";
import axios from "axios";
import {
  ArrowLeft, Edit3, UserPlus, Trash2, Send, Github,
  Calendar, Clock, Users, X, CheckCircle, ExternalLink, Copy,
  Briefcase, Sparkles, Layers, Target, Code2, Share2, UserCheck,
  MoreVertical
} from "lucide-react";

// ─── Types (matching the Collaboration model) ──────────────────────────
interface TeamMember {
  _id: string;
  user: { _id: string; username: string };
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
  status: "Open" | "In Progress" | "On Hold" | "Completed" | "Closed";
  rolesLookingFor: string[];
  totalTeamSize: number;
  currentTeamMembers: TeamMember[];
  createdBy: { _id: string; username: string };
  contact?: string;
  file?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────
const fmtDate = (d: string) => new Date(d).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" });
const timeAgo = (d: string) => {
  const days = Math.floor((Date.now() - new Date(d).getTime()) / 86400000);
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
};

const statusMeta: Record<string, { label: string; bg: string; text: string }> = {
  "Open": { label: "Open", bg: "bg-green-50", text: "text-green-700" },
  "In Progress": { label: "In Progress", bg: "bg-blue-50", text: "text-blue-700" },
  "On Hold": { label: "On Hold", bg: "bg-amber-50", text: "text-amber-700" },
  "Completed": { label: "Completed", bg: "bg-gray-100", text: "text-gray-700" },
  "Closed": { label: "Closed", bg: "bg-red-50", text: "text-red-700" },
};

const avatarColors = [
  "bg-blue-100 text-blue-700",
  "bg-purple-100 text-purple-700",
  "bg-green-100 text-green-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-cyan-100 text-cyan-700",
];

// ─── Modal Components ────────────────────────────────────────────────────
function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-[#E8EDF2]" onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

function EditModal({ project, onClose, onSave }: { project: Project; onClose: () => void; onSave: (data: Partial<Project>) => void }) {
  const [description, setDescription] = useState(project.description);
  const [status, setStatus] = useState(project.status);
  const [rolesStr, setRolesStr] = useState(project.rolesLookingFor.join(", "));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ description, status, rolesLookingFor: rolesStr.split(",").map(r => r.trim()).filter(Boolean) });
    onClose();
    toast.success("Project updated");
  };

  return (
    <Modal onClose={onClose}>
      <div className="flex justify-between items-center px-6 py-4 border-b border-[#E8EDF2]">
        <h2 className="text-lg font-bold text-[#0D1B2A]">Edit project</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
      </div>
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-[#0D1B2A] mb-1">Description</label>
          <textarea rows={4} className="w-full px-3 py-2 border border-[#E8EDF2] rounded-xl focus:ring-2 focus:ring-[#0EA472]/30 focus:border-[#0EA472] outline-none" value={description} onChange={e => setDescription(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#0D1B2A] mb-1">Status</label>
          <select className="w-full px-3 py-2 border border-[#E8EDF2] rounded-xl" value={status} onChange={e => setStatus(e.target.value)}>
            {Object.keys(statusMeta).map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-[#0D1B2A] mb-1">Roles needed (comma separated)</label>
          <input className="w-full px-3 py-2 border border-[#E8EDF2] rounded-xl" value={rolesStr} onChange={e => setRolesStr(e.target.value)} placeholder="Frontend Dev, ML Engineer..." />
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 py-2 rounded-xl border border-[#E8EDF2] text-[#64748B] hover:bg-gray-50">Cancel</button>
          <button type="submit" className="flex-1 py-2 rounded-xl bg-[#0D1B2A] text-white hover:bg-[#1E3A5F]">Save</button>
        </div>
      </form>
    </Modal>
  );
}

function AddTeammateModal({ roles, onClose, onAdd }: { roles: string[]; onClose: () => void; onAdd: (m: TeamMember) => void }) {
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({ _id: Date.now().toString(), user: { _id: "new", username }, roleAssigned: role, joinedAt: new Date().toISOString() });
    onClose();
    toast.success("Team member added");
  };

  return (
    <Modal onClose={onClose}>
      <div className="flex justify-between items-center px-6 py-4 border-b border-[#E8EDF2]">
        <h2 className="text-lg font-bold text-[#0D1B2A]">Add team member</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
      </div>
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-[#0D1B2A] mb-1">Username</label>
          <input className="w-full px-3 py-2 border border-[#E8EDF2] rounded-xl" value={username} onChange={e => setUsername(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#0D1B2A] mb-1">Role to assign</label>
          <select className="w-full px-3 py-2 border border-[#E8EDF2] rounded-xl" value={role} onChange={e => setRole(e.target.value)} required>
            <option value="">Select a role</option>
            {roles.map(r => <option key={r}>{r}</option>)}
          </select>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 py-2 rounded-xl border border-[#E8EDF2] text-[#64748B] hover:bg-gray-50">Cancel</button>
          <button type="submit" className="flex-1 py-2 rounded-xl bg-[#0D1B2A] text-white hover:bg-[#1E3A5F]">Add</button>
        </div>
      </form>
    </Modal>
  );
}

function ApplyModal({ roles, onClose, projectId }: { projectId : string, roles: string[]; onClose: () => void }) {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ username: "", email: "", github: "", message: "", role: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    try {
      setSubmitted(true);
  
      await axios.post(`/api/collaboration/${projectId}/request`, {
        username: form.username,
        email: form.email,
        github: form.github,
        role: form.role,
        message: form.message,
      });
  
      toast.success("Application sent!");
  
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: any) {
      setSubmitted(false);
      toast.error(err.response?.data?.message || "Failed to send application");
    }
  };

  if (submitted) {
    return (
      <Modal onClose={onClose}>
        <div className="p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3"><CheckCircle className="w-6 h-6 text-green-600" /></div>
          <h3 className="text-lg font-bold text-[#0D1B2A]">Application sent!</h3>
          <p className="text-sm text-[#64748B] mt-1">The team will review your application.</p>
        </div>
      </Modal>
    );
  }

  return (
    <Modal onClose={onClose}>
      <div className="flex justify-between items-center px-6 py-4 border-b border-[#E8EDF2]">
        <h2 className="text-lg font-bold text-[#0D1B2A]">Apply as collaborator</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
      </div>
      <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-[#0D1B2A] mb-1">Username *</label>
            <input className="w-full px-3 py-2 border border-[#E8EDF2] rounded-xl" value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#0D1B2A] mb-1">Email *</label>
            <input type="email" className="w-full px-3 py-2 border border-[#E8EDF2] rounded-xl" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-[#0D1B2A] mb-1">GitHub profile</label>
          <input className="w-full px-3 py-2 border border-[#E8EDF2] rounded-xl" placeholder="github.com/username" value={form.github} onChange={e => setForm(f => ({ ...f, github: e.target.value }))} />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#0D1B2A] mb-1">Role applying for *</label>
          <select className="w-full px-3 py-2 border border-[#E8EDF2] rounded-xl" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} required>
            <option value="">Select a role</option>
            {roles.map(r => <option key={r}>{r}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-[#0D1B2A] mb-1">Why are you a great fit? *</label>
          <textarea rows={4} className="w-full px-3 py-2 border border-[#E8EDF2] rounded-xl" value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} required />
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 py-2 rounded-xl border border-[#E8EDF2] text-[#64748B] hover:bg-gray-50">Cancel</button>
          <button type="submit" className="flex-1 py-2 rounded-xl bg-[#0D1B2A] text-white hover:bg-[#1E3A5F] flex items-center justify-center gap-2"><Send className="w-4 h-4" /> Send</button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────
export default function ProjectDetailPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params?.id as string;

  const currentUser = useAppSelector((state: any) => state.User.userData);
  const currentUserId = currentUser?._id || "";

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showEdit, setShowEdit] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showApply, setShowApply] = useState(false);
  const [copied, setCopied] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null); 

  // ── Fetch project from API ─────────────────────────────────────────────
  const fetchProject = async () => {
    if (!projectId) {
      setError("Project ID is missing");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log(projectId);
      const { data } = await axios.get(`/api/collaboration/${projectId}`);
      if (data.success) {
        setProject(data.data);
      } else {
        setError(data.message || "Failed to load project");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load project");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  // ── Handlers ────────────────────────────────────────────────────────────
  const isLeader = project?.createdBy._id === currentUserId;

  const handleEdit = async (updates: Partial<Project>) => {
    if (!project) return;
    
    try {
      const { data } = await axios.put(`/api/collaboration/${project._id}`, updates);
      window.location.reload()
      // setProject(data.project);
      toast.success("Project updated");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update project");
    }
  };

  const handleAddTeammate = async (member: TeamMember) => {
    if (!project) return;
    try {
      const { data } = await axios.post(`/api/collaboration/${project._id}/team`, {
        username: member.user.username,
        roleAssigned: member.roleAssigned,
      });
      window.location.reload()
      toast.success("Teammate added");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to add teammate");
    }
  };

  const handleRemoveTeammate = async (memberId: string) => {
    if (!project) return;
    try {
      await axios.delete(`/api/collaboration/${project._id}/team/${memberId}`);
      // Refresh project data to reflect the updated team
      await fetchProject();
      toast.success("Team member removed");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to remove team member");
    }
    setOpenDropdown(null);
  };

  const handleDelete = async () => {
    if (!project) return;
    if (!window.confirm("Are you sure you want to delete this project?")) return;
    try {
      await axios.delete(`/api/collaboration/${project._id}`);
      toast.success("Project deleted");
      router.push("/project-collaboration");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete project");
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied");
  };

  // ── Loading & Error ────────────────────────────────────────────────────
  if (loading) return <LoadingSkeleton />;
  if (error || !project) return <NotFound error={error} />;

  const statusInfo = statusMeta[project.status] || statusMeta["Open"];
  const spotsLeft = project.totalTeamSize - project.currentTeamMembers.length;

  return (
    <div className="bg-[#F8FAFB] min-h-screen font-sans">
      {/* Sticky header */}
      <div className="sticky top-0 z-30 bg-white border-b border-[#E8EDF2] px-6 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <Link href="/project-collaboration">
            <button className="flex items-center gap-1.5 text-sm text-[#64748B] hover:text-[#0D1B2A]">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          </Link>
          <div className="flex gap-2">
            <span className={`text-xs px-3 py-1 rounded-full border ${statusInfo.bg} ${statusInfo.text}`}>{project.status}</span>
            <span className="text-xs px-3 py-1 rounded-full border bg-gray-50 text-gray-600">{project.category}</span>
          </div>
        </div>
      </div>

      {/* Hero image */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        {project.file ? (
          <img src={project.file} alt={project.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center text-6xl">🚀</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <h1 className="text-3xl font-bold">{project.title}</h1>
          <div className="flex gap-3 text-sm text-white/80 mt-2">
            <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {timeAgo(project.createdAt)}</span>
            <span>•</span>
            <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {project.currentTeamMembers.length}/{project.totalTeamSize} members</span>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="bg-white border border-[#E8EDF2] rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-[#0D1B2A] mb-3">About the project</h2>
              <p className="text-[#64748B] leading-relaxed">{project.description}</p>
            </div>

            {/* Problem statement */}
            {project.problemStatement && (
              <div className="bg-white border border-[#E8EDF2] rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-[#0D1B2A] mb-3">Problem statement</h2>
                <p className="text-[#64748B] leading-relaxed">{project.problemStatement}</p>
              </div>
            )}

            {/* Tech stack */}
            <div className="bg-white border border-[#E8EDF2] rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-[#0D1B2A] mb-3">Tech stack</h2>
              <div className="flex flex-wrap gap-2">
                {project.techStackUsed.map(tech => (
                  <span key={tech} className="text-sm px-3 py-1 rounded-full bg-gray-100 text-gray-700">{tech}</span>
                ))}
              </div>
            </div>

            {/* Open roles */}
            <div className="bg-white border border-[#E8EDF2] rounded-2xl p-6">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-semibold text-[#0D1B2A]">Open roles</h2>
                <span className="text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">{spotsLeft} spot{spotsLeft !== 1 ? "s" : ""} left</span>
              </div>
              <div className="space-y-2">
                {project.rolesLookingFor.map(role => {
                  const taken = project.currentTeamMembers.some(m => m.roleAssigned === role);
                  return (
                    <div key={role} className="flex justify-between items-center p-3 border border-[#E8EDF2] rounded-xl">
                      <span className="text-sm text-[#0D1B2A]">{role}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${taken ? "bg-gray-100 text-gray-500" : "bg-green-100 text-green-700"}`}>{taken ? "Filled" : "Open"}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── CURRENT TEAM with three‑dots ── */}
            <div className="bg-white border border-[#E8EDF2] rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-[#0D1B2A] mb-3">Current team</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {project.currentTeamMembers.map((m) => (
                  <div
                    key={m._id}
                    className="flex items-center justify-between p-3 border border-[#E8EDF2] rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full  flex items-center justify-center font-bold`}>
                        {m.user.username.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{m.user.username}</p>
                        <p className="text-xs text-[#0EA472]">{m.roleAssigned}</p>
                      </div>
                    </div>

                    {/* Three‑dots dropdown – only for leader */}
                    {project.createdBy._id == currentUserId && m._id != currentUserId && (
                      <div className="relative">
                        <button
                          onClick={() => setOpenDropdown(openDropdown === m._id ? null : m._id)}
                          className="p-1 rounded-full hover:bg-gray-100"
                        >
                          <MoreVertical className="w-5 h-5 text-gray-500" />
                        </button>
                        {openDropdown === m._id && (
                          <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                            <button
                              onClick={() => handleRemoveTeammate(m.user._id)}
                              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                            >
                              Remove from team
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}

                {/* Empty spots (unchanged) */}
                {Array.from({ length: Math.max(0, project.totalTeamSize - project.currentTeamMembers.length) }).map((_, i) => (
                  <div key={`empty-${i}`} className="flex items-center gap-3 p-3 border border-dashed border-[#E8EDF2] rounded-xl bg-gray-50">
                    <div className="w-10 h-10 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400">?</div>
                    <div>
                      <p className="text-sm text-gray-400">Open spot</p>
                      <p className="text-xs text-gray-400">Waiting for you</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* Right sidebar */}
          <div className="space-y-5">
            {/* Leader card */}
            <div className="bg-white border border-[#E8EDF2] rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-700 font-bold text-lg">
                  {project.createdBy.username[0].toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-[#0D1B2A]">{project.createdBy.username}</p>
                  <span className="text-xs text-gray-500">Project Lead</span>
                </div>
              </div>
              <div className="border-t border-[#E8EDF2] pt-3 text-xs space-y-1 text-[#64748B]">
                <div className="flex justify-between"><span>Posted</span><span>{fmtDate(project.createdAt)}</span></div>
                <div className="flex justify-between"><span>Updated</span><span>{fmtDate(project.updatedAt)}</span></div>
                <div className="flex justify-between"><span>Team size</span><span>{project.currentTeamMembers.length}/{project.totalTeamSize}</span></div>
              </div>
            </div>

            {/* Quick stats */}
            <div className="bg-white border border-[#E8EDF2] rounded-2xl p-5">
              <h3 className="font-semibold text-[#0D1B2A] mb-3">Quick stats</h3>
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="bg-gray-50 p-2 rounded-xl"><div className="text-2xl font-bold text-green-600">{spotsLeft}</div><div className="text-xs text-gray-500">Spots left</div></div>
                <div className="bg-gray-50 p-2 rounded-xl"><div className="text-2xl font-bold text-blue-600">{project.currentTeamMembers.length}</div><div className="text-xs text-gray-500">Members</div></div>
                <div className="bg-gray-50 p-2 rounded-xl"><div className="text-2xl font-bold text-purple-600">{project.rolesLookingFor.length}</div><div className="text-xs text-gray-500">Open roles</div></div>
                <div className="bg-gray-50 p-2 rounded-xl"><div className="text-2xl font-bold text-amber-600">{project.techStackUsed.length}</div><div className="text-xs text-gray-500">Tech stack</div></div>
              </div>
            </div>

            {/* Contact */}
            {project.contact && (
              <div className="bg-white border border-[#E8EDF2] rounded-2xl p-5">
                <h3 className="font-semibold text-[#0D1B2A] mb-2">Contact</h3>
                <div className="flex items-center justify-between gap-2 p-2 bg-gray-50 rounded-lg text-sm">
                  <span className="truncate text-[#64748B]">{project.contact}</span>
                  <button onClick={() => { navigator.clipboard.writeText(project.contact!); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="text-gray-400 hover:text-gray-600">
                    {copied ? <CheckCircle className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Apply button */}
            <button onClick={() => setShowApply(true)} className="w-full py-3 rounded-xl bg-[#0D1B2A] text-white font-medium hover:bg-[#1E3A5F] flex items-center justify-center gap-2">
              <Send className="w-4 h-4" /> Apply as collaborator
            </button>

            {/* Management actions (leader only) */}
            {project.createdBy._id == currentUserId && (
              <div className="bg-white border border-[#E8EDF2] rounded-2xl p-5 space-y-2">
                <h3 className="font-semibold text-[#0D1B2A] mb-2">Management</h3>
                <button onClick={() => setShowAddMember(true)} className="w-full flex items-center gap-2 px-4 py-2 rounded-xl border border-[#E8EDF2] text-sm text-[#0D1B2A] hover:bg-gray-50"><UserPlus className="w-4 h-4" /> Add team member</button>
                <button onClick={() => setShowEdit(true)} className="w-full flex items-center gap-2 px-4 py-2 rounded-xl border border-[#E8EDF2] text-sm text-[#0D1B2A] hover:bg-gray-50"><Edit3 className="w-4 h-4" /> Edit requirements</button>
                <button onClick={handleDelete} className="w-full flex items-center gap-2 px-4 py-2 rounded-xl border border-red-200 text-sm text-red-600 hover:bg-red-50"><Trash2 className="w-4 h-4" /> Delete project</button>
              </div>
            )}

            {/* Share link */}
            <div className="bg-white border border-[#E8EDF2] rounded-2xl p-5">
              <h3 className="font-semibold text-[#0D1B2A] mb-2">Share</h3>
              <button onClick={handleCopyLink} className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-[#E8EDF2] text-sm text-[#64748B] hover:bg-gray-50"><ExternalLink className="w-4 h-4" /> Copy link</button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showEdit && <EditModal project={project} onClose={() => setShowEdit(false)} onSave={handleEdit} />}
      {showAddMember && <AddTeammateModal roles={project.rolesLookingFor} onClose={() => setShowAddMember(false)} onAdd={handleAddTeammate} />}
      {showApply && <ApplyModal projectId={project._id} roles={project.rolesLookingFor} onClose={() => setShowApply(false)} />}
    </div>
  );
}

// ─── Loading & Error ──────────────────────────────────────────────────────
function LoadingSkeleton() {
  return (
    <div className="bg-[#F8FAFB] min-h-screen p-6 animate-pulse">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="h-10 w-40 bg-gray-200 rounded-xl" />
        <div className="h-64 bg-gray-200 rounded-2xl" />
        <div className="grid grid-cols-3 gap-8">
          <div className="col-span-2 space-y-6"><div className="h-48 bg-gray-200 rounded-2xl" /><div className="h-48 bg-gray-200 rounded-2xl" /></div>
          <div className="space-y-6"><div className="h-64 bg-gray-200 rounded-2xl" /><div className="h-32 bg-gray-200 rounded-2xl" /></div>
        </div>
      </div>
    </div>
  );
}

function NotFound({ error }: { error?: string | null }) {
  return (
    <div className="bg-[#F8FAFB] min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl mb-3">🔍</div>
        <h2 className="text-xl font-bold text-[#0D1B2A]">{error || "Project not found"}</h2>
        <Link href="/project-collaboration" className="inline-block mt-4 px-5 py-2 rounded-xl bg-[#0D1B2A] text-white">← Back to projects</Link>
      </div>
    </div>
  );
}