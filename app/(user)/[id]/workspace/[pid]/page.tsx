"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAppSelector } from "@/redux/hooks";
import { toast } from "sonner";
import axios from "axios";
import {
  ArrowLeft, Plus, Pencil, Trash2, X,
  CheckCircle, ListTodo, UserCheck,
  CalendarDays, LayoutDashboard, Github,
  Users,
} from "lucide-react";

// ─── Types (aligned with the Mongoose schema) ──────────────────────────
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
  user: { _id: string; username: string } | string;
  role: string;
  totalTasksCompleted: number;
}

interface Timeline {
  name: string;
  completed: boolean;
  completedAt?: string;
}

interface Commit {
  message: string;
  author: { _id: string; username: string } | string | null;
  date: string;
}

interface CalendarEvent {
  _id?: string;
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
  status: "Not Started" | "Active" | "On Hold" | "Completed";
  calendarEvents: CalendarEvent[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

// ─── Status / Priority styles ────────────────────────────────────────────
const statusClass = (s: string) => {
  if (s === "Completed") return "bg-green-100 text-green-700";
  if (s === "In Progress") return "bg-blue-100 text-blue-700";
  return "bg-amber-100 text-amber-700";
};

const priorityClass = (p: string) => {
  if (p === "High") return "bg-red-100 text-red-700";
  if (p === "Medium") return "bg-amber-100 text-amber-700";
  return "bg-green-100 text-green-700";
};

// ─── Simple Modal ────────────────────────────────────────────────────────
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-gray-200" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────
export default function ProjectTrackerPage() {
  const router = useRouter();
  const params = useParams();
  const workspaceId = params?.pid as string;

  const currentUser = useAppSelector((state: any) => state.User.userData);
  const currentUserId = currentUser?._id || "";

  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<"overview" | "tasks" | "team" | "calendar">("overview");

  // Modal state
  const [modal, setModal] = useState<{ type: "task" | "member" | "event" | "commit"; item?: any } | null>(null);
  const [taskForm, setTaskForm] = useState<Partial<Task>>({});
  const [memberForm, setMemberForm] = useState<Partial<{ username: string; role: string }>>({});
  const [eventForm, setEventForm] = useState<Partial<CalendarEvent>>({});
  const [commitForm, setCommitForm] = useState<{ message: string }>({ message: "" });

  // ── Fetch workspace ────────────────────────────────────────────────────
  const fetchWorkspace = async () => {
    if (!workspaceId) {
      setError("Workspace ID is missing");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const { data } = await axios.get(`/api/workspace/${workspaceId}`);
      if (data.success) {
        setWorkspace(data.data);
      } else {
        setError(data.message || "Failed to load workspace");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load workspace");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspace();
  }, [workspaceId]);

  // ── Permissions ──────────────────────────────────────────────────────
  const isLeader = workspace
    ? (typeof workspace.leader === "string"
        ? workspace.leader
        : workspace.leader._id) === currentUserId
    : false;

  // ── Task handlers ─────────────────────────────────────────────────────
  const addTask = async (taskData: Omit<Task, "_id" | "createdAt" | "updatedAt">) => {
    try {
      const { data } = await axios.post(`/api/workspace/${workspaceId}/task`, taskData);
      if (data.success) {
        await fetchWorkspace();
        toast.success("Task added");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to add task");
    }
  };

  const completeTask = async (taskId: string) => {
    try {
      const { data } = await axios.put(`/api/workspace/${workspaceId}/task/${taskId}`);
      if (data.success) {
        await fetchWorkspace();
        toast.success("Task completed");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to complete task");
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      const { data } = await axios.delete(`/api/workspace/${workspaceId}/task/${taskId}`);
      if (data.success) {
        await fetchWorkspace();
        toast.success("Task deleted");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete task");
    }
  };

  // ── Member handlers ──────────────────────────────────────────────────
  const addMember = async (username: string, role: string) => {
    try {
      const { data } = await axios.post(`/api/workspace/${workspaceId}/members`, {
        members: [{ user: username, role }],
      });
      if (data.success) {
        await fetchWorkspace();
        toast.success("Member added");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to add member");
    }
  };

  const removeMember = async (memberId: string) => {
    try {
      const { data } = await axios.delete(`/api/workspace/${workspaceId}/members/${memberId}`);
      if (data.success) {
        await fetchWorkspace();
        toast.success("Member removed");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to remove member");
    }
  };

  // ── Event handlers ──────────────────────────────────────────────────
  const addEvent = async (eventData: Partial<CalendarEvent>) => {
    try {
      const updatedEvents = [...(workspace?.calendarEvents || []), eventData];
      const { data } = await axios.put(`/api/workspace/${workspaceId}`, {
        calendarEvents: updatedEvents,
      });
      if (data.success) {
        await fetchWorkspace();
        toast.success("Event added");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to add event");
    }
  };

  const deleteEvent = async (eventId: string) => {
    if (!window.confirm("Delete this event?")) return;
    const updatedEvents = (workspace?.calendarEvents || []).filter((e) => e._id !== eventId);
    try {
      const { data } = await axios.put(`/api/workspace/${workspaceId}`, {
        calendarEvents: updatedEvents,
      });
      if (data.success) {
        await fetchWorkspace();
        toast.success("Event deleted");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete event");
    }
  };

  // ── Commit handler ──────────────────────────────────────────────────
  const addCommit = async (message: string) => {
    try {
      const newCommit = {
        message,
        author: currentUserId || null,
        date: new Date().toISOString(),
      };
      const updatedCommits = [...(workspace?.commits || []), newCommit];
      const { data } = await axios.put(`/api/workspace/${workspaceId}`, {
        commits: updatedCommits,
      });
      if (data.success) {
        await fetchWorkspace();
        toast.success("Commit added");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to add commit");
    }
  };

  // ── Timeline handler ──────────────────────────────────────────────────
  const toggleTimeline = async (index: number) => {
    if (!workspace) return;
    const updatedTimeline = workspace.timeline.map((item, i) => {
      if (i === index) {
        const newCompleted = !item.completed;
        return {
          ...item,
          completed: newCompleted,
          completedAt: newCompleted ? new Date().toISOString() : undefined,
        };
      }
      return item;
    });
    try {
      const { data } = await axios.put(`/api/workspace/${workspaceId}`, {
        timeline: updatedTimeline,
      });
      if (data.success) {
        await fetchWorkspace();
        toast.success("Timeline updated");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update timeline");
    }
  };

  // ── Update workspace ──────────────────────────────────────────────────
  const updateWorkspace = async (updates: Partial<Workspace>) => {
    try {
      const { data } = await axios.put(`/api/workspace/${workspaceId}`, updates);
      if (data.success) {
        await fetchWorkspace();
        toast.success("Workspace updated");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update workspace");
    }
  };

  const deleteWorkspace = async () => {
    if (!window.confirm("Delete this workspace? This action cannot be undone.")) return;
    try {
      await axios.delete(`/api/workspace/${workspaceId}`);
      toast.success("Workspace deleted");
      router.push("/team-workspace");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete workspace");
    }
  };

  // ── Modal submit ────────────────────────────────────────────────────
  const submitModal = () => {
    if (!modal) return;
    if (modal.type === "task") {
      const taskData = taskForm as any;
      if (modal.item) {
        closeModal();
      } else {
        addTask({
          description: taskData.description,
          priority: taskData.priority,
          assignedTo: taskData.assignedTo,
          dueDate: taskData.dueDate,
          status: "Pending",
        });
      }
    }
    if (modal.type === "member") {
      addMember(memberForm.username!, memberForm.role!);
    }
    if (modal.type === "event") {
      addEvent(eventForm);
    }
    if (modal.type === "commit") {
      addCommit(commitForm.message);
    }
    closeModal();
  };

  const openModal = (type: "task" | "member" | "event" | "commit", item?: any) => {
    setModal({ type, item });
    if (type === "task") {
      setTaskForm(item ?? { description: "", priority: "Low", assignedTo: "", dueDate: "", status: "Pending" });
    }
    if (type === "member") {
      setMemberForm({ username: "", role: "" });
    }
    if (type === "event") {
      setEventForm({ title: "", description: "", startDate: "", endDate: "", meetLink: "" });
    }
    if (type === "commit") {
      setCommitForm({ message: "" });
    }
  };

  const closeModal = () => setModal(null);

  // ── Loading & Error ──────────────────────────────────────────────────
  if (loading || !currentUser) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading workspace...</div>
      </div>
    );
  }

  if (error || !workspace) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-red-500">{error || "Workspace not found"}</div>
      </div>
    );
  }

  const tasks = workspace.tasks || [];
  const members = workspace.members || [];
  const events = workspace.calendarEvents || [];
  const commits = workspace.commits || [];
  const completedTasks = tasks.filter((t) => t.status === "Completed").length;

  const totalTimeline = workspace.timeline.length;
  const completedTimeline = workspace.timeline.filter((t) => t.completed).length;
  const progress = totalTimeline > 0 ? Math.round((completedTimeline / totalTimeline) * 100) : 0;

  const tabs = [
    { id: "overview", label: "Overview", icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: "tasks", label: "Tasks", icon: <ListTodo className="w-4 h-4" />, badge: tasks.filter((t) => t.status !== "Completed").length },
    { id: "team", label: "Team", icon: <UserCheck className="w-4 h-4" />, badge: members.length },
    { id: "calendar", label: "Calendar", icon: <CalendarDays className="w-4 h-4" />, badge: events.length },
  ] as const;

  return (
    <div className="bg-gray-50 min-h-screen font-sans py-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Back button */}
        <Link href="/team-workspace">
          <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-4 h-4" /> Back to Workspaces
          </button>
        </Link>

        {/* Workspace hero card */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="relative h-40 bg-gradient-to-r from-gray-700 to-gray-900">
            <div className="absolute inset-0 bg-black/40" />
            <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
              <h1 className="text-2xl font-bold">{workspace.title}</h1>
              <p className="text-sm text-white/80 mt-1">{workspace.description}</p>
            </div>
          </div>
          <div className="px-5 py-3 flex items-center gap-4 border-t border-gray-100">
            <div className="flex-1">
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-gray-900 rounded-full" style={{ width: `${progress}%` }} />
              </div>
            </div>
            <span className="text-sm font-medium text-gray-900">{progress}%</span>
            <span className="text-sm text-gray-500">{completedTasks}/{tasks.length} tasks</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium ${
                activeTab === tab.id
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:bg-gray-200"
              }`}
            >
              {tab.icon} {tab.label}
              {"badge" in tab && tab.badge > 0 && (
                <span className="text-xs bg-gray-200 text-gray-700 px-1.5 rounded-full">{tab.badge}</span>
              )}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-200 rounded-2xl p-5">
              <h3 className="font-semibold text-gray-900 mb-3">Progress & Timeline</h3>
              <div className="grid grid-cols-3 gap-3 mb-5">
                <div className="text-center p-2 bg-gray-50 rounded-xl">
                  <div className="text-xl font-bold text-green-600">{completedTasks}</div>
                  <div className="text-xs text-gray-500">Done</div>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded-xl">
                  <div className="text-xl font-bold text-blue-600">{tasks.filter((t) => t.status === "In Progress").length}</div>
                  <div className="text-xs text-gray-500">Active</div>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded-xl">
                  <div className="text-xl font-bold text-amber-600">{tasks.filter((t) => t.status === "Pending").length}</div>
                  <div className="text-xs text-gray-500">Pending</div>
                </div>
              </div>
              <div className="space-y-2">
                {workspace.timeline.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <button
                      onClick={() => toggleTimeline(idx)}
                      className={`w-4 h-4 rounded border flex items-center justify-center ${
                        item.completed ? "bg-green-500 border-green-500 text-white" : "border-gray-300"
                      }`}
                    >
                      {item.completed && <CheckCircle className="w-3 h-3" />}
                    </button>
                    <div className="flex-1 flex justify-between text-sm">
                      <span className={item.completed ? "text-gray-600 line-through" : "text-gray-900"}>
                        {item.name}
                      </span>
                      <span className="text-xs text-gray-400">
                        {item.completed ? (item.completedAt ? new Date(item.completedAt).toLocaleDateString() : "Done") : "Pending"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-5">
              <div className="bg-white border border-gray-200 rounded-2xl p-5">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold text-gray-900">GitHub</h3>
                  {isLeader && (
                    <button
                      onClick={() => openModal("commit")}
                      className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Add Commit
                    </button>
                  )}
                </div>
                {workspace.githubLink ? (
                  <a
                    href={workspace.githubLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                  >
                    <Github className="w-4 h-4" /> {workspace.githubLink}
                  </a>
                ) : (
                  <p className="text-sm text-gray-500">No GitHub link provided</p>
                )}
                {commits.length > 0 && (
                  <div className="mt-3 max-h-40 overflow-y-auto space-y-1">
                    {commits.slice().reverse().map((commit, idx) => (
                      <div key={idx} className="bg-gray-50 p-2 rounded-lg text-sm">
                        <p className="font-medium">{commit.message}</p>
                        <div className="flex justify-between text-xs text-gray-400">
                          <span>
                            by {commit.author
                              ? (typeof commit.author === "string"
                                  ? "User"
                                  : commit.author.username ?? "Unknown")
                              : "Unknown"}
                          </span>
                          <span>{new Date(commit.date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ─── Upcoming Events (Overview) ────────────────────────── */}
              <div className="bg-white border border-gray-200 rounded-2xl p-5">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold text-gray-900">Upcoming Events</h3>
                  <button onClick={() => setActiveTab("calendar")} className="text-sm text-blue-600 hover:underline">
                    View all →
                  </button>
                </div>
                <div className="space-y-2">
                  {events.slice(0, 2).map((ev) => (
                    <div key={ev._id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-800">{ev.title}</span>
                      <span className="text-xs text-gray-500 ml-auto">
                        {ev.startDate ? new Date(ev.startDate).toLocaleDateString() : ""}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tasks Tab */}
        {activeTab === "tasks" && (
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h2 className="font-semibold text-gray-900">Tasks</h2>
                <p className="text-xs text-gray-500">{completedTasks}/{tasks.length} completed</p>
              </div>
              {isLeader && (
                <button
                  onClick={() => openModal("task")}
                  className="flex items-center gap-1 px-3 py-1.5 bg-gray-900 text-white text-sm rounded-lg"
                >
                  <Plus className="w-4 h-4" /> Add Task
                </button>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {["Task", "Priority", "Assignee", "Status", "Due", "Actions"].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((task) => {
                    const assignee = members.find((m) => {
                      const mId = typeof m.user === "string" ? m.user : m.user._id;
                      const taskId = typeof task.assignedTo === "string"
                        ? task.assignedTo
                        : task.assignedTo?._id || "";
                      return mId === taskId;
                    });
                    const assigneeName = assignee
                      ? (typeof assignee.user === "string"
                          ? "User"
                          : assignee.user.username ?? "Unknown")
                      : "Unassigned";
                    return (
                      <tr key={task._id} className="border-b border-gray-100">
                        <td className="px-4 py-3 max-w-xs">{task.description}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded ${priorityClass(task.priority)}`}>
                            {task.priority}
                          </span>
                        </td>
                        <td className="px-4 py-3">{assigneeName}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded ${statusClass(task.status)}`}>
                            {task.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500">
                          {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : ""}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            {task.status !== "Completed" && (
                              <button
                                onClick={() => completeTask(task._id!)}
                                className="text-green-600 hover:text-green-800"
                                title="Complete task"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            )}
                            {isLeader && (
                              <>
                                <button
                                  onClick={() => openModal("task", task)}
                                  className="text-amber-600 hover:text-amber-800"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => deleteTask(task._id!)}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Team Tab */}
        {activeTab === "team" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="font-semibold text-gray-900">Team Members ({members.length})</h2>
              {isLeader && (
                <button
                  onClick={() => openModal("member")}
                  className="flex items-center gap-1 px-3 py-1.5 bg-gray-900 text-white text-sm rounded-lg"
                >
                  <Plus className="w-4 h-4" /> Add Member
                </button>
              )}
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {members.map((m) => {
                const userId = typeof m.user === "string" ? m.user : m.user._id;
                const displayName = typeof m.user === "string"
                  ? "User"
                  : m.user.username ?? "Unknown";
                const isLeaderMember = userId === (typeof workspace.leader === "string"
                  ? workspace.leader
                  : workspace.leader._id);
                const initials = displayName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase();
                return (
                  <div key={userId} className="bg-white border border-gray-200 rounded-2xl p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center font-bold text-gray-700">
                        {initials}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{displayName}</p>
                        <p className="text-xs text-blue-600">{m.role}</p>
                      </div>
                      {isLeader && !isLeaderMember && (
                        <div className="flex gap-1">
                          <button
                            onClick={() => removeMember(userId)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="flex justify-between text-xs">
                        <span>Tasks completed</span>
                        <span>{m.totalTasksCompleted || 0}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Calendar Tab – CORRECTED */}
        {activeTab === "calendar" && (
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="font-semibold text-gray-900">Calendar Events ({events.length})</h2>
              {isLeader && (
                <button
                  onClick={() => openModal("event")}
                  className="flex items-center gap-1 px-3 py-1.5 bg-gray-900 text-white text-sm rounded-lg"
                >
                  <Plus className="w-4 h-4" /> Add Event
                </button>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Event</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Meet Link</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Start</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">End</th>
                    {isLeader && <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {events.map((ev) => (
                    <tr key={ev._id} className="border-b border-gray-100">
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-medium text-gray-900">{ev.title}</div>
                          {ev.description && <div className="text-xs text-gray-500">{ev.description}</div>}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {ev.meetLink ? (
                          <a href={ev.meetLink} target="_blank" rel="noopener" className="text-blue-600 hover:underline text-xs">
                            Meet Link
                          </a>
                        ) : (
                          <span className="text-gray-400 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {ev.startDate ? new Date(ev.startDate).toLocaleString() : ""}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {ev.endDate ? new Date(ev.endDate).toLocaleString() : ""}
                      </td>
                      {isLeader && (
                        <td className="px-4 py-3">
                          <button
                            onClick={() => deleteEvent(ev._id!)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ─── Modals ────────────────────────────────────────────────────────── */}
      {modal && (
        <Modal
          title={
            modal.type === "task"
              ? modal.item
                ? "Edit Task"
                : "Add Task"
              : modal.type === "member"
              ? "Add Member"
              : modal.type === "event"
              ? "Add Event"
              : "Add Commit"
          }
          onClose={closeModal}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submitModal();
            }}
            className="space-y-4"
          >
            {modal.type === "task" && (
              <>
                <textarea
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                  rows={2}
                  placeholder="Task description"
                  value={taskForm.description || ""}
                  onChange={(e) => setTaskForm((f) => ({ ...f, description: e.target.value }))}
                  required
                />
                <div className="grid grid-cols-2 gap-3">
                  <select
                    className="px-3 py-2 border border-gray-200 rounded-lg"
                    value={taskForm.priority || "Low"}
                    onChange={(e) => setTaskForm((f) => ({ ...f, priority: e.target.value as any }))}
                  >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>
                  <select
                    className="px-3 py-2 border border-gray-200 rounded-lg"
                    value={taskForm.status || "Pending"}
                    onChange={(e) => setTaskForm((f) => ({ ...f, status: e.target.value as any }))}
                    disabled={!!modal.item}
                  >
                    <option>Pending</option>
                    <option>In Progress</option>
                    <option>Completed</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <select
                    className="px-3 py-2 border border-gray-200 rounded-lg"
                    value={typeof taskForm.assignedTo === "string" ? taskForm.assignedTo : ""}
                    onChange={(e) => setTaskForm((f) => ({ ...f, assignedTo: e.target.value }))}
                    required
                  >
                    <option value="">Assign to</option>
                    {members.map((m) => {
                      const id = typeof m.user === "string" ? m.user : m.user._id;
                      const name = typeof m.user === "string" ? "User" : m.user.username ?? "Unknown";
                      return (
                        <option key={id} value={id}>
                          {name}
                        </option>
                      );
                    })}
                  </select>
                  <input
                    type="date"
                    className="px-3 py-2 border border-gray-200 rounded-lg"
                    value={taskForm.dueDate || ""}
                    onChange={(e) => setTaskForm((f) => ({ ...f, dueDate: e.target.value }))}
                  />
                </div>
              </>
            )}

            {modal.type === "member" && (
              <>
                <input
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                  placeholder="Username"
                  value={memberForm.username || ""}
                  onChange={(e) => setMemberForm((f) => ({ ...f, username: e.target.value }))}
                  required
                />
                <input
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                  placeholder="Role (e.g., Developer)"
                  value={memberForm.role || ""}
                  onChange={(e) => setMemberForm((f) => ({ ...f, role: e.target.value }))}
                  required
                />
              </>
            )}

            {/* ─── Event Modal – CORRECTED ─────────────────────────────── */}
            {modal.type === "event" && (
              <>
                <input
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                  placeholder="Title"
                  value={eventForm.title || ""}
                  onChange={(e) => setEventForm((f) => ({ ...f, title: e.target.value }))}
                  required
                />
                <textarea
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                  rows={2}
                  placeholder="Description"
                  value={eventForm.description || ""}
                  onChange={(e) => setEventForm((f) => ({ ...f, description: e.target.value }))}
                />
                <input
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                  placeholder="Meet link (optional)"
                  value={eventForm.meetLink || ""}
                  onChange={(e) => setEventForm((f) => ({ ...f, meetLink: e.target.value }))}
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="datetime-local"
                    className="px-3 py-2 border border-gray-200 rounded-lg"
                    value={eventForm.startDate || ""}
                    onChange={(e) => setEventForm((f) => ({ ...f, startDate: e.target.value }))}
                    required
                  />
                  <input
                    type="datetime-local"
                    className="px-3 py-2 border border-gray-200 rounded-lg"
                    value={eventForm.endDate || ""}
                    onChange={(e) => setEventForm((f) => ({ ...f, endDate: e.target.value }))}
                    required
                  />
                </div>
              </>
            )}

            {modal.type === "commit" && (
              <>
                <input
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                  placeholder="Commit message"
                  value={commitForm.message}
                  onChange={(e) => setCommitForm((f) => ({ ...f, message: e.target.value }))}
                  required
                />
              </>
            )}

            <div className="flex gap-3 pt-2 border-t border-gray-200">
              <button
                type="button"
                onClick={closeModal}
                className="flex-1 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800"
              >
                Save
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}