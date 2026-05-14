"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAppSelector } from "@/redux/hooks";
import {
  ArrowLeft, Plus, Pencil, Trash2, X, ChevronDown, ChevronRight,
  CheckCircle, Clock, GitCommit, TrendingUp, ListTodo, UserCheck,
  CalendarDays, LayoutDashboard, Zap, ExternalLink, Github,
  Users, Star, Lock, Globe, AlertCircle, Mail, MoreHorizontal,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Member  { id: number; name: string; role: string; avatar: string; email: string; }
interface Task    { id: number; description: string; priority: "High"|"Medium"|"Low"; assignedTo: number; status: "In Progress"|"Completed"|"Pending"; dueDate: string; }
interface CalEvent{ id: number; title: string; description: string; startDate: string; endDate: string; type: "Meeting"|"Deadline"|"Milestone"|"Other"; }
interface Stage   { stage: string; status: "completed"|"current"|"upcoming"; date: string; }

// ─── Per-project mock data store ─────────────────────────────────────────────
const PROJECT_STORE: Record<string, {
  name: string;
  description: string;
  status: string;
  progress: number;
  category: string;
  githubRepo: string;
  visibility: "public" | "private";
  image: string;
  lastCommit: {
    message: string;
    author: string;
    timestamp: string;
    hash: string;
  };
  timeline: Stage[];
}> = {
  p1: {
    name: "AI Code Assistant",
    description: "Intelligent code completion using fine-tuned LLMs with real-time suggestions and smart refactoring.",
    status: "In Progress",
    progress: 65,
    category: "AI/ML",
    githubRepo: "https://github.com/team/ai-code-assistant",
    visibility: "public",
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80",
    lastCommit: {
      message: "feat: Implemented real-time code suggestions",
      author: "Alex Chen",
      timestamp: "2025-04-12 14:30",
      hash: "a1b2c3d",
    },
    timeline: [
      { stage: "Planning", status: "completed", date: "2025-01-01" },
      { stage: "Design", status: "completed", date: "2025-02-10" },
      { stage: "Development", status: "current", date: "2025-03-15" },
      { stage: "Testing", status: "upcoming", date: "2025-05-01" },
      { stage: "Deployment", status: "upcoming", date: "2025-05-15" },
    ],
  },
  p2: {
    name: "Decentralized Marketplace",
    description: "P2P gig economy on Ethereum with escrow contracts and reputation system.",
    status: "In Progress",
    progress: 40,
    category: "Blockchain",
    githubRepo: "https://github.com/team/decentral-market",
    visibility: "public",
    image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&q=80",
    lastCommit: {
      message: "fix: Escrow contract edge case",
      author: "alex_eth",
      timestamp: "2025-04-11 10:00",
      hash: "d4e5f6a",
    },
    timeline: [
      { stage: "Planning", status: "completed", date: "2025-02-01" },
      { stage: "Contracts", status: "completed", date: "2025-03-01" },
      { stage: "Frontend", status: "current", date: "2025-04-01" },
      { stage: "Audit", status: "upcoming", date: "2025-06-01" },
      { stage: "Launch", status: "upcoming", date: "2025-07-01" },
    ],
  },
  p3: {
    name: "DevConnect Hub",
    description: "A social platform for developers to collaborate, share projects, and join communities.",
    status: "In Progress",
    progress: 55,
    category: "Web Dev",
    githubRepo: "https://github.com/team/devconnect",
    visibility: "public",
    image: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&q=80",
    lastCommit: {
      message: "feat: Added community chat feature",
      author: "Navkirat",
      timestamp: "2025-04-15 18:00",
      hash: "abc1234",
    },
    timeline: [
      { stage: "Planning", status: "completed", date: "2025-01-10" },
      { stage: "UI Design", status: "completed", date: "2025-02-05" },
      { stage: "Development", status: "current", date: "2025-03-20" },
      { stage: "Testing", status: "upcoming", date: "2025-05-10" },
    ],
  },
  p4: {
    name: "Smart Expense Tracker",
    description: "AI-powered expense tracker with insights, categorization, and financial predictions.",
    status: "In Progress",
    progress: 70,
    category: "AI/Finance",
    githubRepo: "https://github.com/team/expense-tracker",
    visibility: "private",
    image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80",
    lastCommit: {
      message: "feat: Added ML-based expense prediction",
      author: "Priya",
      timestamp: "2025-04-14 11:45",
      hash: "efg5678",
    },
    timeline: [
      { stage: "Planning", status: "completed", date: "2025-01-05" },
      { stage: "Backend", status: "completed", date: "2025-02-20" },
      { stage: "AI Integration", status: "current", date: "2025-03-25" },
      { stage: "Deployment", status: "upcoming", date: "2025-05-01" },
    ],
  },
  p5: {
    name: "Real-time Chat App",
    description: "Scalable chat application with WebSockets, typing indicators, and media sharing.",
    status: "Completed",
    progress: 100,
    category: "Full Stack",
    githubRepo: "https://github.com/team/chat-app",
    visibility: "public",
    image: "https://images.unsplash.com/photo-1611605698335-8b1569810432?w=800&q=80",
    lastCommit: {
      message: "chore: Final production deployment",
      author: "Rohit",
      timestamp: "2025-04-10 20:00",
      hash: "xyz9999",
    },
    timeline: [
      { stage: "Planning", status: "completed", date: "2025-01-01" },
      { stage: "Development", status: "completed", date: "2025-02-15" },
      { stage: "Testing", status: "completed", date: "2025-03-10" },
      { stage: "Deployment", status: "completed", date: "2025-04-01" },
    ],
  },
  p6: {
    name: "Data Visualization Dashboard",
    description: "Interactive dashboards using charts and analytics for business insights.",
    status: "In Progress",
    progress: 60,
    category: "Data Science",
    githubRepo: "https://github.com/team/data-dashboard",
    visibility: "public",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
    lastCommit: {
      message: "feat: Added revenue analytics charts",
      author: "Ankit",
      timestamp: "2025-04-16 13:10",
      hash: "data456",
    },
    timeline: [
      { stage: "Planning", status: "completed", date: "2025-01-20" },
      { stage: "Data Collection", status: "completed", date: "2025-02-15" },
      { stage: "Visualization", status: "current", date: "2025-03-30" },
      { stage: "Optimization", status: "upcoming", date: "2025-05-10" },
    ],
  },
  default: {
    name: "Project Workspace",
    description: "Collaborative team workspace for tracking tasks and managing projects.",
    status: "In Progress",
    progress: 50,
    category: "Web Dev",
    githubRepo: "https://github.com/team/project",
    visibility: "private",
    image: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=800&q=80",
    lastCommit: {
      message: "chore: Update dependencies",
      author: "dev",
      timestamp: "2025-04-10 09:00",
      hash: "000aaaa",
    },
    timeline: [
      { stage: "Planning", status: "completed", date: "2025-01-01" },
      { stage: "Development", status: "current", date: "2025-02-01" },
      { stage: "Testing", status: "upcoming", date: "2025-04-01" },
      { stage: "Release", status: "upcoming", date: "2025-05-01" },
    ],
  },
};

const MEMBERS_STORE: Record<string, Member[]> = {
  p1: [{ id:1,name:"Alex Chen",role:"Project Lead",avatar:"AC",email:"alex@dev.io"},{id:2,name:"Sarah Kim",role:"Frontend Dev",avatar:"SK",email:"sarah@dev.io"},{id:3,name:"Mike Rodriguez",role:"Backend Dev",avatar:"MR",email:"mike@dev.io"},{id:4,name:"Emma Wilson",role:"ML Engineer",avatar:"EW",email:"emma@dev.io"},{id:5,name:"James Brown",role:"UI/UX Designer",avatar:"JB",email:"james@dev.io"}],
  p2: [{ id:1,name:"Alex Eth",role:"Project Lead",avatar:"AE",email:"alexeth@dev.io"},{id:2,name:"Alex J",role:"Frontend Dev",avatar:"AJ",email:"alexj@dev.io"},{id:3,name:"Priya S",role:"Blockchain Dev",avatar:"PS",email:"priya@dev.io"}],
  default: [{ id:1,name:"Lead Dev",role:"Project Lead",avatar:"LD",email:"lead@dev.io"},{id:2,name:"Dev Two",role:"Developer",avatar:"D2",email:"dev2@dev.io"}],
};

const TASKS_STORE: Record<string, Task[]> = {
  p1: [{id:1,description:"Implement real-time code suggestions",priority:"High",assignedTo:2,status:"In Progress",dueDate:"2025-04-30"},{id:2,description:"Setup ML model training pipeline",priority:"High",assignedTo:4,status:"Completed",dueDate:"2025-04-25"},{id:3,description:"Design user interface components",priority:"Medium",assignedTo:5,status:"Completed",dueDate:"2025-04-20"},{id:4,description:"Create API endpoints for code analysis",priority:"Medium",assignedTo:3,status:"In Progress",dueDate:"2025-04-28"},{id:5,description:"Write unit tests for core functionality",priority:"Low",assignedTo:2,status:"Pending",dueDate:"2025-05-05"},{id:6,description:"Document API usage",priority:"Low",assignedTo:1,status:"Pending",dueDate:"2025-05-10"}],
  p2: [{id:1,description:"Deploy escrow smart contract to testnet",priority:"High",assignedTo:3,status:"Completed",dueDate:"2025-04-15"},{id:2,description:"Build project listing UI",priority:"High",assignedTo:2,status:"In Progress",dueDate:"2025-04-30"},{id:3,description:"Implement wallet connection",priority:"Medium",assignedTo:2,status:"Completed",dueDate:"2025-04-20"},{id:4,description:"Write contract audit checklist",priority:"Low",assignedTo:1,status:"Pending",dueDate:"2025-05-15"}],
  default: [{id:1,description:"Set up project structure",priority:"High",assignedTo:1,status:"Completed",dueDate:"2025-04-01"},{id:2,description:"Implement core features",priority:"Medium",assignedTo:2,status:"In Progress",dueDate:"2025-05-01"}],
};

const EVENTS_STORE: Record<string, CalEvent[]> = {
  p1: [{id:1,title:"Sprint Planning",description:"Plan next sprint tasks",startDate:"2025-04-25T10:00",endDate:"2025-04-25T11:30",type:"Meeting"},{id:2,title:"ML Model Deadline",description:"Complete initial model",startDate:"2025-04-28T23:59",endDate:"2025-04-28T23:59",type:"Deadline"},{id:3,title:"UI/UX Review",description:"Review designs",startDate:"2025-04-26T14:00",endDate:"2025-04-26T15:00",type:"Meeting"},{id:4,title:"Beta Release",description:"Release beta version",startDate:"2025-05-15T00:00",endDate:"2025-05-15T00:00",type:"Milestone"}],
  p2: [{id:1,title:"Contract Review",description:"Review smart contract code",startDate:"2025-04-22T10:00",endDate:"2025-04-22T12:00",type:"Meeting"},{id:2,title:"Mainnet Launch",description:"Deploy to mainnet",startDate:"2025-07-01T00:00",endDate:"2025-07-01T00:00",type:"Milestone"}],
  default: [{id:1,title:"Kickoff Meeting",description:"Project kickoff",startDate:"2025-04-20T10:00",endDate:"2025-04-20T11:00",type:"Meeting"}],
};

// ─── Config ───────────────────────────────────────────────────────────────────
const statusConfig: Record<string, { dot: string; dark: string; light: string }> = {
  "Completed":   { dot:"bg-green-400",             dark:"bg-green-500/15 text-green-400 border-green-500/30",   light:"bg-green-50 text-green-600 border-green-200"   },
  "In Progress": { dot:"bg-blue-400 animate-pulse", dark:"bg-blue-500/15 text-blue-400 border-blue-500/30",     light:"bg-blue-50 text-blue-600 border-blue-200"     },
  "Pending":     { dot:"bg-amber-400",              dark:"bg-amber-500/15 text-amber-400 border-amber-500/30",  light:"bg-amber-50 text-amber-600 border-amber-200"   },
};
const priorityConfig: Record<string, { dark: string; light: string }> = {
  High:   { dark:"bg-red-500/15 text-red-400 border-red-500/30",     light:"bg-red-50 text-red-600 border-red-200"     },
  Medium: { dark:"bg-amber-500/15 text-amber-400 border-amber-500/30",light:"bg-amber-50 text-amber-600 border-amber-200"},
  Low:    { dark:"bg-green-500/15 text-green-400 border-green-500/30",light:"bg-green-50 text-green-600 border-green-200"},
};
const eventConfig: Record<string, { dark: string; light: string }> = {
  Meeting:   { dark:"bg-violet-500/15 text-violet-400 border-violet-500/30",  light:"bg-violet-50 text-violet-600 border-violet-200"  },
  Deadline:  { dark:"bg-red-500/15 text-red-400 border-red-500/30",           light:"bg-red-50 text-red-600 border-red-200"           },
  Milestone: { dark:"bg-fuchsia-500/15 text-fuchsia-400 border-fuchsia-500/30",light:"bg-fuchsia-50 text-fuchsia-600 border-fuchsia-200"},
  Other:     { dark:"bg-gray-500/15 text-gray-400 border-gray-500/30",        light:"bg-gray-50 text-gray-600 border-gray-200"        },
};
const avatarGradients = ["from-violet-500 to-fuchsia-500","from-cyan-500 to-blue-500","from-fuchsia-500 to-pink-500","from-amber-500 to-orange-500","from-green-500 to-emerald-500","from-blue-500 to-violet-500"];
const hashIdx = (id: number) => id % avatarGradients.length;

// ─── Chips (arrow functions) ─────────────────────────────────────────────────
const StatusChip = ({ s, d }: { s: string; d: boolean }) => {
  const c = statusConfig[s]; if (!c) return null;
  return <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${d ? c.dark : c.light}`}><span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />{s}</span>;
};
const PriorityChip = ({ p, d }: { p: string; d: boolean }) => {
  const c = priorityConfig[p]; if (!c) return null;
  return <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${d ? c.dark : c.light}`}>{p}</span>;
};
const EventChip = ({ t, d }: { t: string; d: boolean }) => {
  const c = eventConfig[t] ?? eventConfig.Other;
  return <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${d ? c.dark : c.light}`}>{t}</span>;
};

// ─── Modal (arrow function) ──────────────────────────────────────────────────
const Modal = ({ darkMode, title, onClose, children }: { darkMode: boolean; title: string; onClose: () => void; children: React.ReactNode }) => {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div ref={ref} className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background:"rgba(0,0,0,0.65)", backdropFilter:"blur(6px)" }} onClick={e => { if (e.target === ref.current) onClose(); }}>
      <div className={`w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${darkMode ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"}`} style={{ animation:"slideUp 0.22s ease both" }}>
        <div className={`flex items-center justify-between px-6 py-5 border-b ${darkMode ? "border-gray-800" : "border-gray-100"}`}>
          <h2 className={`text-base font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>{title}</h2>
          <button onClick={onClose} className={`w-8 h-8 rounded-full flex items-center justify-center ${darkMode ? "hover:bg-gray-800 text-gray-400" : "hover:bg-gray-100 text-gray-500"}`}><X className="w-4 h-4" /></button>
        </div>
        <div className="overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

// ─── Main Page (arrow function) ──────────────────────────────────────────────
const ProjectTrackerPage = () => {
  const darkMode    = useAppSelector((state: any) => state.Theme.darkMode);
  const params      = useParams();
  const projectId   = (params?.pid as string) ?? "default";
  const isLeader    = true;

  const proj = PROJECT_STORE[projectId] ?? PROJECT_STORE.default;

  const [members, setMembers] = useState<Member[]>(MEMBERS_STORE[projectId] ?? MEMBERS_STORE.default);
  const [tasks,   setTasks]   = useState<Task[]>(TASKS_STORE[projectId]     ?? TASKS_STORE.default);
  const [events,  setEvents]  = useState<CalEvent[]>(EVENTS_STORE[projectId] ?? EVENTS_STORE.default);
  const [activeTab, setActiveTab] = useState<"overview"|"tasks"|"team"|"calendar">("overview");
  const [modal, setModal]         = useState<null|{ type:"task"|"member"|"event"; item?: any }>(null);

  const [taskForm,   setTaskForm]   = useState<Partial<Task>>({});
  const [memberForm, setMemberForm] = useState<Partial<Member>>({});
  const [eventForm,  setEventForm]  = useState<Partial<CalEvent>>({});

  const openModal = (type: "task"|"member"|"event", item?: any) => {
    setModal({ type, item });
    if (type === "task")   setTaskForm(item   ?? { description:"", priority:"Low", assignedTo:0, dueDate:"", status:"Pending" });
    if (type === "member") setMemberForm(item ?? { name:"", role:"", email:"" });
    if (type === "event")  setEventForm(item  ?? { title:"", description:"", startDate:"", endDate:"", type:"Meeting" });
  };

  const submitModal = () => {
    if (modal?.type === "task") {
      if (modal.item) setTasks(t => t.map(x => x.id === modal.item.id ? { ...taskForm as Task, id: modal.item.id } : x));
      else setTasks(t => [...t, { ...taskForm as Task, id: Date.now() }]);
    }
    if (modal?.type === "member") {
      const avatar = (memberForm.name ?? "??").split(" ").map(n => n[0]).join("").toUpperCase();
      if (modal.item) setMembers(m => m.map(x => x.id === modal.item.id ? { ...memberForm as Member, id: modal.item.id, avatar } : x));
      else setMembers(m => [...m, { ...memberForm as Member, id: Date.now(), avatar }]);
    }
    if (modal?.type === "event") {
      if (modal.item) setEvents(e => e.map(x => x.id === modal.item.id ? { ...eventForm as CalEvent, id: modal.item.id } : x));
      else setEvents(e => [...e, { ...eventForm as CalEvent, id: Date.now() }]);
    }
    setModal(null);
  };

  const completedTasks = tasks.filter(t => t.status === "Completed").length;

  // ── Theme tokens ──────────────────────────────────────────────────────────
  const bg          = darkMode ? "bg-gray-900 text-white"         : "bg-white text-gray-800";
  const cardBg      = darkMode ? "bg-gray-800 border-gray-700/60" : "bg-white border-gray-200";
  const mutedText   = darkMode ? "text-gray-400"                  : "text-gray-500";
  const headingText = darkMode ? "text-white"                     : "text-gray-900";
  const divider     = darkMode ? "border-gray-700/60"             : "border-gray-100";
  const inputCls    = `w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all focus:ring-2 focus:ring-violet-500/30 ${darkMode ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-violet-500/60" : "bg-gray-50 border-gray-200 text-gray-900 focus:border-violet-400"}`;
  const labelCls    = `block text-xs font-semibold mb-1.5 ${darkMode ? "text-gray-300" : "text-gray-700"}`;
  const accentGradient = "from-violet-500 via-fuchsia-500 to-cyan-400";

  const tabs = [
    { id:"overview",  label:"Overview",  icon:<LayoutDashboard className="w-4 h-4" />          },
    { id:"tasks",     label:"Tasks",     icon:<ListTodo className="w-4 h-4" />,     badge: tasks.filter(t => t.status !== "Completed").length },
    { id:"team",      label:"Team",      icon:<UserCheck className="w-4 h-4" />,    badge: members.length },
    { id:"calendar",  label:"Calendar",  icon:<CalendarDays className="w-4 h-4" />, badge: events.length },
  ] as const;

  return (
    <div className={`min-h-screen ${bg} transition-colors duration-300 font-sans`}>

      {/* ── STICKY TOP NAV ── */}
      <div className={`sticky top-0 z-40 border-b ${divider} ${darkMode ? "bg-gray-900/90" : "bg-white/90"} backdrop-blur-md`}>
        <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between gap-4">
          <Link href="/team-workspace">
            <button className={`flex items-center gap-2 text-sm font-medium transition-all hover:scale-105 ${darkMode ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900"}`}>
              <ArrowLeft className="w-4 h-4" /> All Workspaces
            </button>
          </Link>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <span className={`text-xs font-medium ${darkMode ? "text-violet-400" : "text-violet-600"}`}>{proj.category}</span>
            <span className={`text-xs ${mutedText}`}>·</span>
            {proj.visibility === "private" ? <Lock className={`w-3.5 h-3.5 ${mutedText}`} /> : <Globe className={`w-3.5 h-3.5 ${mutedText}`} />}
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${proj.status === "In Progress" ? (darkMode ? "bg-blue-500/15 text-blue-400 border-blue-500/30" : "bg-blue-50 text-blue-600 border-blue-200") : (darkMode ? "bg-gray-500/15 text-gray-400 border-gray-500/30" : "bg-gray-50 text-gray-600 border-gray-200")}`}>{proj.status}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-7">

        {/* ── PROJECT HERO CARD (no animation) ── */}
        <div className={`rounded-2xl border overflow-hidden ${cardBg}`}>
          <div className="relative h-48 overflow-hidden">
            <img src={proj.image} alt={proj.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-5 flex items-end justify-between gap-4">
              <div>
                <h1 className="text-2xl font-extrabold text-white tracking-tight">{proj.name}</h1>
                <p className="text-sm text-white/70 mt-0.5 max-w-xl">{proj.description}</p>
              </div>
              <a href={proj.githubRepo} target="_blank" rel="noreferrer"
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/15 backdrop-blur-sm text-white text-xs font-semibold hover:bg-white/25 border border-white/20 transition-all shrink-0">
                <Github className="w-3.5 h-3.5" /> GitHub <ExternalLink className="w-2.5 h-2.5 opacity-60" />
              </a>
            </div>
          </div>
          {/* Progress strip */}
          <div className="px-5 py-3 flex items-center gap-4">
            <div className="flex-1">
              <div className={`h-1.5 rounded-full overflow-hidden ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>
                <div className={`h-full rounded-full bg-gradient-to-r ${accentGradient} transition-all duration-1000`} style={{ width: `${proj.progress}%` }} />
              </div>
            </div>
            <span className={`text-xs font-bold ${headingText} shrink-0`}>{proj.progress}% complete</span>
            <span className={`text-xs ${mutedText} shrink-0`}>{completedTasks}/{tasks.length} tasks</span>
            {/* Member preview */}
            <div className="flex -space-x-1.5 shrink-0">
              {members.slice(0, 5).map(m => (
                <div key={m.id} title={m.name} className={`w-6 h-6 rounded-lg bg-gradient-to-br ${avatarGradients[hashIdx(m.id)]} flex items-center justify-center text-[9px] font-bold text-white ring-1 ${darkMode ? "ring-gray-800" : "ring-white"}`}>{m.avatar.slice(0,1)}</div>
              ))}
              {members.length > 5 && <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[9px] font-bold ring-1 ${darkMode ? "bg-gray-700 text-gray-400 ring-gray-800" : "bg-gray-100 text-gray-500 ring-white"}`}>+{members.length - 5}</div>}
            </div>
          </div>
        </div>

        {/* ── TABS ── */}
        <div className={`flex items-center gap-0.5 p-1 rounded-2xl ${darkMode ? "bg-gray-800" : "bg-gray-100"} w-fit flex-wrap`}>
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${activeTab === tab.id ? `bg-gradient-to-r ${accentGradient} text-white shadow-md shadow-violet-500/20` : `${darkMode ? "text-gray-400 hover:text-gray-200" : "text-gray-500 hover:text-gray-700"}`}`}>
              {tab.icon}{tab.label}
              {"badge" in tab && tab.badge > 0 && (
                <span className={`min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold flex items-center justify-center ${activeTab === tab.id ? "bg-white/25 text-white" : darkMode ? "bg-gray-700 text-gray-400" : "bg-gray-200 text-gray-500"}`}>{tab.badge}</span>
              )}
            </button>
          ))}
        </div>

        {/* ═══════════ OVERVIEW ═══════════ */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Progress & timeline */}
            <div className={`rounded-2xl border p-6 ${cardBg}`}>
              <div className="flex items-center gap-2.5 mb-5">
                <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${accentGradient} flex items-center justify-center`}><TrendingUp className="w-4 h-4 text-white" /></div>
                <h3 className={`text-sm font-bold ${headingText}`}>Progress & Timeline</h3>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-5">
                {[{ label:"Done", value:completedTasks, color:"text-green-400",bg:darkMode?"bg-green-500/10 border-green-500/20":"bg-green-50 border-green-100"},{ label:"Active",value:tasks.filter(t=>t.status==="In Progress").length,color:"text-blue-400",bg:darkMode?"bg-blue-500/10 border-blue-500/20":"bg-blue-50 border-blue-100"},{ label:"Pending",value:tasks.filter(t=>t.status==="Pending").length,color:"text-amber-400",bg:darkMode?"bg-amber-500/10 border-amber-500/20":"bg-amber-50 border-amber-100"}].map(s => (
                  <div key={s.label} className={`text-center p-3 rounded-xl border ${s.bg}`}>
                    <div className={`text-2xl font-extrabold ${s.color}`}>{s.value}</div>
                    <div className={`text-[11px] mt-0.5 ${mutedText}`}>{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                {proj.timeline.map((s, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${s.status==="completed"?"bg-green-400":s.status==="current"?`bg-gradient-to-br from-violet-500 to-fuchsia-500 animate-pulse`:"bg-gray-500/30"}`} />
                    <div className="flex-1 flex items-center justify-between">
                      <span className={`text-sm ${s.status==="current"?"text-violet-400 font-semibold":s.status==="completed"?headingText:mutedText}`}>{s.stage}</span>
                      <span className={`text-[11px] ${mutedText}`}>{s.date}</span>
                    </div>
                    {s.status==="completed"&&<CheckCircle className="w-3.5 h-3.5 text-green-400 shrink-0" />}
                    {s.status==="current"  &&<ChevronRight className="w-3.5 h-3.5 text-violet-400 shrink-0" />}
                  </div>
                ))}
              </div>
            </div>
            {/* Latest commit */}
            <div className="space-y-5">
              <div className={`rounded-2xl border p-5 ${cardBg}`}>
                <div className="flex items-center gap-2.5 mb-4">
                  <div className={`w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center`}><GitCommit className="w-4 h-4 text-white" /></div>
                  <h3 className={`text-sm font-bold ${headingText}`}>Latest Commit</h3>
                </div>
                <div className={`rounded-xl p-4 border ${darkMode?"bg-gray-900/60 border-gray-700/40":"bg-gray-50 border-gray-100"}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`font-mono text-xs px-2 py-0.5 rounded-lg ${darkMode?"bg-gray-700 text-gray-300":"bg-gray-100 text-gray-600"}`}>{proj.lastCommit.hash}</span>
                    <span className={`text-[11px] ${mutedText}`}>{proj.lastCommit.timestamp}</span>
                  </div>
                  <p className={`text-sm font-medium mb-3 ${darkMode?"text-gray-200":"text-gray-800"}`}>{proj.lastCommit.message}</p>
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${avatarGradients[0]} flex items-center justify-center text-[10px] font-bold text-white`}>{proj.lastCommit.author[0]}</div>
                    <span className={`text-xs ${mutedText}`}>{proj.lastCommit.author}</span>
                  </div>
                </div>
              </div>
              {/* Upcoming events preview */}
              <div className={`rounded-2xl border p-5 ${cardBg}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-xl bg-gradient-to-br from-fuchsia-500 to-pink-500 flex items-center justify-center`}><CalendarDays className="w-4 h-4 text-white" /></div>
                    <h3 className={`text-sm font-bold ${headingText}`}>Upcoming Events</h3>
                  </div>
                  <button onClick={() => setActiveTab("calendar")} className={`text-xs font-medium ${darkMode?"text-violet-400 hover:text-violet-300":"text-violet-600 hover:text-violet-700"} transition-colors`}>View all →</button>
                </div>
                <div className="space-y-2.5">
                  {events.slice(0, 3).map(ev => (
                    <div key={ev.id} className={`flex items-center gap-3 p-3 rounded-xl border ${darkMode?"bg-gray-700/30 border-gray-700/40":"bg-gray-50 border-gray-100"}`}>
                      <EventChip t={ev.type} d={darkMode} />
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-semibold truncate ${headingText}`}>{ev.title}</p>
                        <p className={`text-[11px] ${mutedText} flex items-center gap-1`}><Clock className="w-2.5 h-2.5" />{new Date(ev.startDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════ TASKS ═══════════ */}
        {activeTab === "tasks" && (
          <div className={`rounded-2xl border overflow-hidden ${cardBg}`}>
            <div className={`flex items-center justify-between px-6 py-5 border-b ${divider}`}>
              <div>
                <h2 className={`text-sm font-bold ${headingText}`}>Tasks</h2>
                <p className={`text-xs mt-0.5 ${mutedText}`}>{completedTasks}/{tasks.length} completed</p>
              </div>
              {isLeader && (
                <button onClick={() => openModal("task")} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r ${accentGradient} text-white shadow-sm shadow-violet-500/20 hover:shadow-violet-500/40 hover:scale-105 transition-all`}>
                  <Plus className="w-3.5 h-3.5" /> Add Task
                </button>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className={`border-b ${divider}`}>
                  {["Task","Priority","Assignee","Status","Due",...(isLeader?["Actions"]:[])].map(h => <th key={h} className={`text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide ${mutedText}`}>{h}</th>)}
                  {/* </tr> */}
                </tr></thead>
                <tbody>
                  {tasks.map(task => {
                    const m = members.find(x => x.id === task.assignedTo);
                    return (
                      <tr key={task.id} className={`border-b ${divider} ${darkMode?"hover:bg-gray-700/20":"hover:bg-gray-50"} transition-colors`}>
                        <td className="px-5 py-3.5 max-w-xs"><p className={`text-sm font-medium ${headingText}`}>{task.description}</p></td>
                        <td className="px-5 py-3.5"><PriorityChip p={task.priority} d={darkMode} /></td>
                        <td className="px-5 py-3.5">
                          {m && <div className="flex items-center gap-2"><div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${avatarGradients[hashIdx(m.id)]} flex items-center justify-center text-[10px] font-bold text-white shrink-0`}>{m.avatar}</div><span className={`text-xs font-medium ${headingText}`}>{m.name}</span></div>}
                        </td>
                        <td className="px-5 py-3.5"><StatusChip s={task.status} d={darkMode} /></td>
                        <td className="px-5 py-3.5"><span className={`text-xs flex items-center gap-1 ${mutedText}`}><Clock className="w-3 h-3" />{task.dueDate}</span></td>
                        {isLeader && (
                          <td className="px-5 py-3.5">
                            <div className="flex gap-2">
                              <button onClick={() => openModal("task", task)} className={`p-1.5 rounded-lg ${darkMode?"text-amber-400 hover:bg-amber-500/10":"text-amber-500 hover:bg-amber-50"} transition-all hover:scale-110`}><Pencil className="w-3.5 h-3.5" /></button>
                              <button onClick={() => setTasks(t => t.filter(x => x.id !== task.id))} className={`p-1.5 rounded-lg ${darkMode?"text-red-400 hover:bg-red-500/10":"text-red-500 hover:bg-red-50"} transition-all hover:scale-110`}><Trash2 className="w-3.5 h-3.5" /></button>
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

        {/* ═══════════ TEAM ═══════════ */}
        {activeTab === "team" && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div><h2 className={`text-sm font-bold ${headingText}`}>Team Members</h2><p className={`text-xs mt-0.5 ${mutedText}`}>{members.length} members</p></div>
              {isLeader && (
                <button onClick={() => openModal("member")} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r ${accentGradient} text-white shadow-sm shadow-violet-500/20 hover:shadow-violet-500/40 hover:scale-105 transition-all`}>
                  <Plus className="w-3.5 h-3.5" /> Add Member
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {members.map((m, i) => {
                const mt = tasks.filter(t => t.assignedTo === m.id);
                const done = mt.filter(t => t.status === "Completed").length;
                return (
                  <div key={m.id} className={`group relative rounded-2xl border p-5 transition-all hover:-translate-y-0.5 hover:shadow-xl ${cardBg} ${darkMode?"hover:border-violet-500/40 hover:shadow-violet-500/5":"hover:border-violet-300 hover:shadow-violet-100"}`}>
                    <div className={`absolute inset-x-0 top-0 h-0.5 rounded-t-2xl bg-gradient-to-r ${accentGradient} opacity-0 group-hover:opacity-100 transition-opacity`} />
                    <div className="flex items-start gap-3 mb-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${avatarGradients[hashIdx(m.id)]} flex items-center justify-center font-bold text-white text-sm shrink-0`}>{m.avatar}</div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-bold truncate ${headingText}`}>{m.name}</p>
                        <p className={`text-[11px] font-medium mt-0.5 ${darkMode?"text-violet-400":"text-violet-600"}`}>{m.role}</p>
                        <p className={`text-[11px] truncate ${mutedText} flex items-center gap-1 mt-0.5`}><Mail className="w-3 h-3" />{m.email}</p>
                      </div>
                      {isLeader && (
                        <div className="flex gap-1 shrink-0">
                          <button onClick={() => openModal("member", m)} className={`p-1.5 rounded-lg ${darkMode?"text-amber-400 hover:bg-amber-500/10":"text-amber-500 hover:bg-amber-50"} transition-all`}><Pencil className="w-3 h-3" /></button>
                          {m.role !== "Project Lead" && <button onClick={() => setMembers(mm => mm.filter(x => x.id !== m.id))} className={`p-1.5 rounded-lg ${darkMode?"text-red-400 hover:bg-red-500/10":"text-red-500 hover:bg-red-50"} transition-all`}><Trash2 className="w-3 h-3" /></button>}
                        </div>
                      )}
                    </div>
                    <div className={`pt-3 border-t ${divider}`}>
                      <div className="flex justify-between mb-1.5">
                        <span className={`text-[11px] ${mutedText}`}>{done}/{mt.length} tasks</span>
                        <span className={`text-[11px] font-semibold ${headingText}`}>{mt.length > 0 ? Math.round(done / mt.length * 100) : 0}%</span>
                      </div>
                      <div className={`h-1.5 rounded-full overflow-hidden ${darkMode?"bg-gray-700":"bg-gray-100"}`}>
                        <div className={`h-full rounded-full bg-gradient-to-r ${accentGradient} transition-all duration-700`} style={{ width: `${mt.length > 0 ? Math.round(done / mt.length * 100) : 0}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ═══════════ CALENDAR ═══════════ */}
        {activeTab === "calendar" && (
          <div className={`rounded-2xl border overflow-hidden ${cardBg}`}>
            <div className={`flex items-center justify-between px-6 py-5 border-b ${divider}`}>
              <div><h2 className={`text-sm font-bold ${headingText}`}>Calendar Events</h2><p className={`text-xs mt-0.5 ${mutedText}`}>{events.length} scheduled</p></div>
              {isLeader && (
                <button onClick={() => openModal("event")} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r ${accentGradient} text-white shadow-sm shadow-violet-500/20 hover:shadow-violet-500/40 hover:scale-105 transition-all`}>
                  <Plus className="w-3.5 h-3.5" /> Add Event
                </button>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className={`border-b ${divider}`}>
                  {["Event","Description","Type","Start","End",...(isLeader?["Actions"]:[])].map(h => <th key={h} className={`text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide ${mutedText}`}>{h}</th>)}
                </tr></thead>
                <tbody>
                  {events.map(ev => (
                    <tr key={ev.id} className={`border-b ${divider} ${darkMode?"hover:bg-gray-700/20":"hover:bg-gray-50"} transition-colors`}>
                      <td className="px-5 py-3.5"><p className={`text-sm font-semibold ${headingText}`}>{ev.title}</p></td>
                      <td className="px-5 py-3.5"><p className={`text-xs max-w-40 ${mutedText}`}>{ev.description}</p></td>
                      <td className="px-5 py-3.5"><EventChip t={ev.type} d={darkMode} /></td>
                      <td className="px-5 py-3.5"><span className={`text-xs ${mutedText}`}>{new Date(ev.startDate).toLocaleString()}</span></td>
                      <td className="px-5 py-3.5"><span className={`text-xs ${mutedText}`}>{new Date(ev.endDate).toLocaleString()}</span></td>
                      {isLeader && (
                        <td className="px-5 py-3.5">
                          <div className="flex gap-2">
                            <button onClick={() => openModal("event", ev)} className={`p-1.5 rounded-lg ${darkMode?"text-amber-400 hover:bg-amber-500/10":"text-amber-500 hover:bg-amber-50"} transition-all hover:scale-110`}><Pencil className="w-3.5 h-3.5" /></button>
                            <button onClick={() => setEvents(e => e.filter(x => x.id !== ev.id))} className={`p-1.5 rounded-lg ${darkMode?"text-red-400 hover:bg-red-500/10":"text-red-500 hover:bg-red-50"} transition-all hover:scale-110`}><Trash2 className="w-3.5 h-3.5" /></button>
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

      {/* ── MODALS ── */}
      {modal && (
        <Modal darkMode={darkMode}
          title={modal.type === "task" ? (modal.item ? "Edit task" : "Add task") : modal.type === "member" ? (modal.item ? "Edit member" : "Add member") : (modal.item ? "Edit event" : "Add event")}
          onClose={() => setModal(null)}>
          <form onSubmit={e => { e.preventDefault(); submitModal(); }} className="p-6 space-y-4">
            {/* Task */}
            {modal.type === "task" && (<>
              <div><label className={labelCls}>Description <span className="text-red-400">*</span></label><textarea rows={3} className={`${inputCls} resize-none`} value={taskForm.description ?? ""} onChange={e => setTaskForm(f => ({ ...f, description: e.target.value }))} required /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className={labelCls}>Priority</label><div className="relative"><select className={`${inputCls} pr-8 appearance-none`} value={taskForm.priority} onChange={e => setTaskForm(f => ({ ...f, priority: e.target.value as any }))}>{["Low","Medium","High"].map(v=><option key={v}>{v}</option>)}</select><ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-gray-400" /></div></div>
                <div><label className={labelCls}>Status</label><div className="relative"><select className={`${inputCls} pr-8 appearance-none`} value={taskForm.status} onChange={e => setTaskForm(f => ({ ...f, status: e.target.value as any }))}>{["Pending","In Progress","Completed"].map(v=><option key={v}>{v}</option>)}</select><ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-gray-400" /></div></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className={labelCls}>Assign to</label><div className="relative"><select className={`${inputCls} pr-8 appearance-none`} value={taskForm.assignedTo} onChange={e => setTaskForm(f => ({ ...f, assignedTo: parseInt(e.target.value) }))} required><option value="">Select member</option>{members.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}</select><ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-gray-400" /></div></div>
                <div><label className={labelCls}>Due date</label><input type="date" className={inputCls} value={taskForm.dueDate ?? ""} onChange={e => setTaskForm(f => ({ ...f, dueDate: e.target.value }))} /></div>
              </div>
            </>)}
            {/* Member */}
            {modal.type === "member" && (<>
              <div><label className={labelCls}>Full name <span className="text-red-400">*</span></label><input className={inputCls} value={memberForm.name ?? ""} onChange={e => setMemberForm(f => ({ ...f, name: e.target.value }))} required /></div>
              <div><label className={labelCls}>Role <span className="text-red-400">*</span></label><input className={inputCls} placeholder="e.g. Frontend Developer" value={memberForm.role ?? ""} onChange={e => setMemberForm(f => ({ ...f, role: e.target.value }))} required /></div>
              <div><label className={labelCls}>Email <span className="text-red-400">*</span></label><input type="email" className={inputCls} value={memberForm.email ?? ""} onChange={e => setMemberForm(f => ({ ...f, email: e.target.value }))} required /></div>
            </>)}
            {/* Event */}
            {modal.type === "event" && (<>
              <div><label className={labelCls}>Title <span className="text-red-400">*</span></label><input className={inputCls} value={eventForm.title ?? ""} onChange={e => setEventForm(f => ({ ...f, title: e.target.value }))} required /></div>
              <div><label className={labelCls}>Description</label><textarea rows={2} className={`${inputCls} resize-none`} value={eventForm.description ?? ""} onChange={e => setEventForm(f => ({ ...f, description: e.target.value }))} /></div>
              <div><label className={labelCls}>Type</label><div className="relative"><select className={`${inputCls} pr-8 appearance-none`} value={eventForm.type} onChange={e => setEventForm(f => ({ ...f, type: e.target.value as any }))}>{["Meeting","Deadline","Milestone","Other"].map(v=><option key={v}>{v}</option>)}</select><ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-gray-400" /></div></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className={labelCls}>Start <span className="text-red-400">*</span></label><input type="datetime-local" className={inputCls} value={eventForm.startDate ?? ""} onChange={e => setEventForm(f => ({ ...f, startDate: e.target.value }))} required /></div>
                <div><label className={labelCls}>End <span className="text-red-400">*</span></label><input type="datetime-local" className={inputCls} value={eventForm.endDate ?? ""} onChange={e => setEventForm(f => ({ ...f, endDate: e.target.value }))} required /></div>
              </div>
            </>)}
            <div className={`flex gap-3 pt-2 border-t ${darkMode ? "border-gray-800" : "border-gray-100"}`}>
              <button type="button" onClick={() => setModal(null)} className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all ${darkMode ? "border-gray-700 text-gray-400 hover:bg-gray-800" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}>Cancel</button>
              <button type="submit" className={`flex-1 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r ${accentGradient} text-white shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40 hover:scale-[1.02] transition-all`}>{modal.item ? "Save changes" : "Add"}</button>
            </div>
          </form>
        </Modal>
      )}

      <style>{`
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default ProjectTrackerPage;