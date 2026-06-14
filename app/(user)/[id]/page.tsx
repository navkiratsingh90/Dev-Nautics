"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import {
  Pencil, Globe, Linkedin, Github, Mail, Users, FolderOpen,
  Loader2, CheckCircle, UserPlus, X, Copy, Check, ExternalLink,
  MessageCircle, Briefcase, GraduationCap, Code2, Trophy, Award,
  Layers, BookOpen, Hash, GitBranch,
} from "lucide-react";
import { ISkills, IUser } from "@/types/User";

// ─── Mock Data (unchanged) ─────────────────────────────────────
const DUMMY_USER: IUser = {
  _id: "dummy123", username: "Alex Johnson",
  email: "alex.johnson@example.com", password: "",
  about: "Passionate frontend developer with 5+ years of experience building responsive web applications. Love working with React and modern JavaScript. Currently exploring AI-powered tooling and edge computing.",
  title: "Senior Frontend Developer",
  portfolio: "alexjohnson.dev",
  connectedUsers: [{ _id: "c1" }, { _id: "c2" }, { _id: "c3" }, { _id: "c4" }, { _id: "c5" }],
  totalPendingRequests: [], totalPoints: 1250,
  challengesAttended: ["ch1", "ch2", "ch3", "ch4", "ch5", "ch6"],
  createdAt: new Date("2024-01-10"), updatedAt: new Date("2025-04-01"),
  socialLinks: ["https://linkedin.com/in/alexjohnson", "https://github.com/alexjohnson"],
  skills: {
    frontend: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Framer Motion"],
    backend: ["Node.js", "Express", "GraphQL", "REST API"],
    frameworks: ["Next.js", "Redux", "React Query", "Prisma"],
    libraries: ["Recharts", "Zod", "date-fns", "Lucide"],
    tools: ["Git", "Docker", "Figma", "VS Code", "Postman"],
    languages: ["TypeScript", "JavaScript", "Python", "SQL"],
  },
  education: [
    { schoolName: "UC Berkeley", degree: "B.S. Computer Science", duration: "2015 – 2019", description: "Specialized in HCI and distributed systems. Dean's List all 4 years." },
    { schoolName: "Meta / Coursera", degree: "Front-End Developer Professional Certificate", duration: "2021", description: "Advanced React patterns, performance optimization, and accessibility." },
  ],
  workExperience: [
    { companyName: "Stripe", role: "Senior Frontend Engineer", duration: "2022 – Present", location: "San Francisco, CA", description: "Building the dashboard UI. Led a team of 4 to redesign the billing portal, reducing drop-off by 22%." },
    { companyName: "Airbnb", role: "Frontend Engineer", duration: "2020 – 2022", location: "Remote", description: "Worked on the listing creation flow and host dashboard. Contributed to a design system used by 300+ engineers." },
    { companyName: "Freelance", role: "React Developer", duration: "2019 – 2020", location: "Remote", description: "Shipped 8+ client projects — storefronts, SaaS dashboards, and marketing sites." },
  ],
  projects: [
    { title: "AI Code Assistant", description: "Intelligent code completion using fine-tuned LLMs.", techStack: ["Python", "TypeScript", "FastAPI", "React"], role: "Project Lead", duration: "Jan 2025 – Present", githubLink: "https://github.com/alexj/ai-code-assistant", liveLink: "https://ai-code.alexjohnson.dev", file: "" },
    { title: "react-hot-key", description: "Open-source keyboard shortcut library for React.", techStack: ["TypeScript", "React", "Rollup", "Jest"], role: "Author", duration: "Nov 2024", githubLink: "https://github.com/alexj/react-hot-key" },
    { title: "DevConnect Clone", description: "Full-stack developer community platform.", techStack: ["Next.js", "MongoDB", "Socket.io", "Tailwind"], role: "Full-Stack Dev", duration: "2024", githubLink: "https://github.com/alexj/devconnect" },
  ],
};

const SKILL_CATEGORIES: { key: keyof ISkills; label: string; icon: React.ReactNode }[] = [
  { key: "frontend", label: "Frontend", icon: <Code2 className="w-3.5 h-3.5" /> },
  { key: "backend", label: "Backend", icon: <Layers className="w-3.5 h-3.5" /> },
  { key: "frameworks", label: "Frameworks", icon: <GitBranch className="w-3.5 h-3.5" /> },
  { key: "libraries", label: "Libraries", icon: <BookOpen className="w-3.5 h-3.5" /> },
  { key: "tools", label: "Tools", icon: <Hash className="w-3.5 h-3.5" /> },
  { key: "languages", label: "Languages", icon: <Code2 className="w-3.5 h-3.5" /> },
];

