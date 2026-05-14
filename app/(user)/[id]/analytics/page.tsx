"use client";

import React, { useMemo, useRef, useEffect, useState } from "react";
import { useAppSelector } from "@/redux/hooks";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area,
} from "recharts";
import {
  Activity, Award, Briefcase, Clock, Code, GitBranch,
  Heart, MessageCircle, Share2, Star, Target, TrendingUp,
  Users, Zap, Sparkles, GitCommit, Eye, ArrowUp, Flame,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Stats {
  totalActivities: number; totalChallenges: number; totalPoints: number;
  activeWorkspaces: number; totalConnections: number;
  activityTimeline: { day: string; activities: number; prev: number }[];
  challengeByType: { type: string; count: number }[];
  workspaceTasks: { name: string; value: number; color: string }[];
  engagementData: { name: string; value: number; change: number; icon: React.ElementType }[];
  skillsProgress: { skill: string; value: number; color: string }[];
  recentAchievements: { id: string; title: string; date: string; icon: React.ElementType; color: string }[];
  projectContributions: { project: string; commits: number; lines: number; pct: number }[];
  topCollaborators: { name: string; username: string; contributions: number; avatar: string; gradient: string }[];
  weeklyProgress: number;
  monthlyPoints: { month: string; points: number }[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function useInView(t = 0.08) {
  const ref = useRef<HTMLDivElement>(null);
  const [v, setV] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setV(true); o.disconnect(); } }, { threshold: t });
    o.observe(el); return () => o.disconnect();
  }, [t]);
  return { ref, inView: v };
}

// Animated number counter
function AnimatedNumber({ to, prefix = "", suffix = "" }: { to: number; prefix?: string; suffix?: string }) {
  const [val, setVal] = useState(0);
  const { ref, inView } = useInView(0.2);
  useEffect(() => {
    if (!inView) return;
    let start = 0; const step = to / 40;
    const id = setInterval(() => { start += step; if (start >= to) { setVal(to); clearInterval(id); } else setVal(Math.floor(start)); }, 20);
    return () => clearInterval(id);
  }, [inView, to]);
  return <span ref={ref}>{prefix}{val.toLocaleString()}{suffix}</span>;
}

