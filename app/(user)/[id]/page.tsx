"use client";

import React, { useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import { useAppSelector } from "@/redux/hooks";
import { toast } from "sonner";
import {
  Pencil, MapPin, Globe, Linkedin, Github, Mail, Phone,
  Users, FolderOpen, Loader2, CheckCircle, UserPlus,
  X, Copy, Check, ExternalLink, MessageCircle,
  Briefcase, GraduationCap, Code2, Trophy, Award,
  Layers, BookOpen, Hash, GitBranch,
} from "lucide-react";
import { ISkills, IUser } from "@/types/User";


// ─── Mock ─────────────────────────────────────────────────────────────────────
const DUMMY_USER: IUser = {
  _id: "dummy123", username: "Alex Johnson",
  email: "alex.johnson@example.com", password: "",
  about: "Passionate frontend developer with 5+ years of experience building responsive web applications. Love working with React and modern JavaScript. Currently exploring AI-powered tooling and edge computing.",
  title: "Senior Frontend Developer",
   portfolio: "alexjohnson.dev",
  connectedUsers: [{_id:"c1"},{_id:"c2"},{_id:"c3"},{_id:"c4"},{_id:"c5"}],
  totalPendingRequests: [], totalPoints: 1250,
  challengesAttended: ["ch1","ch2","ch3","ch4","ch5","ch6"],
  createdAt: new Date("2024-01-10"), updatedAt: new Date("2025-04-01"),
  socialLinks: ["https://linkedin.com/in/alexjohnson","https://github.com/alexjohnson"],
  skills: {
    frontend:   ["React","Next.js","TypeScript","Tailwind CSS","Framer Motion"],
    backend:    ["Node.js","Express","GraphQL","REST API"],
    frameworks: ["Next.js","Redux","React Query","Prisma"],
    libraries:  ["Recharts","Zod","date-fns","Lucide"],
    tools:      ["Git","Docker","Figma","VS Code","Postman"],
    languages:  ["TypeScript","JavaScript","Python","SQL"],
  },
  education: [
    { schoolName:"UC Berkeley", degree:"B.S. Computer Science", duration:"2015 – 2019", description:"Specialized in HCI and distributed systems. Dean's List all 4 years." },
    { schoolName:"Meta / Coursera", degree:"Front-End Developer Professional Certificate", duration:"2021", description:"Advanced React patterns, performance optimization, and accessibility." },
  ],
  workExperience: [
    { companyName:"Stripe", role:"Senior Frontend Engineer", duration:"2022 – Present", location:"San Francisco, CA", description:"Building the dashboard UI. Led a team of 4 to redesign the billing portal, reducing drop-off by 22%." },
    { companyName:"Airbnb", role:"Frontend Engineer", duration:"2020 – 2022", location:"Remote", description:"Worked on the listing creation flow and host dashboard. Contributed to a design system used by 300+ engineers." },
    { companyName:"Freelance", role:"React Developer", duration:"2019 – 2020", location:"Remote", description:"Shipped 8+ client projects — storefronts, SaaS dashboards, and marketing sites." },
  ],
  projects: [
    { title:"AI Code Assistant", description:"Intelligent code completion using fine-tuned LLMs. Real-time suggestions, contextual completions, and smart refactoring.", techStack:["Python","TypeScript","FastAPI","React"], role:"Project Lead", duration:"Jan 2025 – Present", githubLink:"https://github.com/alexj/ai-code-assistant", liveLink:"https://ai-code.alexjohnson.dev", file:"https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&q=80" },
    { title:"react-hot-key", description:"Open-source keyboard shortcut library for React. Zero deps, full TypeScript support.", techStack:["TypeScript","React","Rollup","Jest"], role:"Author", duration:"Nov 2024", githubLink:"https://github.com/alexj/react-hot-key" },
    { title:"DevConnect Clone", description:"Full-stack developer community platform with real-time chat, project matching, and coding challenges.", techStack:["Next.js","MongoDB","Socket.io","Tailwind"], role:"Full-Stack Dev", duration:"2024", githubLink:"https://github.com/alexj/devconnect" },
  ],
};

// ─── Skill category config ────────────────────────────────────────────────────
const SKILL_CFG: Record<keyof ISkills, { label: string; gradient: string; dark: string; light: string; icon: React.ReactNode }> = {
  frontend:   { label:"Frontend",   gradient:"from-violet-500 to-fuchsia-500", dark:"bg-violet-500/15 text-violet-400 border-violet-500/30",    light:"bg-violet-50 text-violet-600 border-violet-200",    icon:<Code2 className="w-3.5 h-3.5"/> },
  backend:    { label:"Backend",    gradient:"from-cyan-500 to-blue-500",      dark:"bg-cyan-500/15 text-cyan-400 border-cyan-500/30",          light:"bg-cyan-50 text-cyan-600 border-cyan-200",          icon:<Layers className="w-3.5 h-3.5"/> },
  frameworks: { label:"Frameworks", gradient:"from-fuchsia-500 to-pink-500",   dark:"bg-fuchsia-500/15 text-fuchsia-400 border-fuchsia-500/30", light:"bg-fuchsia-50 text-fuchsia-600 border-fuchsia-200", icon:<GitBranch className="w-3.5 h-3.5"/> },
  libraries:  { label:"Libraries",  gradient:"from-amber-500 to-orange-500",   dark:"bg-amber-500/15 text-amber-400 border-amber-500/30",       light:"bg-amber-50 text-amber-600 border-amber-200",       icon:<BookOpen className="w-3.5 h-3.5"/> },
  tools:      { label:"Tools",      gradient:"from-green-500 to-emerald-500",  dark:"bg-green-500/15 text-green-400 border-green-500/30",       light:"bg-green-50 text-green-600 border-green-200",       icon:<Hash className="w-3.5 h-3.5"/> },
  languages:  { label:"Languages",  gradient:"from-blue-500 to-violet-500",    dark:"bg-blue-500/15 text-blue-400 border-blue-500/30",          light:"bg-blue-50 text-blue-600 border-blue-200",          icon:<Code2 className="w-3.5 h-3.5"/> },
};

const AVATAR_GRADIENTS = [
  "from-violet-500 to-fuchsia-500","from-cyan-500 to-blue-500",
  "from-fuchsia-500 to-pink-500",  "from-amber-500 to-orange-500",
];

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

// ─── Edit modal ───────────────────────────────────────────────────────────────
function EditModal({ user, darkMode, onClose }: { user: IUser; darkMode: boolean; onClose: () => void }) {
  const [form, setForm] = useState({ username:user.username, title:user.title??"", about:user.about??"",  portfolio:user.portfolio??"" });
  const A = "from-violet-500 via-fuchsia-500 to-cyan-400";
  const ic = `w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all focus:ring-2 focus:ring-violet-500/30 ${darkMode?"bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-violet-500/60":"bg-gray-50 border-gray-200 text-gray-900 focus:border-violet-400"}`;
  const lc = `block text-xs font-semibold mb-1.5 ${darkMode?"text-gray-300":"text-gray-700"}`;
  const dv = darkMode ? "border-gray-800" : "border-gray-100";
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div ref={ref} className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background:"rgba(0,0,0,0.65)", backdropFilter:"blur(6px)" }}
      onClick={e => { if(e.target===ref.current) onClose(); }}>
      <div className={`w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${darkMode?"bg-gray-900 border-gray-700":"bg-white border-gray-200"}`}
        style={{ animation:"slideUp 0.22s ease both" }}>
        <div className={`flex items-center justify-between px-6 py-5 border-b ${dv}`}>
          <div>
            <h2 className={`text-base font-bold ${darkMode?"text-white":"text-gray-900"}`}>Edit profile</h2>
            <p className={`text-xs mt-0.5 ${darkMode?"text-gray-400":"text-gray-500"}`}>Update your public information</p>
          </div>
          <button onClick={onClose} className={`w-8 h-8 rounded-full flex items-center justify-center ${darkMode?"hover:bg-gray-800 text-gray-400":"hover:bg-gray-100 text-gray-500"}`}><X className="w-4 h-4"/></button>
        </div>
        <div className="overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2"><label className={lc}>Display name</label><input className={ic} value={form.username} onChange={e=>setForm(f=>({...f,username:e.target.value}))}/></div>
            <div><label className={lc}>Title</label><input className={ic} placeholder="e.g. Senior Frontend Dev" value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))}/></div>
            <div className="col-span-2"><label className={lc}>About</label><textarea rows={3} className={`${ic} resize-none`} value={form.about} onChange={e=>setForm(f=>({...f,about:e.target.value}))}/></div>
            <div className="col-span-2"><label className={lc}>Portfolio URL</label><input className={ic} placeholder="yoursite.com" value={form.portfolio} onChange={e=>setForm(f=>({...f,portfolio:e.target.value}))}/></div>
          </div>
        </div>
        <div className={`flex gap-3 px-6 py-4 border-t ${dv}`}>
          <button onClick={onClose} className={`flex-1 py-2.5 rounded-xl text-sm font-medium border ${darkMode?"border-gray-700 text-gray-400 hover:bg-gray-800":"border-gray-200 text-gray-600 hover:bg-gray-50"} transition-all`}>Cancel</button>
          <button onClick={()=>{ toast.success("Profile updated!"); onClose(); }} className={`flex-1 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r ${A} text-white shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40 hover:scale-[1.02] transition-all`}>Save changes</button>
        </div>
      </div>
    </div>
  );
}

