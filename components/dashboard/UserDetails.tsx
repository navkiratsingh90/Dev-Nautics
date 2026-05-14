"use client";

import React, { useState, useRef } from "react";
import { useParams } from "next/navigation";
import { useAppSelector } from "@/redux/hooks";
import { toast } from "sonner";
import {
  Pencil, MapPin, Globe, Linkedin, Github, Mail, Phone,
  Users, FileText, FolderOpen, Loader2, CheckCircle,
  UserPlus, X, Camera, ExternalLink, Copy, Check,
  MessageCircle, Bookmark, Heart, Clock,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface SocialLinks { linkedin?: string; github?: string; twitter?: string; }
interface User {
  _id: string; username: string; email: string; about: string;
  connectedUsers: Array<{ _id: string }>; totalPendingRequests: string[];
  projects: any[]; title?: string; skills?: string[];
  portfolio?: string; phone?: string; location?: string; socialLinks?: SocialLinks;
  avatar?: string; coverColor?: string;
}

// ─── Mock data ────────────────────────────────────────────────────────────────
const DUMMY_USER: User = {
  _id: "dummy123", username: "Alex Johnson", email: "alex.johnson@example.com",
  about: "Passionate frontend developer with 5+ years of experience building responsive web applications. Love working with React and modern JavaScript. Currently exploring AI-powered tooling and edge computing.",
  connectedUsers: [{ _id: "other1" }, { _id: "other2" }, { _id: "other3" }, { _id: "other4" }, { _id: "other5" }],
  totalPendingRequests: [], projects: [{ id: 1 }, { id: 2 }, { id: 3 }],
  title: "Senior Frontend Developer", skills: ["React", "TypeScript", "Node.js", "UI/UX", "Next.js", "Tailwind", "GraphQL"],
  portfolio: "alexjohnson.dev", phone: "+1 (555) 123-4567", location: "San Francisco, CA",
  socialLinks: { linkedin: "https://linkedin.com/in/alexjohnson", github: "https://github.com/alexjohnson" },
  coverColor: "violet",
};

const DUMMY_ACTIVITIES = [
  { id: 1, type: "post",    text: "Just shipped a real-time collaboration feature using WebSockets + Zustand. Latency under 50ms! 🚀", time: "2h ago", likes: 24, comments: 7 },
  { id: 2, type: "comment", text: "Commented on Sarah's article about React Server Components performance patterns.", time: "5h ago", likes: 8, comments: 2 },
  { id: 3, type: "project", text: "Launched open-source project: react-hot-key — keyboard shortcuts for React apps.", time: "1d ago", likes: 61, comments: 13 },
  { id: 4, type: "post",    text: "Writing a deep dive on useMemo vs useCallback — turns out most devs are over-memoizing. Blog post dropping this week.", time: "2d ago", likes: 39, comments: 18 },
];

const avatarGradients = [
  "from-violet-500 to-fuchsia-500", "from-cyan-500 to-blue-500",
  "from-fuchsia-500 to-pink-500",   "from-amber-500 to-orange-500",
];

// ─── Edit Profile Modal ───────────────────────────────────────────────────────
function EditModal({ user, darkMode, onClose }: { user: User; darkMode: boolean; onClose: () => void }) {
  const [form, setForm] = useState({ username: user.username, title: user.title ?? "", about: user.about, location: user.location ?? "", portfolio: user.portfolio ?? "", skills: user.skills?.join(", ") ?? "" });
  const overlayRef = useRef<HTMLDivElement>(null);
  const accentGradient = "from-violet-500 via-fuchsia-500 to-cyan-400";
  const inputCls = `w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all focus:ring-2 focus:ring-violet-500/30 ${darkMode ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-violet-500/60" : "bg-gray-50 border-gray-200 text-gray-900 focus:border-violet-400"}`;
  const labelCls = `block text-xs font-semibold mb-1.5 ${darkMode ? "text-gray-300" : "text-gray-700"}`;

  return (
    <div ref={overlayRef} className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)" }}
      onClick={e => { if (e.target === overlayRef.current) onClose(); }}>
      <div className={`w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${darkMode ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"}`}
        style={{ animation: "slideUp 0.22s ease both" }}>
        <div className={`flex items-center justify-between px-6 py-5 border-b ${darkMode ? "border-gray-800" : "border-gray-100"}`}>
          <div>
            <h2 className={`text-base font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>Edit profile</h2>
            <p className={`text-xs mt-0.5 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Update your public information</p>
          </div>
          <button onClick={onClose} className={`w-8 h-8 rounded-full flex items-center justify-center ${darkMode ? "hover:bg-gray-800 text-gray-400" : "hover:bg-gray-100 text-gray-500"}`}><X className="w-4 h-4" /></button>
        </div>
        <div className="overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2"><label className={labelCls}>Display name</label><input className={inputCls} value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} /></div>
            <div className="col-span-2 sm:col-span-1"><label className={labelCls}>Title</label><input className={inputCls} value={form.title} placeholder="e.g. Senior Frontend Dev" onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></div>
            <div className="col-span-2 sm:col-span-1"><label className={labelCls}>Location</label><input className={inputCls} value={form.location} placeholder="e.g. San Francisco, CA" onChange={e => setForm(f => ({ ...f, location: e.target.value }))} /></div>
            <div className="col-span-2"><label className={labelCls}>About</label><textarea rows={3} className={`${inputCls} resize-none`} value={form.about} onChange={e => setForm(f => ({ ...f, about: e.target.value }))} /></div>
            <div className="col-span-2"><label className={labelCls}>Portfolio URL</label><input className={inputCls} value={form.portfolio} placeholder="yoursite.com" onChange={e => setForm(f => ({ ...f, portfolio: e.target.value }))} /></div>
            <div className="col-span-2"><label className={labelCls}>Skills <span className={`font-normal ${darkMode ? "text-gray-500" : "text-gray-400"}`}>(comma-separated)</span></label><input className={inputCls} value={form.skills} onChange={e => setForm(f => ({ ...f, skills: e.target.value }))} /></div>
          </div>
        </div>
        <div className={`flex gap-3 px-6 py-4 border-t ${darkMode ? "border-gray-800" : "border-gray-100"}`}>
          <button onClick={onClose} className={`flex-1 py-2.5 rounded-xl text-sm font-medium border ${darkMode ? "border-gray-700 text-gray-400 hover:bg-gray-800" : "border-gray-200 text-gray-600 hover:bg-gray-50"} transition-all`}>Cancel</button>
          <button onClick={() => { toast.success("Profile updated!"); onClose(); }} className={`flex-1 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r ${accentGradient} text-white shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40 hover:scale-[1.02] transition-all`}>Save changes</button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function UserProfilePage() {
  const darkMode      = useAppSelector((state: any) => state.Theme.darkMode);
  const params        = useParams();
  const currentUserId = "dummy123"; // replace with useAppSelector(s => s.Auth.userId)

  const [user]            = useState<User>(DUMMY_USER);
  const [totalActivities] = useState(12);
  const [showEdit, setShowEdit]     = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connected, setConnected]   = useState(false);
  const [reqSent, setReqSent]       = useState(false);
  const [activeTab, setActiveTab]   = useState<"all" | "posts" | "comments">("all");
  const [copiedEmail, setCopiedEmail] = useState(false);

  const isOwnProfile = currentUserId === user._id;
  const accentGradient = "from-violet-500 via-fuchsia-500 to-cyan-400";

  // ── Theme tokens ──────────────────────────────────────────────────────────
  const bg          = darkMode ? "bg-gray-900 text-white"        : "bg-white text-gray-800";
  const cardBg      = darkMode ? "bg-gray-800 border-gray-700/60": "bg-white border-gray-200";
  const surfaceBg   = darkMode ? "bg-gray-800/40"                : "bg-gray-50";
  const mutedText   = darkMode ? "text-gray-400"                 : "text-gray-500";
  const headingText = darkMode ? "text-white"                    : "text-gray-900";
  const divider     = darkMode ? "border-gray-700/60"            : "border-gray-100";

  async function handleConnect() {
    setIsConnecting(true);
    await new Promise(r => setTimeout(r, 900));
    setReqSent(true); setIsConnecting(false);
    toast.success("Connection request sent! 🎉");
  }

  function copyEmail() {
    navigator.clipboard.writeText(user.email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
    toast("Email copied!");
  }

  const coverGradients: Record<string, string> = {
    violet: "from-violet-600 via-fuchsia-600 to-cyan-500",
    cyan:   "from-cyan-500 via-blue-600 to-violet-600",
    amber:  "from-amber-500 via-orange-500 to-fuchsia-600",
  };
  const cover = coverGradients[user.coverColor ?? "violet"];

  return (
    <div className={`min-h-screen ${bg} transition-colors duration-300 font-sans`}>
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">

        {/* ── PROFILE CARD ── */}
        <div className={`rounded-2xl border overflow-hidden ${cardBg}`}>
          {/* Cover */}
          <div className={`relative h-36 md:h-48 bg-gradient-to-r ${cover}`}>
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`, backgroundSize: "32px 32px" }} />
            {isOwnProfile && (
              <button className={`absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-black/30 text-white hover:bg-black/50 transition-all backdrop-blur-sm`}>
                <Camera className="w-3.5 h-3.5" /> Edit cover
              </button>
            )}
          </div>

          {/* Avatar row */}
          <div className="relative px-6 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              {/* Avatar */}
              <div className="-mt-12 relative inline-block">
                <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${avatarGradients[0]} flex items-center justify-center text-2xl font-extrabold text-white ring-4 ${darkMode ? "ring-gray-800" : "ring-white"} shadow-xl`}>
                  {user.username.slice(0, 2).toUpperCase()}
                </div>
                <span className="absolute bottom-1.5 right-1.5 w-4 h-4 rounded-full bg-green-400 border-2 border-white" />
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 mt-2 sm:mt-0">
                {isOwnProfile ? (
                  <button onClick={() => setShowEdit(true)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all hover:scale-[1.02] ${darkMode ? "border-gray-600 text-gray-300 hover:bg-gray-700" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
                    <Pencil className="w-3.5 h-3.5" /> Edit profile
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleConnect}
                      disabled={connected || reqSent || isConnecting}
                      className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] ${
                        connected
                          ? `${darkMode ? "bg-green-500/15 border border-green-500/30 text-green-400" : "bg-green-50 border border-green-200 text-green-600"}`
                          : reqSent
                            ? `${darkMode ? "bg-gray-700 border border-gray-600 text-gray-400" : "bg-gray-50 border border-gray-200 text-gray-500"} cursor-default`
                            : `bg-gradient-to-r ${accentGradient} text-white shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40`
                      }`}>
                      {isConnecting ? <Loader2 className="w-4 h-4 animate-spin" /> : connected ? <CheckCircle className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                      {connected ? "Connected" : reqSent ? "Request sent" : "Connect"}
                    </button>
                    <button className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all hover:scale-[1.02] ${darkMode ? "border-gray-600 text-gray-300 hover:bg-gray-700" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
                      <MessageCircle className="w-3.5 h-3.5" /> Message
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Name & title */}
            <div className="mt-4">
              <h1 className={`text-2xl font-extrabold tracking-tight ${headingText}`}>{user.username}</h1>
              <p className={`text-sm mt-0.5 ${darkMode ? "text-violet-400" : "text-violet-600"} font-medium`}>{user.title}</p>
              {user.location && (
                <p className={`flex items-center gap-1.5 text-xs mt-1.5 ${mutedText}`}>
                  <MapPin className="w-3.5 h-3.5" /> {user.location}
                </p>
              )}
            </div>

            {/* About */}
            <p className={`text-sm leading-relaxed mt-3 ${darkMode ? "text-gray-300" : "text-gray-600"} max-w-2xl`}>{user.about}</p>

            {/* Social links */}
            <div className="flex items-center gap-2 mt-4 flex-wrap">
              {user.portfolio && (
                <a href={`https://${user.portfolio}`} target="_blank" rel="noreferrer"
                  className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl border transition-all hover:scale-105 ${darkMode ? "border-gray-700 text-gray-400 hover:border-violet-500/40 hover:text-violet-400 bg-gray-700/30" : "border-gray-200 text-gray-600 hover:border-violet-300 hover:text-violet-600 bg-gray-50"}`}>
                  <Globe className="w-3 h-3" /> {user.portfolio} <ExternalLink className="w-2.5 h-2.5 opacity-50" />
                </a>
              )}
              {user.socialLinks?.github && (
                <a href={user.socialLinks.github} target="_blank" rel="noreferrer"
                  className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl border transition-all hover:scale-105 ${darkMode ? "border-gray-700 text-gray-400 hover:border-gray-500 bg-gray-700/30" : "border-gray-200 text-gray-600 hover:bg-gray-100 bg-gray-50"}`}>
                  <Github className="w-3 h-3" /> GitHub
                </a>
              )}
              {user.socialLinks?.linkedin && (
                <a href={user.socialLinks.linkedin} target="_blank" rel="noreferrer"
                  className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl border transition-all hover:scale-105 ${darkMode ? "border-gray-700 text-gray-400 hover:border-blue-500/40 hover:text-blue-400 bg-gray-700/30" : "border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600 bg-gray-50"}`}>
                  <Linkedin className="w-3 h-3" /> LinkedIn
                </a>
              )}
            </div>
          </div>
        </div>

        {/* ── STATS ── */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { icon: <Users className="w-4 h-4" />,     value: user.connectedUsers.length, label: "Connections", from: "from-violet-500", to: "to-fuchsia-500" },
            { icon: <FileText className="w-4 h-4" />,   value: totalActivities,            label: "Posts",        from: "from-cyan-500",   to: "to-blue-500"   },
            { icon: <FolderOpen className="w-4 h-4" />, value: user.projects.length,       label: "Projects",     from: "from-fuchsia-500",to: "to-pink-500"   },
          ].map((s, i) => (
            <div key={s.label} className={`rounded-2xl border p-5 flex flex-col items-center gap-2 transition-all hover:scale-[1.02] ${cardBg}`}>
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.from} ${s.to} flex items-center justify-center text-white`}>{s.icon}</div>
              <div className={`text-3xl font-extrabold tracking-tight ${headingText}`}>{s.value}</div>
              <div className={`text-xs ${mutedText}`}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── SKILLS ── */}
        <div className={`rounded-2xl border p-6 ${cardBg}`}>
          <h2 className={`text-sm font-bold mb-4 ${headingText}`}>Skills & Expertise</h2>
          <div className="flex flex-wrap gap-2">
            {user.skills?.map((skill, i) => (
              <span key={skill}
                className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all hover:scale-[1.04] cursor-default ${
                  i % 3 === 0 ? `${darkMode ? "bg-violet-500/15 border-violet-500/30 text-violet-400" : "bg-violet-50 border-violet-200 text-violet-600"}` :
                  i % 3 === 1 ? `${darkMode ? "bg-cyan-500/15 border-cyan-500/30 text-cyan-400"       : "bg-cyan-50 border-cyan-200 text-cyan-600"}`       :
                                `${darkMode ? "bg-fuchsia-500/15 border-fuchsia-500/30 text-fuchsia-400" : "bg-fuchsia-50 border-fuchsia-200 text-fuchsia-600"}`
                }`}>
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* ── TWO-COL: CONTACT + ACTIVITY ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Contact card */}
          <div className={`lg:col-span-1 rounded-2xl border p-5 space-y-3 h-fit ${cardBg}`}>
            <h2 className={`text-sm font-bold mb-4 ${headingText}`}>Contact</h2>
            {[
              { icon: <Mail className="w-3.5 h-3.5" />,  value: user.email,    action: copyEmail, actionIcon: copiedEmail ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />, label: "Copy email" },
              { icon: <Phone className="w-3.5 h-3.5" />, value: user.phone,    action: null },
              { icon: <MapPin className="w-3.5 h-3.5" />,value: user.location, action: null },
            ].filter(r => r.value).map((r, i) => (
              <div key={i} className={`flex items-center justify-between gap-2 p-3 rounded-xl border transition-all hover:scale-[1.01] ${darkMode ? "bg-gray-700/40 border-gray-600/40" : "bg-gray-50 border-gray-100"}`}>
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className={mutedText}>{r.icon}</span>
                  <span className={`text-xs truncate ${darkMode ? "text-gray-300" : "text-gray-700"}`}>{r.value}</span>
                </div>
                {r.action && (
                  <button onClick={r.action} className={`shrink-0 transition-colors ${mutedText} hover:text-violet-400`}>{r.actionIcon}</button>
                )}
              </div>
            ))}

            {/* Social */}
            <div className={`pt-3 border-t ${divider} space-y-2`}>
              {user.socialLinks?.github && (
                <a href={user.socialLinks.github} target="_blank" rel="noreferrer"
                  className={`flex items-center gap-2.5 p-3 rounded-xl border transition-all hover:scale-[1.01] ${darkMode ? "bg-gray-700/40 border-gray-600/40 text-gray-300 hover:border-gray-500" : "bg-gray-50 border-gray-100 text-gray-700 hover:border-gray-200"}`}>
                  <Github className="w-3.5 h-3.5" /><span className="text-xs">GitHub</span><ExternalLink className="w-2.5 h-2.5 ml-auto opacity-40" />
                </a>
              )}
              {user.socialLinks?.linkedin && (
                <a href={user.socialLinks.linkedin} target="_blank" rel="noreferrer"
                  className={`flex items-center gap-2.5 p-3 rounded-xl border transition-all hover:scale-[1.01] ${darkMode ? "bg-gray-700/40 border-gray-600/40 text-gray-300 hover:border-blue-500/40" : "bg-gray-50 border-gray-100 text-gray-700 hover:border-blue-200"}`}>
                  <Linkedin className="w-3.5 h-3.5" /><span className="text-xs">LinkedIn</span><ExternalLink className="w-2.5 h-2.5 ml-auto opacity-40" />
                </a>
              )}
            </div>
          </div>

          {/* Activity feed */}
          <div className={`lg:col-span-2 rounded-2xl border overflow-hidden ${cardBg}`}>
            <div className={`px-5 py-4 border-b ${divider} flex items-center justify-between`}>
              <h2 className={`text-sm font-bold ${headingText}`}>Recent Activity</h2>
              <div className={`flex items-center gap-0.5 p-0.5 rounded-lg ${darkMode ? "bg-gray-700/50" : "bg-gray-100"}`}>
                {(["all", "posts", "comments"] as const).map(t => (
                  <button key={t} onClick={() => setActiveTab(t)}
                    className={`px-3 py-1 rounded-md text-[11px] font-semibold capitalize transition-all ${activeTab === t ? `bg-gradient-to-r ${accentGradient} text-white shadow-sm` : `${darkMode ? "text-gray-400 hover:text-gray-200" : "text-gray-500 hover:text-gray-700"}`}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-5 space-y-3">
              {DUMMY_ACTIVITIES
                .filter(a => activeTab === "all" || (activeTab === "posts" ? a.type === "post" || a.type === "project" : a.type === "comment"))
                .map((a, i) => {
                  const typeColor: Record<string, string> = {
                    post:    darkMode ? "bg-violet-500/15 text-violet-400 border-violet-500/30" : "bg-violet-50 text-violet-600 border-violet-200",
                    comment: darkMode ? "bg-cyan-500/15 text-cyan-400 border-cyan-500/30"       : "bg-cyan-50 text-cyan-600 border-cyan-200",
                    project: darkMode ? "bg-fuchsia-500/15 text-fuchsia-400 border-fuchsia-500/30" : "bg-fuchsia-50 text-fuchsia-600 border-fuchsia-200",
                  };
                  return (
                    <div key={a.id} className={`group flex gap-3 p-4 rounded-xl border transition-all hover:-translate-y-0.5 hover:shadow-lg ${darkMode ? "bg-gray-700/30 border-gray-700/40 hover:border-violet-500/30 hover:shadow-violet-500/5" : "bg-gray-50/80 border-gray-100 hover:border-violet-200 hover:shadow-violet-100/50"}`}>
                      <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${avatarGradients[0]} flex items-center justify-center text-xs font-bold text-white shrink-0 mt-0.5`}>
                        {user.username.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${typeColor[a.type]}`}>{a.type}</span>
                          <span className={`text-[11px] flex items-center gap-1 ${mutedText}`}><Clock className="w-3 h-3" />{a.time}</span>
                        </div>
                        <p className={`text-xs leading-relaxed ${darkMode ? "text-gray-300" : "text-gray-700"}`}>{a.text}</p>
                        <div className="flex items-center gap-3 mt-2.5">
                          <span className={`flex items-center gap-1 text-[11px] ${mutedText}`}><Heart className="w-3 h-3" />{a.likes}</span>
                          <span className={`flex items-center gap-1 text-[11px] ${mutedText}`}><MessageCircle className="w-3 h-3" />{a.comments}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </div>

      {/* Edit modal */}
      {showEdit && <EditModal user={user} darkMode={darkMode} onClose={() => setShowEdit(false)} />}

      <style>{`
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}