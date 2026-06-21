"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Search, X, Plus, Users, Calendar, ArrowRight, Briefcase, ChevronDown, Layers, Pencil, Trash2, UserPlus } from "lucide-react";
import axios from "axios";
import { useAppSelector } from "@/redux/hooks";

// ─── Types (aligned with Mongoose schema) ────────────────────────────
interface TeamMember {
  user: { _id: string; username: string };
  roleAssigned: string;
}

interface Project {
  _id: string;
  title: string;
  file?: string;
  description: string;
  status: "Open" | "In Progress" | "On Hold" | "Completed" | "Closed";
  problemStatement?: string;
  category: string;
  rolesLookingFor: string[];
  techStackUsed: string[];
  totalTeamSize: number;
  currentTeamMembers: TeamMember[];
  createdBy: { _id: string; username: string };
  createdAt: string;
  updatedAt: string;
}

// ─── API service functions ─────────────────────────────────────────────
const API_BASE = "/api/collaboration";
const fetchProjects = async (
  filters: any = {},
  page = 1,
  limit = 10
) => {
  const { data } = await axios.get(`${API_BASE}`, {
    params: {
      ...filters,
      page,
      limit,
      sort: "createdAt",
      order: "desc",
    },
  });

  return data.data; // because backend returns { data: collaborations }
};
const createProject = async (formData: FormData) => {
  const { data } = await axios.post(
    `${API_BASE}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return data.collaboration;
};

const updateProject = async (
  id: string,
  updates: any
) => {
  const { data } = await axios.put(
    `${API_BASE}/update/${id}`,
    updates
  );

  return data.collaboration;
};

const deleteProject = async (id: string) => {
  const { data } = await axios.delete(
    `${API_BASE}/delete/${id}`
  );

  return data;
};

const addTeammate = async (
  id: string,
  username: string,
  roleAssigned: string
) => {
  const { data } = await axios.post(
    `${API_BASE}/${id}/add-teammate`,
    {
      username,
      roleAssigned,
    }
  );

  return data.collaboration;
};

const removeTeammate = async (
  id: string,
  userId: string
) => {
  const { data } = await axios.post(
    `${API_BASE}/${id}/remove-teammate`,
    {
      userId,
    }
  );

  return data.collaboration;
};

const sendJoinRequest = async (id: string) => {
  const { data } = await axios.post(
    `${API_BASE}/${id}/join-request`
  );

  return data;
};

const approveJoinRequest = async (
  id: string,
  userId: string
) => {
  const { data } = await axios.post(
    `${API_BASE}/${id}/approve-request`,
    {
      userId,
    }
  );

  return data;
};

const rejectJoinRequest = async (
  id: string,
  userId: string
) => {
  const { data } = await axios.post(
    `${API_BASE}/${id}/reject-request`,
    {
      userId,
    }
  );

  return data;
};

const getPendingRequests = async (id: string) => {
  const { data } = await axios.get(
    `${API_BASE}/${id}/pending-requests`
  );

  return data.requests;
};

const getProjectById = async (id: string) => {
  const { data } = await axios.get(
    `${API_BASE}/${id}`
  );

  return data.collaboration;
};

// ─── Helper ────────────────────────────────────────────────────────────
function timeAgo(date: string) {
  const days = Math.floor((Date.now() - new Date(date).getTime()) / 86400000);
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

// ─── Components ─────────────────────────────────────────────────────────

function ProjectCard({
  project,
  currentUserId,
  onEdit,
  onDelete,
  onAddTeammate,
  onRemoveTeammate,
}: {
  project: Project;
  currentUserId: string;
  onEdit: (p: Project) => void;
  onDelete: (id: string) => void;
  onAddTeammate: (id: string) => void;
  onRemoveTeammate: (id: string, username: string, role: string) => void;
}) {
  const statusColor = project.status === "Open" ? "text-green-700 bg-green-50" : "text-gray-600 bg-gray-100";
  const isOwner = project.createdBy._id === currentUserId;
  const spotsLeft = project.totalTeamSize - project.currentTeamMembers.length;

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
              <div className="flex items-center gap-2 mt-1 text-xs flex-wrap">
                <span className={`px-2 py-0.5 rounded-full ${statusColor}`}>{project.status}</span>
                <span className="text-[#64748B]">· {timeAgo(project.createdAt)}</span>
                <span className="text-[#64748B]">· {project.category}</span>
              </div>
            </div>
            <div className="text-right text-xs text-[#64748B]">
              <div className="flex items-center gap-1"><Users className="w-3 h-3" /> {project.currentTeamMembers.length}/{project.totalTeamSize}</div>
              <div className="text-[10px] text-green-600">{spotsLeft} spot{spotsLeft !== 1 ? "s" : ""} left</div>
            </div>
          </div>
          <p className="text-sm text-[#64748B] mt-2 mb-3 line-clamp-2">{project.description}</p>

          <div className="flex flex-wrap gap-1.5 mb-3">
            {project.techStackUsed.slice(0, 4).map(t => (
              <span key={t} className="text-[11px] px-2 py-1 rounded-full bg-[#F8FAFB] border border-[#E8EDF2] text-[#0D1B2A]">{t}</span>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-1.5">
              {project.rolesLookingFor.map(r => (
                <span key={r} className="text-[11px] px-2 py-1 rounded-full bg-[#EDF7F3] text-[#0EA472]">{r}</span>
              ))}
            </div>

            <div className="flex items-center gap-2">
              {isOwner && (
                <>
                  <button
                    onClick={() => onEdit(project)}
                    className="p-1.5 text-[#64748B] hover:text-amber-500 transition"
                    title="Edit project"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onAddTeammate(project._id)}
                    className="p-1.5 text-[#64748B] hover:text-blue-500 transition"
                    title="Add teammate"
                    disabled={spotsLeft === 0}
                  >
                    <UserPlus className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(project._id)}
                    className="p-1.5 text-[#64748B] hover:text-red-500 transition"
                    title="Delete project"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}
              <Link href={`/collaborations/${project._id}`}>
                <button className="flex items-center gap-1.5 text-sm font-medium text-white bg-[#0D1B2A] px-4 py-1.5 rounded-xl hover:bg-[#1E3A5F] transition">
                  View <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </Link>
            </div>
          </div>

          {/* Team members preview */}
          {project.currentTeamMembers.length > 0 && (
            <div className="mt-3 pt-3 border-t border-[#E8EDF2] flex flex-wrap items-center gap-2 text-xs text-[#64748B]">
              <span className="font-medium">Team:</span>
              {project.currentTeamMembers.slice(0, 3).map((m) => (
                <span key={m.user._id} className="bg-[#F8FAFB] px-2 py-0.5 rounded-full border border-[#E8EDF2]">
                  {m.user.username} ({m.roleAssigned})
                </span>
              ))}
              {project.currentTeamMembers.length > 3 && (
                <span className="text-[10px] text-[#94A3B8]">+{project.currentTeamMembers.length - 3} more</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Create/Edit Modal ─────────────────────────────────────────────────
function ProjectModal({
  isOpen,
  onClose,
  initialData,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Partial<Project>;
  onSave: (data: FormData | any) => void;
}) {
  const [form, setForm] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    category: initialData?.category || "AI/ML",
    techStack: initialData?.techStackUsed?.join(", ") || "",
    roles: initialData?.rolesLookingFor?.join(", ") || "",
    teamSize: initialData?.totalTeamSize?.toString() || "3",
    file: null as File | null,
    status: initialData?.status || "Open",
  });
  const [filePreview, setFilePreview] = useState<string | null>(initialData?.file || null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setForm((prev) => ({ ...prev, file }));
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setFilePreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error("Project title is required");
      return;
    }

    if (initialData) {
      // Edit mode: send JSON updates (only description, status, rolesLookingFor)
      const updates: any = {
        description: form.description,
        status: form.status,
        rolesLookingFor: form.roles.split(",").map((r) => r.trim()).filter(Boolean),
      };
      onSave(updates);
      onClose();
      return;
    }

    // Create mode: FormData
    const fd = new FormData();
    fd.append("title", form.title);
    fd.append("description", form.description);
    fd.append("category", form.category);
    fd.append("techStackUsed", form.techStack);
    fd.append("rolesLookingFor", form.roles);
    fd.append("totalTeamSize", form.teamSize);
    if (form.file) fd.append("file", form.file);
    onSave(fd);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg border border-[#E8EDF2] max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-[#E8EDF2] flex justify-between items-center sticky top-0 bg-white z-10">
          <h2 className="text-lg font-bold text-[#0D1B2A]">{initialData ? "Edit Project" : "Post a new project"}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#0D1B2A] mb-1">Title *</label>
            <input
              className="w-full px-3 py-2 border border-[#E8EDF2] rounded-xl focus:ring-2 focus:ring-[#0EA472]/30 focus:border-[#0EA472] outline-none"
              value={form.title}
              onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
              required
              disabled={!!initialData} // title not editable in edit mode (or you can allow)
            />
          </div>

          {!initialData && (
            <>
              <div>
                <label className="block text-sm font-medium text-[#0D1B2A] mb-1">Description</label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border border-[#E8EDF2] rounded-xl resize-none focus:ring-2 focus:ring-[#0EA472]/30 focus:border-[#0EA472] outline-none"
                  value={form.description}
                  onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-[#0D1B2A] mb-1">Category</label>
                  <select
                    className="w-full px-3 py-2 border border-[#E8EDF2] rounded-xl"
                    value={form.category}
                    onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))}
                  >
                    {["AI/ML", "Web Dev", "Blockchain", "IoT", "App Dev"].map(c => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#0D1B2A] mb-1">Team size</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-[#E8EDF2] rounded-xl"
                    value={form.teamSize}
                    onChange={(e) => setForm(f => ({ ...f, teamSize: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0D1B2A] mb-1">Tech stack (comma separated)</label>
                <input
                  className="w-full px-3 py-2 border border-[#E8EDF2] rounded-xl"
                  placeholder="React, Node.js, MongoDB"
                  value={form.techStack}
                  onChange={(e) => setForm(f => ({ ...f, techStack: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0D1B2A] mb-1">Roles needed (comma separated)</label>
                <input
                  className="w-full px-3 py-2 border border-[#E8EDF2] rounded-xl"
                  placeholder="Frontend Dev, Backend Dev"
                  value={form.roles}
                  onChange={(e) => setForm(f => ({ ...f, roles: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0D1B2A] mb-1">Cover image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 border border-[#E8EDF2] rounded-xl"
                />
                {filePreview && (
                  <img src={filePreview} alt="preview" className="mt-2 max-h-40 rounded-xl object-cover" />
                )}
              </div>
            </>
          )}

          {initialData && (
            <>
              <div>
                <label className="block text-sm font-medium text-[#0D1B2A] mb-1">Description</label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border border-[#E8EDF2] rounded-xl resize-none focus:ring-2 focus:ring-[#0EA472]/30 focus:border-[#0EA472] outline-none"
                  value={form.description}
                  onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0D1B2A] mb-1">Status</label>
                <select
                  className="w-full px-3 py-2 border border-[#E8EDF2] rounded-xl"
                  value={form.status}
                  onChange={(e) => setForm(f => ({ ...f, status: e.target.value }))}
                >
                  {["Open", "In Progress", "On Hold", "Completed", "Closed"].map(s => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0D1B2A] mb-1">Roles needed (comma separated)</label>
                <input
                  className="w-full px-3 py-2 border border-[#E8EDF2] rounded-xl"
                  placeholder="Frontend Dev, Backend Dev"
                  value={form.roles}
                  onChange={(e) => setForm(f => ({ ...f, roles: e.target.value }))}
                />
              </div>
            </>
          )}

          <div className="flex gap-3 pt-2 border-t border-[#E8EDF2]">
            <button type="button" onClick={onClose} className="flex-1 py-2 rounded-xl border border-[#E8EDF2] text-[#64748B] hover:bg-gray-50">Cancel</button>
            <button type="submit" className="flex-1 py-2 rounded-xl bg-[#0D1B2A] text-white hover:bg-[#1E3A5F]">
              {initialData ? "Update" : "Post Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Add Teammate Modal ─────────────────────────────────────────────────
function AddTeammateModal({
  isOpen,
  onClose,
  projectId,
  onAdd,
}: {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  onAdd: (id: string, username: string, role: string) => void;
}) {
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !role.trim()) {
      toast.error("Please fill all fields");
      return;
    }
    onAdd(projectId, username.trim(), role.trim());
    setUsername("");
    setRole("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-[#E8EDF2]" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-[#E8EDF2] flex justify-between items-center">
          <h2 className="text-lg font-bold text-[#0D1B2A]">Add Teammate</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#0D1B2A] mb-1">Username</label>
            <input
              className="w-full px-3 py-2 border border-[#E8EDF2] rounded-xl"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#0D1B2A] mb-1">Role</label>
            <input
              className="w-full px-3 py-2 border border-[#E8EDF2] rounded-xl"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
              placeholder="e.g., Backend Dev"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2 rounded-xl border border-[#E8EDF2] text-[#64748B] hover:bg-gray-50">Cancel</button>
            <button type="submit" className="flex-1 py-2 rounded-xl bg-[#0D1B2A] text-white hover:bg-[#1E3A5F]">Add</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────
export default function ProjectCollaborationPage() {
  const currentUser = useAppSelector((state: any) => state.User.userData);
  const currentUserId = currentUser?._id || "";

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showTeammateModal, setShowTeammateModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [filters, setFilters] = useState({ category: "All", status: "All", role: "All Roles", search: "" });
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const fetchProjectsData = async () => {
    try {
      setLoading(true);
      const filterObj: any = {};
      if (filters.category !== "All") filterObj.category = filters.category;
      if (filters.status !== "All") filterObj.status = filters.status;
      if (filters.role !== "All Roles") filterObj.rolesLookingFor = filters.role;
      if (filters.search) filterObj.search = filters.search; // backend may support search
      const data = await fetchProjects(filterObj);
      setProjects(data || []);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectsData();
  }, [filters]);

  // ── CRUD handlers ─────────────────────────────────────────────────────
  const handleCreate = async (formData: FormData) => {
    try {
      const newProject = await createProject(formData);
      setProjects([newProject, ...projects]);
      toast.success("Project posted!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create project");
    }
  };

  const handleEdit = (project: Project) => {
    setSelectedProject(project);
    setShowEditModal(true);
  };

  const handleUpdate = async (updates: any) => {
    if (!selectedProject) return;
    try {
      const updated = await updateProject(selectedProject._id, updates);
      setProjects((prev) =>
        prev.map((p) => (p._id === updated._id ? updated : p))
      );
      toast.success("Project updated!");
      setShowEditModal(false);
      setSelectedProject(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update project");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this project?")) return;
    try {
      await deleteProject(id);
      setProjects((prev) => prev.filter((p) => p._id !== id));
      toast.success("Project deleted");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete project");
    }
  };

  const handleAddTeammate = (id: string) => {
    setSelectedProject(projects.find((p) => p._id === id) || null);
    setShowTeammateModal(true);
  };

  const handleAddTeammateSubmit = async (id: string, username: string, role: string) => {
    try {
      const updatedProject = await addTeammate(id, username, role);
      setProjects((prev) =>
        prev.map((p) => (p._id === updatedProject._id ? updatedProject : p))
      );
      toast.success("Teammate added!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to add teammate");
    }
  };

  const handleRemoveTeammate = async (id: string, username: string, role: string) => {
    if (!window.confirm(`Remove ${username} from the team?`)) return;
    try {
      const updatedProject = await removeTeammate(id, username, role);
      setProjects((prev) =>
        prev.map((p) => (p._id === updatedProject._id ? updatedProject : p))
      );
      toast.success("Teammate removed");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to remove teammate");
    }
  };

  // ── Filtering (client-side) ──────────────────────────────────────────
  const filteredProjects = projects; // Already filtered by backend

  const activeFilterCount = [
    filters.category !== "All",
    filters.status !== "All",
    filters.role !== "All Roles",
    !!filters.search,
  ].filter(Boolean).length;

  return (
    <div className="font-['Inter',-apple-system,sans-serif] bg-[#F8FAFB] min-h-screen">
      {/* Hero Banner */}
      <div className="border-b border-[#E8EDF2] bg-white px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="inline-flex items-center gap-1.5 bg-[#EDF7F3] border border-[#A7F3D0] rounded-full py-1 px-3 mb-4">
            <Briefcase className="w-3.5 h-3.5 text-[#0EA472]" />
            <span className="text-xs font-medium text-[#047857]">
              {projects.filter((p) => p.status === "Open").length} projects looking for collaborators
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#0D1B2A] tracking-tight">
            Find your next <span className="text-[#0EA472]">dream team</span>
          </h1>
          <p className="text-sm text-[#64748B] mt-1 max-w-xl">
            Browse open projects, pitch your skills, and ship something great together.
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="sticky top-0 z-30 bg-white border-b border-[#E8EDF2] px-6 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap gap-3 items-center">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#E8EDF2] text-sm text-[#0D1B2A] hover:bg-gray-50"
          >
            <Layers className="w-4 h-4" /> Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
          </button>
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
            <input
              type="text"
              placeholder="Search projects, tech, roles..."
              value={filters.search}
              onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#E8EDF2] text-sm focus:ring-2 focus:ring-[#0EA472]/30 focus:border-[#0EA472] outline-none"
            />
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0D1B2A] text-white text-sm font-medium hover:bg-[#1E3A5F]"
          >
            <Plus className="w-4 h-4" /> Post Project
          </button>
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
                {activeFilterCount > 0 && (
                  <button
                    onClick={() => setFilters({ category: "All", status: "All", role: "All Roles", search: "" })}
                    className="text-xs text-[#0EA472] hover:underline"
                  >
                    Clear all
                  </button>
                )}
              </div>
              <div>
                <label className="text-xs font-semibold text-[#64748B] uppercase block mb-2">Category</label>
                <div className="space-y-1">
                  {["All", "AI/ML", "Web Dev", "Blockchain", "IoT", "App Dev"].map((c) => (
                    <button
                      key={c}
                      onClick={() => setFilters((f) => ({ ...f, category: c }))}
                      className={`w-full text-left px-2 py-1.5 text-sm rounded-lg ${
                        filters.category === c
                          ? "bg-[#EDF7F3] text-[#0EA472] font-medium"
                          : "text-[#64748B] hover:bg-gray-50"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-[#64748B] uppercase block mb-2">Status</label>
                <div className="space-y-1">
                  {["All", "Open", "In Progress", "On Hold", "Completed", "Closed"].map((s) => (
                    <button
                      key={s}
                      onClick={() => setFilters((f) => ({ ...f, status: s }))}
                      className={`w-full text-left px-2 py-1.5 text-sm rounded-lg ${
                        filters.status === s
                          ? "bg-[#EDF7F3] text-[#0EA472] font-medium"
                          : "text-[#64748B] hover:bg-gray-50"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-[#64748B] uppercase block mb-2">Role needed</label>
                <select
                  value={filters.role}
                  onChange={(e) => setFilters((f) => ({ ...f, role: e.target.value }))}
                  className="w-full px-3 py-2 border border-[#E8EDF2] rounded-xl text-sm"
                >
                  {["All Roles", "Frontend Dev", "Backend Dev", "ML Engineer", "Blockchain Dev"].map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
              </div>
              <div className="pt-4 border-t border-[#E8EDF2] text-center">
                <div className="text-2xl font-bold text-[#0EA472]">{filteredProjects.length}</div>
                <div className="text-xs text-[#64748B]">projects found</div>
              </div>
            </div>
          </aside>
        )}

        {/* Project List */}
        <main className="flex-1 min-w-0 space-y-4">
          {loading ? (
            <div className="text-center py-10 text-[#64748B]">Loading projects...</div>
          ) : filteredProjects.length === 0 ? (
            <div className="bg-white border border-[#E8EDF2] rounded-2xl p-12 text-center">
              <div className="text-4xl mb-2">🔍</div>
              <h3 className="font-semibold text-[#0D1B2A] mb-1">No projects found</h3>
              <p className="text-sm text-[#64748B]">Try adjusting your filters or post a new project.</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-4 px-5 py-2 rounded-xl bg-[#0D1B2A] text-white text-sm"
              >
                Post a project →
              </button>
            </div>
          ) : (
            filteredProjects.map((p) => (
              <ProjectCard
                key={p._id}
                project={p}
                currentUserId={currentUserId}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onAddTeammate={handleAddTeammate}
                onRemoveTeammate={handleRemoveTeammate}
              />
            ))
          )}
        </main>
      </div>

      {/* Modals */}
      <ProjectModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleCreate}
      />

      {selectedProject && (
        <>
          <ProjectModal
            isOpen={showEditModal}
            onClose={() => {
              setShowEditModal(false);
              setSelectedProject(null);
            }}
            initialData={selectedProject}
            onSave={handleUpdate}
          />
          <AddTeammateModal
            isOpen={showTeammateModal}
            onClose={() => {
              setShowTeammateModal(false);
              setSelectedProject(null);
            }}
            projectId={selectedProject._id}
            onAdd={handleAddTeammateSubmit}
          />
        </>
      )}
    </div>
  );
}