// ─── Reusable section wrapper ─────────────────────────────────────────────────
function Section({ title, iconNode, iconGradient = "from-violet-500 via-fuchsia-500 to-cyan-400", action, darkMode, children, delay = 0 }: {
  title: string; iconNode: React.ReactNode; iconGradient?: string;
  action?: React.ReactNode; darkMode: boolean; children: React.ReactNode; delay?: number;
}) {
  const { ref, inView } = useInView();
  const cb = darkMode ? "bg-gray-800 border-gray-700/60" : "bg-white border-gray-200";
  const dv = darkMode ? "border-gray-700/50" : "border-gray-100";
  return (
    <div ref={ref} className={`rounded-2xl border overflow-hidden ${cb}`}
      style={{ opacity:inView?1:0, transform:inView?"none":"translateY(20px)", transition:`opacity .55s ease ${delay}s,transform .55s ease ${delay}s` }}>
      <div className={`flex items-center justify-between px-6 py-4 border-b ${dv}`}>
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${iconGradient} flex items-center justify-center text-white shrink-0`}>{iconNode}</div>
          <h2 className={`text-sm font-bold ${darkMode?"text-white":"text-gray-900"}`}>{title}</h2>
        </div>
        {action}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function UserProfilePage() {
  const darkMode      = useAppSelector((state:any) => state.Theme.darkMode);
  const params        = useParams();
  const currentUserId = "dummy123";

  const [user]             = useState<IUser>(DUMMY_USER);
  const [showEdit, setShowEdit] = useState(false);
  const [isConn, setIsConn]   = useState(false);
  const [connected, setConn]  = useState(false);
  const [reqSent, setReq]     = useState(false);
  const [emailCopied, setEC]  = useState(false);
  const heroRef = useInView();

  const isOwn = currentUserId === user._id;
  const AG    = "from-violet-500 via-fuchsia-500 to-cyan-400";
  const AT    = "bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent";

  // ── Theme ──────────────────────────────────────────────────────────────────
  const bg  = darkMode ? "bg-gray-900 text-white"         : "bg-white text-gray-800";
  const cb  = darkMode ? "bg-gray-800 border-gray-700/60" : "bg-white border-gray-200";
  const mt  = darkMode ? "text-gray-400"                  : "text-gray-500";
  const ht  = darkMode ? "text-white"                     : "text-gray-900";
  const dv  = darkMode ? "border-gray-700/60"             : "border-gray-100";

  async function onConnect() {
    setIsConn(true); await new Promise(r=>setTimeout(r,900));
    setReq(true); setIsConn(false); toast.success("Connection request sent! 🎉");
  }
  function copyEmail() {
    navigator.clipboard.writeText(user.email); setEC(true);
    setTimeout(()=>setEC(false),2000); toast("Email copied!");
  }

  return (
    <div className={`min-h-screen ${bg} transition-colors duration-300 font-sans`}>
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">

        {/* ══ HERO CARD ══ */}
        <div ref={heroRef.ref} className={`rounded-2xl border overflow-hidden ${cb}`}
          style={{ opacity:heroRef.inView?1:0, transform:heroRef.inView?"none":"translateY(20px)", transition:"opacity .6s ease,transform .6s ease" }}>

          {/* Cover with grid texture */}
          <div className="relative h-36 md:h-48 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-500">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage:"linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)", backgroundSize:"32px 32px" }} />
            <div className="absolute top-0 left-1/3 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          </div>

          <div className="relative px-6 pb-6">
            {/* Avatar + actions */}
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div className="-mt-12 relative inline-block">
                <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${AVATAR_GRADIENTS[0]} flex items-center justify-center text-2xl font-extrabold text-white ring-4 ${darkMode?"ring-gray-800":"ring-white"} shadow-xl`}>
                  {user.username.slice(0,2).toUpperCase()}
                </div>
                <span className="absolute bottom-1.5 right-1.5 w-4 h-4 rounded-full bg-green-400 border-2 border-white"/>
              </div>

              <div className="flex items-center gap-2 mt-2 sm:mt-0">
                {isOwn ? (
                  <button onClick={()=>setShowEdit(true)} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all hover:scale-[1.02] ${darkMode?"border-gray-600 text-gray-300 hover:bg-gray-700":"border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
                    <Pencil className="w-3.5 h-3.5"/> Edit profile
                  </button>
                ) : (
                  <>
                    <button onClick={onConnect} disabled={connected||reqSent||isConn}
                      className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] ${
                        connected ? (darkMode?"bg-green-500/15 border border-green-500/30 text-green-400":"bg-green-50 border border-green-200 text-green-600")
                        : reqSent  ? (darkMode?"bg-gray-700 border border-gray-600 text-gray-400":"bg-gray-50 border border-gray-200 text-gray-500")+" cursor-default"
                        : `bg-gradient-to-r ${AG} text-white shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40`
                      }`}>
                      {isConn ? <Loader2 className="w-4 h-4 animate-spin"/> : connected ? <CheckCircle className="w-4 h-4"/> : <UserPlus className="w-4 h-4"/>}
                      {connected?"Connected":reqSent?"Sent":"Connect"}
                    </button>
                    <button className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all hover:scale-[1.02] ${darkMode?"border-gray-600 text-gray-300 hover:bg-gray-700":"border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
                      <MessageCircle className="w-3.5 h-3.5"/> Message
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Name, title, meta */}
            <div className="mt-4">
              <h1 className={`text-2xl font-extrabold tracking-tight ${ht}`}>{user.username}</h1>
              {user.title && <p className={`text-sm mt-0.5 font-medium ${darkMode?"text-violet-400":"text-violet-600"}`}>{user.title}</p>}
              <div className="flex flex-wrap items-center gap-3 mt-2">
                {user.portfolio && (
                  <a href={`https://${user.portfolio}`} target="_blank" rel="noreferrer"
                    className={`flex items-center gap-1.5 text-xs ${darkMode?"text-violet-400 hover:text-violet-300":"text-violet-600 hover:text-violet-700"} transition-colors`}>
                    <Globe className="w-3.5 h-3.5"/>{user.portfolio}<ExternalLink className="w-2.5 h-2.5 opacity-50"/>
                  </a>
                )}
                <span className={`text-xs ${mt}`}>Joined {new Date(user.createdAt).toLocaleDateString("en-US",{month:"short",year:"numeric"})}</span>
              </div>
            </div>

            {user.about && <p className={`text-sm leading-relaxed mt-3 max-w-2xl ${darkMode?"text-gray-300":"text-gray-600"}`}>{user.about}</p>}
            </div>
        </div>

        {/* ══ STATS ══ */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon:<Users className="w-4 h-4"/>,      value:user.connectedUsers?.length??0, label:"Connections", f:"from-violet-500", t:"to-fuchsia-500" },
            { icon:<FolderOpen className="w-4 h-4"/>,  value:user.projects.length,           label:"Projects",    f:"from-cyan-500",   t:"to-blue-500"    },
            { icon:<Trophy className="w-4 h-4"/>,      value:user.totalPoints,               label:"Points",      f:"from-amber-500",  t:"to-orange-500"  },
            { icon:<Award className="w-4 h-4"/>,       value:user.challengesAttended.length, label:"Challenges",  f:"from-fuchsia-500",t:"to-pink-500"    },
          ].map((s,i)=>(
            <div key={s.label} className={`rounded-2xl border p-5 flex flex-col items-center gap-2 transition-all hover:scale-[1.02] ${cb}`}
              style={{ opacity:heroRef.inView?1:0, transform:heroRef.inView?"none":"translateY(16px)", transition:`opacity .5s ease ${i*.07+.2}s,transform .5s ease ${i*.07+.2}s` }}>
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.f} ${s.t} flex items-center justify-center text-white`}>{s.icon}</div>
              <div className={`text-2xl font-extrabold tracking-tight ${ht}`}>{s.value.toLocaleString()}</div>
              <div className={`text-xs ${mt}`}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* ══ CONTACT ══ */}
        <Section title="Contact Information" iconNode={<Mail className="w-4 h-4"/>} iconGradient="from-green-500 to-emerald-500" darkMode={darkMode} delay={0.1}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {DUMMY_USER.socialLinks?.map((item, i) => {
    return (
      <div
        key={i}
        className={`p-3 rounded-xl border text-xs truncate ${
          darkMode
            ? "bg-gray-700/40 border-gray-600/40 text-gray-300"
            : "bg-gray-50 border-gray-100 text-gray-700"
        }`}
      >
        {item}
      </div>
    );
  })}
          </div>
        </Section>
      </div>

      {showEdit && <EditModal user={user} darkMode={darkMode} onClose={()=>setShowEdit(false)}/>}

      <style>{`
        @keyframes slideUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
      `}</style>
    </div>
  );
}