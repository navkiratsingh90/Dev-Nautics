"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft, Plus, Pencil, Trash2, X, ChevronDown,
  CheckCircle, Clock, GitCommit, TrendingUp, ListTodo, UserCheck,
  CalendarDays, LayoutDashboard, ExternalLink, Github,
  Users, Star, Lock, Globe, Mail,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────
interface Member { id: number; name: string; role: string; avatar: string; email: string; }
interface Task { id: number; description: string; priority: "High"|"Medium"|"Low"; assignedTo: number; status: "In Progress"|"Completed"|"Pending"; dueDate: string; }
interface Event { id: number; title: string; description: string; startDate: string; endDate: string; type: "Meeting"|"Deadline"|"Milestone"|"Other"; }

// ─── Mock data store (simplified) ───────────────────────────────
const PROJECT_STORE: Record<string, any> = {
  p1: {
    name: "AI Code Assistant",
    description: "Intelligent code completion using fine-tuned LLMs.",
    status: "In Progress", progress: 65, category: "AI/ML",
    githubRepo: "https://github.com/team/ai-code-assistant", visibility: "public",
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80",
    lastCommit: { message: "feat: Real-time suggestions", author: "Alex Chen", timestamp: "2025-04-12 14:30", hash: "a1b2c3d" },
    timeline: [
      { stage: "Planning", status: "completed", date: "2025-01-01" },
      { stage: "Development", status: "current", date: "2025-03-15" },
      { stage: "Testing", status: "upcoming", date: "2025-05-01" },
    ],
  },
  default: {
    name: "Project Workspace", description: "Collaborative team workspace.",
    status: "In Progress", progress: 50, category: "Web Dev",
    githubRepo: "https://github.com/team/project", visibility: "private",
    image: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=800&q=80",
    lastCommit: { message: "chore: Update deps", author: "dev", timestamp: "2025-04-10", hash: "000aaaa" },
    timeline: [
      { stage: "Planning", status: "completed", date: "2025-01-01" },
      { stage: "Development", status: "current", date: "2025-02-01" },
      { stage: "Release", status: "upcoming", date: "2025-05-01" },
    ],
  },
};

const MEMBERS_STORE: Record<string, Member[]> = {
  p1: [
    { id: 1, name: "Alex Chen", role: "Project Lead", avatar: "AC", email: "alex@dev.io" },
    { id: 2, name: "Sarah Kim", role: "Frontend Dev", avatar: "SK", email: "sarah@dev.io" },
  ],
  default: [
    { id: 1, name: "Lead Dev", role: "Project Lead", avatar: "LD", email: "lead@dev.io" },
    { id: 2, name: "Dev Two", role: "Developer", avatar: "D2", email: "dev2@dev.io" },
  ],
};

const TASKS_STORE: Record<string, Task[]> = {
  p1: [
    { id: 1, description: "Implement real-time suggestions", priority: "High", assignedTo: 2, status: "In Progress", dueDate: "2025-04-30" },
    { id: 2, description: "Setup ML pipeline", priority: "High", assignedTo: 1, status: "Completed", dueDate: "2025-04-25" },
    { id: 3, description: "Write unit tests", priority: "Low", assignedTo: 2, status: "Pending", dueDate: "2025-05-05" },
  ],
  default: [
    { id: 1, description: "Set up project structure", priority: "High", assignedTo: 1, status: "Completed", dueDate: "2025-04-01" },
    { id: 2, description: "Implement core features", priority: "Medium", assignedTo: 2, status: "In Progress", dueDate: "2025-05-01" },
  ],
};

const EVENTS_STORE: Record<string, Event[]> = {
  p1: [
    { id: 1, title: "Sprint Planning", description: "Plan next sprint", startDate: "2025-04-25T10:00", endDate: "2025-04-25T11:30", type: "Meeting" },
    { id: 2, title: "Beta Release", description: "Release beta version", startDate: "2025-05-15T00:00", endDate: "2025-05-15T00:00", type: "Milestone" },
  ],
  default: [
    { id: 1, title: "Kickoff Meeting", description: "Project kickoff", startDate: "2025-04-20T10:00", endDate: "2025-04-20T11:00", type: "Meeting" },
  ],
};

