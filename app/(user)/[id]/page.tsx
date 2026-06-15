"use client";

import React, { useState } from "react";
import { useAppSelector } from "@/redux/hooks";
import { toast } from "sonner";
import {
  Pencil, Globe, Linkedin, Github, Mail, Users, FolderOpen,
  Loader2, CheckCircle, UserPlus, X, Copy, Check, ExternalLink,
  MessageCircle, Briefcase, GraduationCap, Code2, Trophy, Award,
  Layers, BookOpen, Hash, GitBranch,
} from "lucide-react";
import { IUser, ISkills } from "@/types/User";
import axios from "axios";

// ─── Skill categories configuration ──────────────────────────────────────────
const SKILL_CATEGORIES: { key: keyof ISkills; label: string; icon: React.ReactNode }[] = [
  { key: "frontend", label: "Frontend", icon: <Code2 className="w-3.5 h-3.5" /> },
  { key: "backend", label: "Backend", icon: <Layers className="w-3.5 h-3.5" /> },
  { key: "frameworks", label: "Frameworks", icon: <GitBranch className="w-3.5 h-3.5" /> },
  { key: "libraries", label: "Libraries", icon: <BookOpen className="w-3.5 h-3.5" /> },
  { key: "tools", label: "Tools", icon: <Hash className="w-3.5 h-3.5" /> },
  { key: "languages", label: "Languages", icon: <Code2 className="w-3.5 h-3.5" /> },
];

// ─── Edit Modal ──────────────────────────────────────────────────────────────
function EditModal({ user, onClose }: { user: IUser; onClose: () => void }) {
  const [form, setForm] = useState({
    username: user.username,
    position: user.position ?? "",
    about: user.about ?? "",
    portfolio: user.portfolio ?? "",
  });
const handleSave = async () => {
  try {
    const response = await axios.put(
      "/api/user/profile",
      form
    );
    console.log(response);
    
    toast.success(response.data.message);
    onClose()
  } catch (error: any) {
    toast.error(
      error.response?.data?.message ||
      "Failed to update profile"
    );
  }
};
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
            <label className="block text-xs font-semibold text-gray-700 mb-1">position</label>
            <input
              className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-green-500"
              value={form.position}
              onChange={(e) => setForm(f => ({ ...f, position: e.target.value }))}
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
            onClick={handleSave}
            className="flex-1 py-2 rounded-xl text-sm font-semibold bg-gray-900 text-white hover:bg-gray-800"
          >
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function UserProfilePage() {
  const user = useAppSelector<IUser | null>((state: any) => state.User.userData);
  const [showEdit, setShowEdit] = useState(false);
  const [isConn, setIsConn] = useState(false);
  const [connected, setConn] = useState(false);
  const [reqSent, setReq] = useState(false);
  const [emailCopied, setEC] = useState(false);

  // If user data is not yet loaded, show a simple loading state
  if (!user) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading profile...</div>
      </div>
    );
  }

  const isOwn = true; // In a real app, compare user._id with current user's id from auth

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

  // Helper to safely get array values (works with both arrays and undefined)
  const safeArray = (arr: any[] | undefined) => arr ?? [];

  return (
    <div className="bg-gray-50 min-h-screen font-sans py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Hero Card */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
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
              {user.position && <p className="text-sm font-medium text-green-600 mt-0.5">{user.position}</p>}
              <div className="flex flex-wrap gap-3 mt-2 text-xs">
                {user.portfolio && (
                  <a href={`https://${user.portfolio}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-green-600 hover:underline">
                    <Globe className="w-3.5 h-3.5" /> {user.portfolio} <ExternalLink className="w-2.5 h-2.5 opacity-50" />
                  </a>
                )}
                <span className="text-gray-500">
                  Joined {new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                </span>
              </div>
            </div>

            {user.about && <p className="text-sm text-gray-600 mt-3 leading-relaxed">{user.about}</p>}
          </div>
        </div>

        {/* Stats Row (using real data) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon: <Users className="w-4 h-4" />, value: safeArray(user.connectedUsers).length, label: "Connections", color: "bg-green-500" },
            { icon: <FolderOpen className="w-4 h-4" />, value: safeArray(user.projects).length, label: "Projects", color: "bg-blue-500" },
            { icon: <Trophy className="w-4 h-4" />, value: user.totalPoints ?? 0, label: "Points", color: "bg-amber-500" },
            { icon: <Award className="w-4 h-4" />, value: safeArray(user.challengesAttended).length, label: "Challenges", color: "bg-fuchsia-500" },
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
              {safeArray(user.socialLinks).map((link, i) => (
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