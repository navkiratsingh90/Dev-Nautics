"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAppSelector } from "@/redux/hooks";
import { toast } from "sonner";
import axios from "axios";
import {
  Plus, Search, X, Users, Clock, CheckCircle,
  TrendingUp, Filter, Star, ArrowRight,
  FolderOpen, ChevronDown, Globe, Lock,
} from "lucide-react";

// ─── Types (aligned with the new Mongoose schema) ──────────────────
interface Task {
  _id?: string;
  description: string;
  priority: "Low" | "Medium" | "High";
  assignedTo: { _id: string; username: string } | string | null;
  status: "Pending" | "In Progress" | "Completed";
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

interface Member {
  // No _id per schema (memberRoleSchema has _id: false)
  user: { _id: string; username: string } | string;
  role: string;
  totalTasksCompleted: number;
}

interface Timeline {
  name: string;
  completed: boolean;
  completedAt?: string; // optional
}

interface Commit {
  message: string;
  author: { _id: string; username: string } | string;
  date: string;
}

interface CalendarEvent {
  // No googleEventId – schema removed it
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  meetLink?: string;
}

interface Workspace {
  _id: string;
  title: string;
  description: string;
  leader: { _id: string; username: string } | string;
  members: Member[];
  tasks: Task[];
  timeline: Timeline[];
  githubLink: string;
  commits: Commit[];
  status: "Not Started" | "Active" | "On Hold" | "Completed"; // order from schema
  calendarEvents: CalendarEvent[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

// ─── Helper: status colors ──────────────────────────────────────────
const statusStyles: Record<string, { bg: string; text: string }> = {
  "Active": { bg: "bg-green-100", text: "text-green-700" },
  "On Hold": { bg: "bg-amber-100", text: "text-amber-700" },
  "Completed": { bg: "bg-gray-100", text: "text-gray-700" },
  "Not Started": { bg: "bg-blue-100", text: "text-blue-700" },
};

const avatarColors = [
  "bg-purple-500", "bg-cyan-500", "bg-pink-500", "bg-amber-500", "bg-green-500", "bg-blue-500",
];

function getAvatarColor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0;
  }
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

function getUserDisplay(user: { _id: string; username: string } | string): string {
  if (typeof user === "string") return "User";
  return user.username || "User";
}

function getUserId(user: { _id: string; username: string } | string): string {
  if (typeof user === "string") return user;
  return user._id;
}

// ─── Create Workspace Modal ──────────────────────────────────────────
function CreateModal({ onClose, onCreate }: { onClose: () => void; onCreate: (data: any) => void }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    timeline: "",
    githubLink: "",
    status: "Not Started" as Workspace["status"],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error("Title is required");
      return;
    }
    const timelineItems = form.timeline.split(",").map((t) => t.trim()).filter(Boolean).map((name) => ({ name, completed: false }));
    onCreate({
      title: form.title.trim(),
      description: form.description.trim(),
      timeline: timelineItems,
      githubLink: form.githubLink.trim(),
      status: form.status,
    });
    onClose();
    toast.success("Workspace created!");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-gray-200" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Create Workspace</h2>
            <p className="text-xs text-gray-500 mt-0.5">Track your project progress</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input
              className="w-full px-3 py-2 border border-gray-200 rounded-lg"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg resize-none"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Timeline (comma separated)</label>
            <input
              className="w-full px-3 py-2 border border-gray-200 rounded-lg"
              placeholder="Design, Development, Testing"
              value={form.timeline}
              onChange={(e) => setForm((f) => ({ ...f, timeline: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">GitHub Link</label>
            <input
              className="w-full px-3 py-2 border border-gray-200 rounded-lg"
              placeholder="https://github.com/..."
              value={form.githubLink}
              onChange={(e) => setForm((f) => ({ ...f, githubLink: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              className="w-full px-3 py-2 border border-gray-200 rounded-lg"
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as any }))}
            >
              {["Not Started", "Active", "On Hold", "Completed"].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button type="button" onClick={onClose} className="flex-1 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">Cancel</button>
            <button type="submit" className="flex-1 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800">Create</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Workspace Card ──────────────────────────────────────────────────
function WorkspaceCard({ workspace, currentUserId }: { workspace: Workspace; currentUserId: string }) {
  const statusStyle = statusStyles[workspace.status] || statusStyles["Not Started"];

  // Calculate progress from timeline
  const totalTimeline = workspace.timeline.length;
  const completedTimeline = workspace.timeline.filter((t) => t.completed).length;
  const progress = totalTimeline > 0 ? Math.round((completedTimeline / totalTimeline) * 100) : 0;

  // Get all members including leader, but ensure no duplicates (leader might also be in members)
  const leaderId = getUserId(workspace.leader);
  const uniqueMembers = workspace.members.filter((m) => getUserId(m.user) !== leaderId);
  const allMembers = [
    { user: workspace.leader, role: "Leader", totalTasksCompleted: 0 },
    ...uniqueMembers,
  ];

  // Get user's role
  const userMember = allMembers.find((m) => getUserId(m.user) === currentUserId);
  const userRole = userMember?.role || "Member";

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
      <div className="p-5">
        {/* Header */}
        <div className="flex justify-between items-start gap-3 mb-3">
          <div>
            <div className="flex flex-wrap gap-2 mb-1.5">
              <span className={`text-xs px-2 py-0.5 rounded-full ${statusStyle.bg} ${statusStyle.text}`}>
                {workspace.status}
              </span>
              {workspace.tags.slice(0, 2).map((tag) => (
                <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                  {tag}
                </span>
              ))}
            </div>
            <h3 className="text-base font-bold text-gray-900">{workspace.title}</h3>
          </div>
          {/* Star (local UI, not in schema) */}
          <button className="shrink-0">
            <Star className="w-5 h-5 text-gray-300" />
          </button>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{workspace.description}</p>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-gray-900 rounded-full" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Members preview */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex -space-x-1">
            {allMembers.slice(0, 4).map((m, idx) => {
              const id = getUserId(m.user);
              const name = getUserDisplay(m.user);
              return (
                <div
                  key={`avatar-${idx}`}
                  className={`w-6 h-6 rounded-lg ${getAvatarColor(id)} flex items-center justify-center text-[9px] font-bold text-white ring-1 ring-white`}
                >
                  {name.slice(0, 2).toUpperCase()}
                </div>
              );
            })}
            {allMembers.length > 4 && (
              <div className="w-6 h-6 rounded-lg bg-gray-200 flex items-center justify-center text-[9px] font-bold text-gray-600 ring-1 ring-white">
                +{allMembers.length - 4}
              </div>
            )}
          </div>
          <span className="text-xs text-gray-500">{allMembers.length} members</span>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-3 border-t border-gray-100">
          <span className={`text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700`}>
            {userRole}
          </span>
          <span className="text-xs text-gray-400">{new Date(workspace.updatedAt).toLocaleDateString()}</span>
        </div>
      </div>
      <Link href={`/${currentUserId}/workspace/${workspace._id}`}>
        <div className="px-5 py-3 border-t border-gray-100 text-sm text-gray-600 hover:bg-gray-50 flex justify-between items-center">
          <span>Open workspace</span>
          <ArrowRight className="w-4 h-4" />
        </div>
      </Link>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────
export default function WorkspaceHubPage() {
  const currentUser = useAppSelector((state: any) => state.User.userData);
  const currentUserId = currentUser?._id || "";

  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [activeTab, setActiveTab] = useState<"all" | "leading" | "contributing" | "starred">("all");
  const [showCreate, setShowCreate] = useState(false);

  // ── Fetch workspaces ──────────────────────────────────────────────────
  const fetchWorkspaces = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/api/workspace");
      if (data.success) {
        setWorkspaces(data.data || []);
      } else {
        toast.error(data.message || "Failed to load workspaces");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to load workspaces");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  // ── Create workspace ──────────────────────────────────────────────────
  const handleCreate = async (formData: any) => {
    try {
      const { data } = await axios.post("/api/workspace", formData);
      if (data.success) {
        setWorkspaces((prev) => [data.data, ...prev]);
        toast.success("Workspace created");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create workspace");
    }
  };

  // ── Filtering ──────────────────────────────────────────────────────────
  const filtered = workspaces.filter((ws) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      ws.title.toLowerCase().includes(q) ||
      ws.description.toLowerCase().includes(q) ||
      ws.tags.some((t) => t.toLowerCase().includes(q));

    const matchStatus = filterStatus === "All" || ws.status === filterStatus;

    // Determine user role in this workspace
    const isLeader = getUserId(ws.leader) === currentUserId;
    const isMember = ws.members.some((m) => getUserId(m.user) === currentUserId);
    const role = isLeader ? "Leader" : isMember ? "Member" : null;

    const matchTab =
      activeTab === "all"
        ? true
        : activeTab === "leading"
        ? isLeader
        : activeTab === "contributing"
        ? isMember && !isLeader
        : false; // "starred" not supported

    return matchSearch && matchStatus && matchTab && role !== null;
  });

  const stats = {
    total: workspaces.length,
    leading: workspaces.filter((ws) => getUserId(ws.leader) === currentUserId).length,
    active: workspaces.filter((ws) => ws.status === "Active").length,
    completed: workspaces.filter((ws) => ws.status === "Completed").length,
  };

  const tabs = [
    { key: "all", label: "All", count: workspaces.length },
    { key: "leading", label: "Leading", count: stats.leading },
    { key: "contributing", label: "Contributing", count: workspaces.length - stats.leading },
    { key: "starred", label: "Starred", count: 0 }, // no star support
  ] as const;

  if (!currentUser) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Please log in</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen font-sans py-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-3 py-1 text-xs text-green-700 mb-3">
            <FolderOpen className="w-3.5 h-3.5" /> Team Workspace · {stats.active} active projects
          </div>
          <h1 className="text-3xl font-bold text-gray-900">My Workspaces</h1>
          <p className="text-sm text-gray-500 mt-1">
            All your projects in one place — track tasks, manage teams, and keep collaboration on schedule.
          </p>
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
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gray-900 text-white text-sm hover:bg-gray-800"
          >
            <Plus className="w-4 h-4" /> New Workspace
          </button>
        </div>

        {/* Workspace grid */}
        {loading ? (
          <div className="text-center py-10 text-gray-500">Loading workspaces...</div>
        ) : filtered.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
            <div className="text-4xl mb-3">🗂️</div>
            <h3 className="text-lg font-semibold text-gray-900">No workspaces found</h3>
            <p className="text-sm text-gray-500 mt-1 mb-4">
              Try adjusting your filters or create your first workspace.
            </p>
            <button
              onClick={() => setShowCreate(true)}
              className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
            >
              Create a workspace →
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((ws) => (
              <WorkspaceCard key={ws._id} workspace={ws} currentUserId={currentUserId} />
            ))}
          </div>
        )}
      </div>

      {showCreate && (
        <CreateModal
          onClose={() => setShowCreate(false)}
          onCreate={handleCreate}
        />
      )}
    </div>
  );
}