// ─── Helper functions ──────────────────────────────────────────
const getInitials = (name: string) => name.split(" ").map(n => n[0]).join("").toUpperCase();

// ─── Simple Modal ──────────────────────────────────────────────
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

// ─── Main Page ─────────────────────────────────────────────────
export default function ProjectTrackerPage() {
  const params = useParams();
  const projectId = (params?.pid as string) ?? "default";
  const isLeader = true; // Replace with actual check

  const project = PROJECT_STORE[projectId] ?? PROJECT_STORE.default;
  const [members, setMembers] = useState<Member[]>(MEMBERS_STORE[projectId] ?? MEMBERS_STORE.default);
  const [tasks, setTasks] = useState<Task[]>(TASKS_STORE[projectId] ?? TASKS_STORE.default);
  const [events, setEvents] = useState<Event[]>(EVENTS_STORE[projectId] ?? EVENTS_STORE.default);
  const [activeTab, setActiveTab] = useState<"overview"|"tasks"|"team"|"calendar">("overview");

  // Modal state
  const [modal, setModal] = useState<{ type: "task"|"member"|"event"; item?: any } | null>(null);
  const [taskForm, setTaskForm] = useState<Partial<Task>>({});
  const [memberForm, setMemberForm] = useState<Partial<Member>>({});
  const [eventForm, setEventForm] = useState<Partial<Event>>({});

  const completedTasks = tasks.filter(t => t.status === "Completed").length;

  const openModal = (type: "task"|"member"|"event", item?: any) => {
    setModal({ type, item });
    if (type === "task") setTaskForm(item ?? { description: "", priority: "Low", assignedTo: 0, dueDate: "", status: "Pending" });
    if (type === "member") setMemberForm(item ?? { name: "", role: "", email: "" });
    if (type === "event") setEventForm(item ?? { title: "", description: "", startDate: "", endDate: "", type: "Meeting" });
  };

  const closeModal = () => setModal(null);

  const submitModal = () => {
    if (!modal) return;
    if (modal.type === "task") {
      if (modal.item) setTasks(t => t.map(x => x.id === modal.item.id ? { ...taskForm as Task, id: modal.item.id } : x));
      else setTasks(t => [...t, { ...taskForm as Task, id: Date.now() }]);
      toast.success(modal.item ? "Task updated" : "Task added");
    }
    if (modal.type === "member") {
      const avatar = getInitials(memberForm.name ?? "??");
      if (modal.item) setMembers(m => m.map(x => x.id === modal.item.id ? { ...memberForm as Member, id: modal.item.id, avatar } : x));
      else setMembers(m => [...m, { ...memberForm as Member, id: Date.now(), avatar }]);
      toast.success(modal.item ? "Member updated" : "Member added");
    }
    if (modal.type === "event") {
      if (modal.item) setEvents(e => e.map(x => x.id === modal.item.id ? { ...eventForm as Event, id: modal.item.id } : x));
      else setEvents(e => [...e, { ...eventForm as Event, id: Date.now() }]);
      toast.success(modal.item ? "Event updated" : "Event added");
    }
    closeModal();
  };

  const deleteTask = (id: number) => { setTasks(t => t.filter(x => x.id !== id)); toast.success("Task deleted"); };
  const deleteMember = (id: number) => { setMembers(m => m.filter(x => x.id !== id)); toast.success("Member removed"); };
  const deleteEvent = (id: number) => { setEvents(e => e.filter(x => x.id !== id)); toast.success("Event deleted"); };

  const tabs = [
    { id: "overview", label: "Overview", icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: "tasks", label: "Tasks", icon: <ListTodo className="w-4 h-4" />, badge: tasks.filter(t => t.status !== "Completed").length },
    { id: "team", label: "Team", icon: <UserCheck className="w-4 h-4" />, badge: members.length },
    { id: "calendar", label: "Calendar", icon: <CalendarDays className="w-4 h-4" />, badge: events.length },
  ] as const;

  // Simple status/priority chips (no gradients)
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
  const eventTypeClass = (t: string) => {
    if (t === "Meeting") return "bg-purple-100 text-purple-700";
    if (t === "Deadline") return "bg-red-100 text-red-700";
    if (t === "Milestone") return "bg-pink-100 text-pink-700";
    return "bg-gray-100 text-gray-700";
  };

  return (
    <div className="bg-gray-50 min-h-screen font-sans py-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Back button */}
        <Link href="/team-workspace">
          <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"><ArrowLeft className="w-4 h-4" /> Back to Workspaces</button>
        </Link>

        {/* Project hero card */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="relative h-40">
            <img src={project.image} alt={project.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40" />
            <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
              <h1 className="text-2xl font-bold">{project.name}</h1>
              <p className="text-sm text-white/80 mt-1">{project.description}</p>
            </div>
          </div>
          <div className="px-5 py-3 flex items-center gap-4 border-t border-gray-100">
            <div className="flex-1">
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-gray-900 rounded-full" style={{ width: `${project.progress}%` }} />
              </div>
            </div>
            <span className="text-sm font-medium text-gray-900">{project.progress}%</span>
            <span className="text-sm text-gray-500">{completedTasks}/{tasks.length} tasks</span>
            <div className="flex -space-x-1">
              {members.slice(0, 4).map(m => (
                <div key={m.id} className="w-6 h-6 rounded-lg bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-700 ring-1 ring-white">{m.avatar}</div>
              ))}
              {members.length > 4 && <div className="w-6 h-6 rounded-lg bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-700 ring-1 ring-white">+{members.length-4}</div>}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium ${activeTab === tab.id ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:bg-gray-200"}`}>
              {tab.icon} {tab.label}
              {"badge" in tab && tab.badge > 0 && <span className="text-xs bg-gray-200 text-gray-700 px-1.5 rounded-full">{tab.badge}</span>}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Progress stats */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5">
              <h3 className="font-semibold text-gray-900 mb-3">Progress & Timeline</h3>
              <div className="grid grid-cols-3 gap-3 mb-5">
                <div className="text-center p-2 bg-gray-50 rounded-xl"><div className="text-xl font-bold text-green-600">{completedTasks}</div><div className="text-xs text-gray-500">Done</div></div>
                <div className="text-center p-2 bg-gray-50 rounded-xl"><div className="text-xl font-bold text-blue-600">{tasks.filter(t=>t.status==="In Progress").length}</div><div className="text-xs text-gray-500">Active</div></div>
                <div className="text-center p-2 bg-gray-50 rounded-xl"><div className="text-xl font-bold text-amber-600">{tasks.filter(t=>t.status==="Pending").length}</div><div className="text-xs text-gray-500">Pending</div></div>
              </div>
              <div className="space-y-2">
                {project.timeline.map((s: any, i: number) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${s.status==="completed"?"bg-green-500":s.status==="current"?"bg-blue-500":"bg-gray-300"}`} />
                    <div className="flex-1 flex justify-between text-sm"><span className={s.status==="current"?"font-medium text-gray-900":"text-gray-600"}>{s.stage}</span><span className="text-xs text-gray-400">{s.date}</span></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Latest commit & upcoming events */}
            <div className="space-y-5">
              <div className="bg-white border border-gray-200 rounded-2xl p-5">
                <h3 className="font-semibold text-gray-900 mb-3">Latest Commit</h3>
                <div className="bg-gray-50 p-3 rounded-xl">
                  <div className="flex justify-between text-xs"><span className="font-mono text-gray-600">{project.lastCommit.hash}</span><span className="text-gray-400">{project.lastCommit.timestamp}</span></div>
                  <p className="text-sm font-medium text-gray-800 my-2">{project.lastCommit.message}</p>
                  <div className="flex items-center gap-2"><div className="w-6 h-6 rounded-lg bg-gray-200 flex items-center justify-center text-[10px] font-bold">{project.lastCommit.author[0]}</div><span className="text-xs text-gray-500">{project.lastCommit.author}</span></div>
                </div>
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl p-5">
                <div className="flex justify-between items-center mb-3"><h3 className="font-semibold text-gray-900">Upcoming Events</h3><button onClick={()=>setActiveTab("calendar")} className="text-sm text-blue-600">View all →</button></div>
                <div className="space-y-2">
                  {events.slice(0,2).map(ev => (
                    <div key={ev.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                      <span className={`text-xs px-2 py-0.5 rounded ${eventTypeClass(ev.type)}`}>{ev.type}</span>
                      <span className="text-sm font-medium text-gray-800">{ev.title}</span>
                      <span className="text-xs text-gray-500 ml-auto">{new Date(ev.startDate).toLocaleDateString()}</span>
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
              <div><h2 className="font-semibold text-gray-900">Tasks</h2><p className="text-xs text-gray-500">{completedTasks}/{tasks.length} completed</p></div>
              {isLeader && <button onClick={()=>openModal("task")} className="flex items-center gap-1 px-3 py-1.5 bg-gray-900 text-white text-sm rounded-lg"><Plus className="w-4 h-4"/> Add Task</button>}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>{["Task","Priority","Assignee","Status","Due","Actions"].map(h=><th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500">{h}</th>)}</tr>
                </thead>
                <tbody>
                  {tasks.map(task => {
                    const assignee = members.find(m=>m.id===task.assignedTo);
                    return (
                      <tr key={task.id} className="border-b border-gray-100">
                        <td className="px-4 py-3 max-w-xs">{task.description}</td>
                        <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded ${priorityClass(task.priority)}`}>{task.priority}</span></td>
                        <td className="px-4 py-3">{assignee?.name || "Unassigned"}</td>
                        <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded ${statusClass(task.status)}`}>{task.status}</span></td>
                        <td className="px-4 py-3 text-gray-500">{task.dueDate}</td>
                        {isLeader && (
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <button onClick={()=>openModal("task",task)} className="text-amber-600 hover:text-amber-800"><Pencil className="w-4 h-4"/></button>
                              <button onClick={()=>deleteTask(task.id)} className="text-red-600 hover:text-red-800"><Trash2 className="w-4 h-4"/></button>
                            </div>
                          </td>
                        )}
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
            <div className="flex justify-between items-center"><h2 className="font-semibold text-gray-900">Team Members ({members.length})</h2>{isLeader && <button onClick={()=>openModal("member")} className="flex items-center gap-1 px-3 py-1.5 bg-gray-900 text-white text-sm rounded-lg"><Plus className="w-4 h-4"/> Add Member</button>}</div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {members.map(m => (
                <div key={m.id} className="bg-white border border-gray-200 rounded-2xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center font-bold text-gray-700">{m.avatar}</div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{m.name}</p>
                      <p className="text-xs text-blue-600">{m.role}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5"><Mail className="w-3 h-3"/>{m.email}</p>
                    </div>
                    {isLeader && m.role !== "Project Lead" && (
                      <div className="flex gap-1">
                        <button onClick={()=>openModal("member",m)} className="text-amber-600"><Pencil className="w-4 h-4"/></button>
                        <button onClick={()=>deleteMember(m.id)} className="text-red-600"><Trash2 className="w-4 h-4"/></button>
                      </div>
                    )}
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex justify-between text-xs"><span>Tasks</span><span>{tasks.filter(t=>t.assignedTo===m.id).length}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Calendar Tab */}
        {activeTab === "calendar" && (
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="font-semibold text-gray-900">Calendar Events ({events.length})</h2>
              {isLeader && <button onClick={()=>openModal("event")} className="flex items-center gap-1 px-3 py-1.5 bg-gray-900 text-white text-sm rounded-lg"><Plus className="w-4 h-4"/> Add Event</button>}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>{["Event","Type","Start","End","Actions"].map(h=><th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500">{h}</th>)}</tr>
                </thead>
                <tbody>
                  {events.map(ev => (
                    <tr key={ev.id} className="border-b border-gray-100">
                      <td className="px-4 py-3"><div><div className="font-medium text-gray-900">{ev.title}</div><div className="text-xs text-gray-500">{ev.description}</div></div></td>
                      <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded ${eventTypeClass(ev.type)}`}>{ev.type}</span></td>
                      <td className="px-4 py-3 text-gray-600">{new Date(ev.startDate).toLocaleString()}</td>
                      <td className="px-4 py-3 text-gray-600">{new Date(ev.endDate).toLocaleString()}</td>
                      {isLeader && (
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button onClick={()=>openModal("event",ev)} className="text-amber-600"><Pencil className="w-4 h-4"/></button>
                            <button onClick={()=>deleteEvent(ev.id)} className="text-red-600"><Trash2 className="w-4 h-4"/></button>
                          </div>
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

      {/* Modals */}
      {modal && (
        <Modal title={modal.type==="task" ? (modal.item?"Edit Task":"Add Task") : modal.type==="member" ? (modal.item?"Edit Member":"Add Member") : (modal.item?"Edit Event":"Add Event")} onClose={closeModal}>
          <form onSubmit={e=>{e.preventDefault(); submitModal();}} className="space-y-4">
            {modal.type==="task" && (
              <>
                <textarea className="w-full px-3 py-2 border border-gray-200 rounded-lg" rows={2} placeholder="Task description" value={taskForm.description||""} onChange={e=>setTaskForm(f=>({...f,description:e.target.value}))} required />
                <div className="grid grid-cols-2 gap-3">
                  <select className="px-3 py-2 border border-gray-200 rounded-lg" value={taskForm.priority} onChange={e=>setTaskForm(f=>({...f,priority:e.target.value as any}))}>
                    <option>Low</option><option>Medium</option><option>High</option>
                  </select>
                  <select className="px-3 py-2 border border-gray-200 rounded-lg" value={taskForm.status} onChange={e=>setTaskForm(f=>({...f,status:e.target.value as any}))}>
                    <option>Pending</option><option>In Progress</option><option>Completed</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <select className="px-3 py-2 border border-gray-200 rounded-lg" value={taskForm.assignedTo} onChange={e=>setTaskForm(f=>({...f,assignedTo:parseInt(e.target.value)}))} required>
                    <option value="">Assign to</option>
                    {members.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                  <input type="date" className="px-3 py-2 border border-gray-200 rounded-lg" value={taskForm.dueDate||""} onChange={e=>setTaskForm(f=>({...f,dueDate:e.target.value}))} />
                </div>
              </>
            )}
            {modal.type==="member" && (
              <>
                <input className="w-full px-3 py-2 border border-gray-200 rounded-lg" placeholder="Full name" value={memberForm.name||""} onChange={e=>setMemberForm(f=>({...f,name:e.target.value}))} required />
                <input className="w-full px-3 py-2 border border-gray-200 rounded-lg" placeholder="Role" value={memberForm.role||""} onChange={e=>setMemberForm(f=>({...f,role:e.target.value}))} required />
                <input type="email" className="w-full px-3 py-2 border border-gray-200 rounded-lg" placeholder="Email" value={memberForm.email||""} onChange={e=>setMemberForm(f=>({...f,email:e.target.value}))} required />
              </>
            )}
            {modal.type==="event" && (
              <>
                <input className="w-full px-3 py-2 border border-gray-200 rounded-lg" placeholder="Title" value={eventForm.title||""} onChange={e=>setEventForm(f=>({...f,title:e.target.value}))} required />
                <textarea className="w-full px-3 py-2 border border-gray-200 rounded-lg" rows={2} placeholder="Description" value={eventForm.description||""} onChange={e=>setEventForm(f=>({...f,description:e.target.value}))} />
                <select className="w-full px-3 py-2 border border-gray-200 rounded-lg" value={eventForm.type} onChange={e=>setEventForm(f=>({...f,type:e.target.value as any}))}>
                  <option>Meeting</option><option>Deadline</option><option>Milestone</option><option>Other</option>
                </select>
                <div className="grid grid-cols-2 gap-3">
                  <input type="datetime-local" className="px-3 py-2 border border-gray-200 rounded-lg" value={eventForm.startDate||""} onChange={e=>setEventForm(f=>({...f,startDate:e.target.value}))} required />
                  <input type="datetime-local" className="px-3 py-2 border border-gray-200 rounded-lg" value={eventForm.endDate||""} onChange={e=>setEventForm(f=>({...f,endDate:e.target.value}))} required />
                </div>
              </>
            )}
            <div className="flex gap-3 pt-2 border-t border-gray-200">
              <button type="button" onClick={closeModal} className="flex-1 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">Cancel</button>
              <button type="submit" className="flex-1 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800">Save</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}