export default function AnalyticsPage() {
  const darkMode = useAppSelector((state: any) => state.Theme.darkMode);
  const [mounted, setMounted] = useState(false);
  const heroSection = useInView();
  useEffect(() => { setMounted(true); }, []);

  const stats: Stats = useMemo(() => ({
    totalActivities: 42, totalChallenges: 18, totalPoints: 1250,
    activeWorkspaces: 3, totalConnections: 86,
    activityTimeline: [
      { day: "Mon", activities: 2,  prev: 1 },
      { day: "Tue", activities: 4,  prev: 3 },
      { day: "Wed", activities: 3,  prev: 5 },
      { day: "Thu", activities: 5,  prev: 2 },
      { day: "Fri", activities: 7,  prev: 4 },
      { day: "Sat", activities: 4,  prev: 6 },
      { day: "Sun", activities: 6,  prev: 2 },
    ],
    challengeByType: [
      { type: "Coding",   count: 8 },
      { type: "MCQ",      count: 5 },
      { type: "Aptitude", count: 3 },
      { type: "Puzzle",   count: 2 },
    ],
    workspaceTasks: [
      { name: "Completed",  value: 12, color: "#34d399" },
      { name: "In Progress", value: 8,  color: "#a78bfa" },
      { name: "Pending",    value: 5,  color: "#f87171" },
    ],
    engagementData: [
      { name: "Likes",    value: 142, change: 12, icon: Heart          },
      { name: "Comments", value: 37,  change:  8, icon: MessageCircle  },
      { name: "Shares",   value: 28,  change:  5, icon: Share2         },
      { name: "Views",    value: 890, change: 23, icon: Eye            },
    ],
    skillsProgress: [
      { skill: "React",      value: 90, color: "#818cf8" },
      { skill: "JavaScript", value: 85, color: "#38bdf8" },
      { skill: "Node.js",    value: 75, color: "#34d399" },
      { skill: "Python",     value: 60, color: "#fbbf24" },
      { skill: "CSS",        value: 80, color: "#e879f9" },
      { skill: "MongoDB",    value: 70, color: "#f87171" },
    ],
    recentAchievements: [
      { id:"a1", title:"Completed 5 Coding Challenges", date:"2 days ago", icon: Code,     color:"from-violet-500 to-fuchsia-500" },
      { id:"a2", title:"Earned 'Problem Solver' Badge",  date:"5 days ago", icon: Award,    color:"from-amber-500 to-orange-500"   },
      { id:"a3", title:"Joined AI Project Workspace",    date:"1 week ago", icon: Briefcase,color:"from-cyan-500 to-blue-500"      },
      { id:"a4", title:"Reached 1,000 Points Milestone", date:"1 week ago", icon: Star,     color:"from-fuchsia-500 to-pink-500"   },
    ],
    projectContributions: [
      { project: "E-Commerce Platform", commits: 24, lines: 1200, pct: 80 },
      { project: "Portfolio Website",   commits: 12, lines:  800, pct: 55 },
      { project: "Open Source Lib",     commits:  8, lines:  450, pct: 35 },
    ],
    topCollaborators: [
      { name:"Sarah Chen",  username:"@sarahc", contributions:15, avatar:"SC", gradient:"from-violet-500 to-fuchsia-500" },
      { name:"Mike Johnson",username:"@mikej",  contributions:12, avatar:"MJ", gradient:"from-cyan-500 to-blue-500"      },
      { name:"Priya Patel", username:"@priyap", contributions:10, avatar:"PP", gradient:"from-fuchsia-500 to-pink-500"   },
    ],
    weeklyProgress: 68,
    monthlyPoints: [
      { month:"Oct", points: 320 }, { month:"Nov", points: 480 },
      { month:"Dec", points: 390 }, { month:"Jan", points: 610 },
      { month:"Feb", points: 720 }, { month:"Mar", points: 850 },
      { month:"Apr", points: 1250 },
    ],
  }), []);

  // ── Theme tokens ──────────────────────────────────────────────────────────
  const bg          = darkMode ? "bg-gray-900 text-white"         : "bg-white text-gray-800";
  const cardBg      = darkMode ? "bg-gray-800 border-gray-700/60" : "bg-white border-gray-200";
  const surfaceBg   = darkMode ? "bg-gray-700/40"                 : "bg-gray-50";
  const mutedText   = darkMode ? "text-gray-400"                  : "text-gray-500";
  const headingText = darkMode ? "text-white"                     : "text-gray-900";
  const divider     = darkMode ? "border-gray-700/60"             : "border-gray-100";
  const gridStroke  = darkMode ? "#374151" : "#e5e7eb";
  const axisStroke  = darkMode ? "#6b7280" : "#9ca3af";
  const accentGradient = "from-violet-500 via-fuchsia-500 to-cyan-400";
  const accentText     = "bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent";

  const tooltipStyle = {
    backgroundColor: darkMode ? "#111827" : "#fff",
    borderColor: darkMode ? "#374151" : "#e5e7eb",
    color: darkMode ? "#f9fafb" : "#111827",
    borderRadius: "12px", padding: "10px 14px", fontSize: "12px",
    boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
  };

  // ── Stat tile data ────────────────────────────────────────────────────────
  const overviewStats = [
    { label:"Activities",   value: stats.totalActivities,  icon: Activity,  trend:"+12%", positive:true,  from:"from-violet-500", to:"to-fuchsia-500" },
    { label:"Challenges",   value: stats.totalChallenges,  icon: Target,    trend:"+2",   positive:true,  from:"from-cyan-500",   to:"to-blue-500"    },
    { label:"Total Points", value: stats.totalPoints,      icon: Award,     trend:"Top 10%",positive:true,from:"from-fuchsia-500",to:"to-pink-500"    },
    { label:"Workspaces",   value: stats.activeWorkspaces, icon: Briefcase, trend:"2 active",positive:true,from:"from-amber-500",  to:"to-orange-500"  },
    { label:"Connections",  value: stats.totalConnections, icon: Users,     trend:"+5",   positive:true,  from:"from-green-500",  to:"to-emerald-500" },
  ];

  // ── Section wrapper (reveals on scroll) ──────────────────────────────────
  function Section({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    const { ref, inView } = useInView();
    return (
      <div ref={ref} className={className}
        style={{ opacity: inView?1:0, transform: inView?"none":"translateY(24px)", transition:"opacity .6s ease, transform .6s ease" }}>
        {children}
      </div>
    );
  }

  // ── Reusable card ─────────────────────────────────────────────────────────
  function AnalyticsCard({ title, icon: Icon, iconColor = "text-violet-400", children, className = "" }: {
    title: string; icon: React.ElementType; iconColor?: string; children: React.ReactNode; className?: string;
  }) {
    return (
      <div className={`group relative rounded-2xl border transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl ${cardBg} ${darkMode?"hover:border-violet-500/40 hover:shadow-violet-500/5":"hover:border-violet-300 hover:shadow-violet-100"} ${className}`}>
        <div className={`absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r ${accentGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-2xl`} />
        <div className="p-5">
          <div className="flex items-center gap-2.5 mb-5">
            <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${accentGradient} flex items-center justify-center shrink-0`}>
              <Icon className="w-4 h-4 text-white" />
            </div>
            <h3 className={`text-sm font-bold ${headingText}`}>{title}</h3>
          </div>
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bg} transition-colors duration-300 font-sans`}>

      {/* ── HERO ── */}
      <section className={`relative overflow-hidden border-b ${divider}`}>
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage:`linear-gradient(${darkMode?"#fff":"#000"} 1px,transparent 1px),linear-gradient(90deg,${darkMode?"#fff":"#000"} 1px,transparent 1px)`, backgroundSize:"50px 50px" }} />
        <div className="absolute top-0 right-1/4 w-80 h-48 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-40 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div ref={heroSection.ref} className="relative max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8"
            style={{ opacity: heroSection.inView?1:0, transform: heroSection.inView?"none":"translateY(16px)", transition:"opacity .6s ease,transform .6s ease" }}>
            <div>
              <div className={`inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full border text-xs font-medium ${darkMode?"bg-violet-500/10 border-violet-500/30 text-violet-300":"bg-violet-50 border-violet-200 text-violet-600"}`}>
                <Sparkles className="w-3.5 h-3.5" /> Performance insights · Live
              </div>
              <h1 className={`text-4xl md:text-5xl font-extrabold tracking-tight leading-tight ${headingText}`}>
                Analytics <span className={accentText}>Dashboard</span>
              </h1>
              <p className={`text-base mt-2 ${mutedText}`}>Track your performance, engagement, and growth across the platform.</p>
            </div>

            {/* Top-level stats */}
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 shrink-0">
              {overviewStats.map((s, i) => (
                <div key={s.label} className={`text-center px-4 py-3.5 rounded-2xl border ${cardBg}`}
                  style={{ opacity: heroSection.inView?1:0, transform: heroSection.inView?"none":"translateY(16px)", transition:`opacity .5s ease ${i*.07+.2}s,transform .5s ease ${i*.07+.2}s` }}>
                  <div className={`text-2xl font-extrabold tracking-tight bg-gradient-to-br ${s.from} ${s.to} bg-clip-text text-transparent`}>
                    <AnimatedNumber to={s.value} />
                  </div>
                  <div className={`text-[10px] mt-0.5 ${mutedText}`}>{s.label}</div>
                  <div className="flex items-center justify-center gap-0.5 mt-0.5 text-[10px] text-green-400">
                    <ArrowUp className="w-2.5 h-2.5" />{s.trend}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">

        {/* ── ACTIVITY TIMELINE (Area chart) ── */}
        <Section>
          <AnalyticsCard title="Activity Timeline — Last 7 Days" icon={Activity}>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={stats.activityTimeline} margin={{ top:5, right:20, left:0, bottom:5 }}>
                <defs>
                  <linearGradient id="gradCurr" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradPrev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#06b6d4" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis dataKey="day" stroke={axisStroke} tick={{ fontSize:12 }} />
                <YAxis stroke={axisStroke} tick={{ fontSize:12 }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize:"12px", color: darkMode?"#9ca3af":"#6b7280" }} />
                <Area type="monotone" dataKey="activities" name="This week" stroke="#8b5cf6" strokeWidth={2.5} fill="url(#gradCurr)" dot={{ r:4, fill:"#8b5cf6" }} activeDot={{ r:6 }} />
                <Area type="monotone" dataKey="prev" name="Last week" stroke="#06b6d4" strokeWidth={1.5} fill="url(#gradPrev)" dot={{ r:3, fill:"#06b6d4" }} strokeDasharray="4 3" />
              </AreaChart>
            </ResponsiveContainer>
          </AnalyticsCard>
        </Section>

        {/* ── MONTHLY POINTS + CHALLENGES ── */}
        <Section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly points line */}
          <AnalyticsCard title="Points Growth (Last 7 Months)" icon={TrendingUp}>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={stats.monthlyPoints} margin={{ top:5, right:20, left:0, bottom:5 }}>
                <defs>
                  <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%"   stopColor="#8b5cf6" />
                    <stop offset="50%"  stopColor="#d946ef" />
                    <stop offset="100%" stopColor="#22d3ee" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis dataKey="month" stroke={axisStroke} tick={{ fontSize:12 }} />
                <YAxis stroke={axisStroke} tick={{ fontSize:12 }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="points" name="Points" stroke="url(#lineGrad)" strokeWidth={3} dot={{ r:5, fill:"#8b5cf6", stroke:"#fff", strokeWidth:2 }} activeDot={{ r:7 }} />
              </LineChart>
            </ResponsiveContainer>
          </AnalyticsCard>

          {/* Challenges bar */}
          <AnalyticsCard title="Challenges by Type" icon={Target}>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={stats.challengeByType} margin={{ top:5, right:20, left:0, bottom:5 }}>
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#22d3ee" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis dataKey="type" stroke={axisStroke} tick={{ fontSize:12 }} />
                <YAxis stroke={axisStroke} tick={{ fontSize:12 }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="count" name="Challenges" fill="url(#barGrad)" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </AnalyticsCard>
        </Section>

        {/* ── PIE + SKILLS PROGRESS ── */}
        <Section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Donut */}
          <AnalyticsCard title="Workspace Task Status" icon={Briefcase}>
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="55%" height={220}>
                <PieChart>
                  <Pie data={stats.workspaceTasks} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value">
                    {stats.workspaceTasks.map((e, i) => <Cell key={i} fill={e.color} strokeWidth={0} />)}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-3">
                {stats.workspaceTasks.map((t, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ background: t.color }} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-medium ${headingText}`}>{t.name}</span>
                        <span className={`text-xs font-bold ${headingText}`}>{t.value}</span>
                      </div>
                      <div className={`h-1.5 rounded-full mt-1 overflow-hidden ${darkMode?"bg-gray-700":"bg-gray-100"}`}>
                        <div className="h-full rounded-full transition-all duration-700" style={{ width:`${Math.round(t.value / stats.workspaceTasks.reduce((a,b)=>a+b.value,0)*100)}%`, background: t.color }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </AnalyticsCard>

          {/* Skills progress bars */}
          <AnalyticsCard title="Skills Proficiency" icon={Code}>
            <div className="space-y-3.5">
              {stats.skillsProgress.map((s, i) => (
                <div key={s.skill}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-xs font-semibold ${headingText}`}>{s.skill}</span>
                    <span className={`text-xs font-bold ${headingText}`}>{s.value}%</span>
                  </div>
                  <div className={`h-2 rounded-full overflow-hidden ${darkMode?"bg-gray-700":"bg-gray-100"}`}>
                    <div className="h-full rounded-full transition-all duration-1000" style={{ width:`${s.value}%`, background: s.color, transitionDelay:`${i*80}ms` }} />
                  </div>
                </div>
              ))}
            </div>
          </AnalyticsCard>
        </Section>

        {/* ── ENGAGEMENT + CONTRIBUTIONS + COLLABORATORS ── */}
        <Section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Engagement */}
          <AnalyticsCard title="Engagement Received" icon={Heart}>
            <div className="space-y-3">
              {stats.engagementData.map((item, i) => {
                const Icon = item.icon;
                const colors = ["text-rose-400","text-violet-400","text-cyan-400","text-fuchsia-400"];
                const bgs    = [darkMode?"bg-rose-500/10":"bg-rose-50", darkMode?"bg-violet-500/10":"bg-violet-50", darkMode?"bg-cyan-500/10":"bg-cyan-50", darkMode?"bg-fuchsia-500/10":"bg-fuchsia-50"];
                return (
                  <div key={i} className={`flex items-center justify-between p-3 rounded-xl border ${darkMode?"bg-gray-700/30 border-gray-700/40":"bg-gray-50 border-gray-100"} transition-all hover:scale-[1.01]`}>
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${bgs[i]}`}>
                        <Icon className={`w-4 h-4 ${colors[i]}`} />
                      </div>
                      <span className={`text-xs font-medium ${headingText}`}>{item.name}</span>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-extrabold ${headingText}`}>{item.value.toLocaleString()}</div>
                      <div className="flex items-center gap-0.5 text-[10px] text-green-400 justify-end">
                        <ArrowUp className="w-2.5 h-2.5" />+{item.change}%
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </AnalyticsCard>

          {/* Contributions */}
          <AnalyticsCard title="Project Contributions" icon={GitBranch}>
            <div className="space-y-4">
              {stats.projectContributions.map((p, i) => (
                <div key={i} className={`p-3 rounded-xl border ${darkMode?"bg-gray-700/30 border-gray-700/40":"bg-gray-50 border-gray-100"}`}>
                  <div className="flex items-center justify-between mb-2">
                    <p className={`text-xs font-semibold truncate ${headingText}`}>{p.project}</p>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${darkMode?"bg-cyan-500/15 text-cyan-400 border border-cyan-500/30":"bg-cyan-50 text-cyan-600 border border-cyan-200"}`}>{p.commits} commits</span>
                  </div>
                  <div className={`h-1.5 rounded-full overflow-hidden mb-1.5 ${darkMode?"bg-gray-700":"bg-gray-100"}`}>
                    <div className={`h-full rounded-full bg-gradient-to-r from-cyan-500 to-violet-500 transition-all duration-700`} style={{ width:`${p.pct}%` }} />
                  </div>
                  <p className={`text-[11px] ${mutedText}`}>{p.lines.toLocaleString()} lines changed</p>
                </div>
              ))}
            </div>
          </AnalyticsCard>

          {/* Collaborators */}
          <AnalyticsCard title="Top Collaborators" icon={Users}>
            <div className="space-y-3">
              {stats.topCollaborators.map((u, i) => (
                <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border transition-all hover:scale-[1.01] ${darkMode?"bg-gray-700/30 border-gray-700/40 hover:border-violet-500/30":"bg-gray-50 border-gray-100 hover:border-violet-200"}`}>
                  <div className="relative shrink-0">
                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${u.gradient} flex items-center justify-center text-xs font-bold text-white`}>{u.avatar}</div>
                    {i === 0 && <span className="absolute -top-1 -right-1 text-base">👑</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-semibold truncate ${headingText}`}>{u.name}</p>
                    <p className={`text-[11px] ${mutedText}`}>{u.username}</p>
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded-xl ${darkMode?"bg-violet-500/15 text-violet-400 border border-violet-500/30":"bg-violet-50 text-violet-600 border border-violet-200"}`}>{u.contributions}</span>
                </div>
              ))}
            </div>
          </AnalyticsCard>
        </Section>

        {/* ── WEEKLY PROGRESS + ACHIEVEMENTS ── */}
        <Section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Weekly progress */}
          <AnalyticsCard title="Weekly Goal Progress" icon={Clock}>
            <div className="flex items-end justify-between mb-4 gap-3">
              <div>
                <div className={`text-5xl font-extrabold tracking-tight ${accentText}`}>{stats.weeklyProgress}%</div>
                <p className={`text-xs mt-1 ${mutedText}`}>of this week's target reached</p>
              </div>
              <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold ${darkMode?"bg-orange-500/10 text-orange-400 border border-orange-500/20":"bg-orange-50 text-orange-600 border border-orange-200"}`}>
                <Flame className="w-4 h-4" /> 5-day streak
              </div>
            </div>
            {/* Big progress bar */}
            <div className={`h-5 rounded-full overflow-hidden ${darkMode?"bg-gray-700":"bg-gray-100"} relative`}>
              <div className={`h-full rounded-full bg-gradient-to-r ${accentGradient} transition-all duration-1000 relative`} style={{ width:`${stats.weeklyProgress}%` }}>
                <div className="absolute inset-0 bg-white/10 animate-pulse rounded-full" />
              </div>
            </div>
            <div className={`flex items-center justify-between mt-2 text-[11px] ${mutedText}`}>
              <span>0%</span><span className="text-violet-400 font-semibold">{stats.weeklyProgress}% done</span><span>100%</span>
            </div>
            {/* Mini stat row */}
            <div className={`grid grid-cols-3 gap-3 mt-5 pt-4 border-t ${divider}`}>
              {[
                { label:"Challenges", value:"7/10", color:"text-violet-400" },
                { label:"Posts",      value:"3/5",  color:"text-cyan-400"   },
                { label:"Reviews",    value:"2/3",  color:"text-fuchsia-400"},
              ].map(s => (
                <div key={s.label} className="text-center">
                  <div className={`text-base font-extrabold ${s.color}`}>{s.value}</div>
                  <div className={`text-[10px] ${mutedText}`}>{s.label}</div>
                </div>
              ))}
            </div>
          </AnalyticsCard>

          {/* Achievements */}
          <AnalyticsCard title="Recent Achievements" icon={Award}>
            <div className="space-y-3">
              {stats.recentAchievements.map((ach, i) => {
                const Icon = ach.icon;
                return (
                  <div key={ach.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-all hover:-translate-y-0.5 hover:shadow-md ${darkMode?"bg-gray-700/30 border-gray-700/40 hover:border-amber-500/30":"bg-gray-50 border-gray-100 hover:border-amber-200"}`}
                    style={{ opacity:1, animation:`fadeUp .4s ease ${i*.08}s both` }}>
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${ach.color} flex items-center justify-center text-white shrink-0 shadow-sm`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className={`text-xs font-semibold ${headingText}`}>{ach.title}</p>
                      <p className={`text-[11px] mt-0.5 ${mutedText}`}>{ach.date}</p>
                    </div>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${darkMode?"bg-green-500/15 text-green-400":"bg-green-50 text-green-500"}`}>
                      <Zap className="w-3 h-3" />
                    </div>
                  </div>
                );
              })}
            </div>
          </AnalyticsCard>
        </Section>

        {/* ── FOOTER ── */}
        <div className="text-center pt-2 pb-6">
          <p className={`text-xs ${mutedText}`}>Last updated: just now · Data refreshes every hour · All times in your local timezone</p>
        </div>
      </div>

      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
      `}</style>
    </div>
  );
}