// ─── Edit Modal (simplified) ─────────────────────────────────
function EditModal({ user, onClose }: { user: IUser; onClose: () => void }) {
  const [form, setForm] = useState({
    username: user.username,
    title: user.title ?? "",
    about: user.about ?? "",
    portfolio: user.portfolio ?? "",
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-base font-bold text-gray-900">Edit profile</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Display name</label>
            <input
              className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-green-500"
              value={form.username}
              onChange={(e) => setForm(f => ({ ...f, username: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Title</label>
            <input
              className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-green-500"
              value={form.title}
              onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">About</label>
            <textarea
              rows={3}
              className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-900 resize-none focus:outline-none focus:ring-1 focus:ring-green-500"
              value={form.about}
              onChange={(e) => setForm(f => ({ ...f, about: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Portfolio URL</label>
            <input
              className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-green-500"
              placeholder="yoursite.com"
              value={form.portfolio}
              onChange={(e) => setForm(f => ({ ...f, portfolio: e.target.value }))}
            />
          </div>
        </div>
        <div className="flex gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button onClick={onClose} className="flex-1 py-2 rounded-xl text-sm font-medium border border-gray-200 text-gray-600 hover:bg-white">Cancel</button>
          <button
            onClick={() => { toast.success("Profile updated!"); onClose(); }}
            className="flex-1 py-2 rounded-xl text-sm font-semibold bg-gray-900 text-white hover:bg-gray-800"
          >
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────
export default function UserProfilePage() {
  const [user] = useState<IUser>(DUMMY_USER);
  const [showEdit, setShowEdit] = useState(false);
  const [isConn, setIsConn] = useState(false);
  const [connected, setConn] = useState(false);
  const [reqSent, setReq] = useState(false);
  const [emailCopied, setEC] = useState(false);

  const isOwn = true;

  const onConnect = async () => {
    setIsConn(true);
    await new Promise(r => setTimeout(r, 900));
    setReq(true);
    setIsConn(false);
    toast.success("Connection request sent! 🎉");
  };

  const copyEmail = () => {
    navigator.clipboard.writeText(user.email);
    setEC(true);
    setTimeout(() => setEC(false), 2000);
    toast("Email copied!");
  };

  return (
    <div className="bg-gray-50 min-h-screen font-sans py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Hero Card */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          {/* Cover */}
          <div className="h-32 md:h-40 bg-green-600" />

          <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 -mt-12">
              <div className="relative inline-block">
                <div className="w-24 h-24 rounded-2xl bg-green-600 flex items-center justify-center text-2xl font-bold text-white ring-4 ring-white shadow-md">
                  {user.username.slice(0, 2).toUpperCase()}
                </div>
                <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-green-400 border-2 border-white" />
              </div>

              {isOwn ? (
                <button
                  onClick={() => setShowEdit(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-gray-200 text-gray-800 hover:bg-gray-50"
                >
                  <Pencil className="w-4 h-4" /> Edit profile
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={onConnect}
                    disabled={connected || reqSent || isConn}
                    className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold ${
                      connected || reqSent
                        ? "bg-gray-100 text-gray-500 cursor-default"
                        : "bg-gray-900 text-white hover:bg-gray-800"
                    }`}
                  >
                    {isConn ? <Loader2 className="w-4 h-4 animate-spin" /> : connected ? <CheckCircle className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                    {connected ? "Connected" : reqSent ? "Sent" : "Connect"}
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-gray-200 text-gray-800 hover:bg-gray-50">
                    <MessageCircle className="w-4 h-4" /> Message
                  </button>
                </div>
              )}
            </div>

            <div className="mt-4">
              <h1 className="text-2xl font-bold text-gray-900">{user.username}</h1>
              {user.title && <p className="text-sm font-medium text-green-600 mt-0.5">{user.title}</p>}
              <div className="flex flex-wrap gap-3 mt-2 text-xs">
                {user.portfolio && (
                  <a href={`https://${user.portfolio}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-green-600 hover:underline">
                    <Globe className="w-3.5 h-3.5" /> {user.portfolio} <ExternalLink className="w-2.5 h-2.5 opacity-50" />
                  </a>
                )}
                <span className="text-gray-500">Joined {new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}</span>
              </div>
            </div>

            {user.about && <p className="text-sm text-gray-600 mt-3 leading-relaxed">{user.about}</p>}
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon: <Users className="w-4 h-4" />, value: user.connectedUsers?.length ?? 0, label: "Connections", color: "bg-green-500" },
            { icon: <FolderOpen className="w-4 h-4" />, value: user.projects.length, label: "Projects", color: "bg-blue-500" },
            { icon: <Trophy className="w-4 h-4" />, value: user.totalPoints, label: "Points", color: "bg-amber-500" },
            { icon: <Award className="w-4 h-4" />, value: user.challengesAttended.length, label: "Challenges", color: "bg-fuchsia-500" },
          ].map((stat, idx) => (
            <div key={idx} className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col items-center gap-2 text-center">
              <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center text-white`}>{stat.icon}</div>
              <div className="text-2xl font-bold text-gray-900">{stat.value.toLocaleString()}</div>
              <div className="text-xs text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Contact Card */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-green-500 flex items-center justify-center text-white">
              <Mail className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-gray-900">Contact Information</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">{user.email}</span>
                <button onClick={copyEmail} className="ml-auto p-1 rounded hover:bg-gray-100">
                  {emailCopied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5 text-gray-400" />}
                </button>
              </div>
              {user.socialLinks?.map((link, i) => (
                <a key={i} href={link} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-green-600 hover:underline truncate">
                  {link.includes("linkedin") ? <Linkedin className="w-4 h-4" /> : <Github className="w-4 h-4" />}
                  {link.replace(/^https?:\/\//, "").split("/")[0]}
                </a>
              ))}
            </div>
          </div>
        </div>

        
      </div>

      {showEdit && <EditModal user={user} onClose={() => setShowEdit(false)} />}
    </div>
  );
}