"use client";

import React, { useEffect, useState } from "react";
import { useAppSelector } from "@/redux/hooks";
import { toast } from "sonner";
import axios from "axios";
import { useParams } from "next/navigation";
import {
  Pencil,
  Globe,
  Github,
  Mail,
  Users,
  FolderOpen,
  Loader2,
  CheckCircle,
  UserPlus,
  X,
  Copy,
  Check,
  ExternalLink,
  MessageCircle,
  Briefcase,
  GraduationCap,
  Code2,
  Trophy,
  Award,
  Layers,
  BookOpen,
  Hash,
  GitBranch,
} from "lucide-react";
import { IUser, ISkills } from "@/types/User";

const SKILL_CATEGORIES: {
  key: keyof ISkills;
  label: string;
  icon: React.ReactNode;
}[] = [
  { key: "frontend", label: "Frontend", icon: <Code2 className="w-3.5 h-3.5" /> },
  { key: "backend", label: "Backend", icon: <Layers className="w-3.5 h-3.5" /> },
  { key: "frameworks", label: "Frameworks", icon: <GitBranch className="w-3.5 h-3.5" /> },
  { key: "libraries", label: "Libraries", icon: <BookOpen className="w-3.5 h-3.5" /> },
  { key: "tools", label: "Tools", icon: <Hash className="w-3.5 h-3.5" /> },
  { key: "languages", label: "Languages", icon: <Code2 className="w-3.5 h-3.5" /> },
];

function safeArray<T>(arr?: T[] | null) {
  return arr ?? [];
}

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


export default function UserProfilePage() {
  const params = useParams();
  const userId = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const currentUser = useAppSelector((state: any) => state.User.userData) as IUser | null;
  const [profileUser, setProfileUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showEdit, setShowEdit] = useState(false);
  const [connected, setConnected] = useState(false);
  const [reqSent, setReqSent] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [emailCopied, setEmailCopied] = useState(false);

  useEffect(() => {
    if (!userId) {
      setError("No user ID provided");
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/api/user/${userId}`);
        setProfileUser(res.data.user);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  const isOwn = !!currentUser && !!profileUser && currentUser._id === profileUser._id;

  const copyEmail = async () => {
    if (!profileUser?.email) return;
    try {
      await navigator.clipboard.writeText(profileUser.email);
      setEmailCopied(true);
      setTimeout(() => setEmailCopied(false), 1500);
      toast.success("Email copied");
    } catch {
      toast.error("Could not copy email");
    }
  };

  const onConnect = async () => {
    try {
      setConnecting(true);
      await new Promise((r) => setTimeout(r, 900));
      setReqSent(true);
      toast.success("Connection request sent");
    } finally {
      setConnecting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-gray-500">Loading profile...</div>
      </div>
    );
  }

  if (error || !profileUser) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-red-500">{error || "User not found"}</div>
      </div>
    );
  }

  const user = profileUser;

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 font-sans sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
          <div className="h-32 bg-green-600 md:h-40" />

          <div className="px-6 pb-6">
            <div className="-mt-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="relative inline-block">
                <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-green-600 text-2xl font-bold text-white ring-4 ring-white shadow-md">
                  {user.username.slice(0, 2).toUpperCase()}
                </div>
                <span className="absolute bottom-1 right-1 h-4 w-4 rounded-full border-2 border-white bg-green-400" />
              </div>

              {isOwn ? (
                <button
                  onClick={() => setShowEdit(true)}
                  className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50"
                >
                  <Pencil className="w-4 h-4" />
                  Edit profile
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={onConnect}
                    disabled={connected || reqSent || connecting}
                    className={`flex items-center gap-2 rounded-xl px-5 py-2 text-sm font-semibold ${
                      connected || reqSent
                        ? "cursor-default bg-gray-100 text-gray-500"
                        : "bg-gray-900 text-white hover:bg-gray-800"
                    }`}
                  >
                    {connecting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : connected ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <UserPlus className="w-4 h-4" />
                    )}
                    {connected ? "Connected" : reqSent ? "Sent" : "Connect"}
                  </button>
                  <button className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50">
                    <MessageCircle className="w-4 h-4" />
                    Message
                  </button>
                </div>
              )}
            </div>

            <div className="mt-4">
              <h1 className="text-2xl font-bold text-gray-900">{user.username}</h1>
              <div className="mt-2 flex flex-wrap gap-3 text-xs">
                <span className="text-gray-500">
                  Joined{" "}
                  {new Date(user.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>

            {user.about && (
              <p className="mt-3 text-sm leading-relaxed text-gray-600">
                {user.about}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            {
              icon: <Users className="w-4 h-4" />,
              value: safeArray(user.connectedUsers).length,
              label: "Connections",
              color: "bg-green-500",
            },
            {
              icon: <FolderOpen className="w-4 h-4" />,
              value: safeArray(user.projects).length,
              label: "Projects",
              color: "bg-blue-500",
            },
            {
              icon: <Trophy className="w-4 h-4" />,
              value: user.totalPoints ?? 0,
              label: "Points",
              color: "bg-amber-500",
            },
            {
              icon: <Award className="w-4 h-4" />,
              value: safeArray(user.totalPendingRequests).length,
              label: "Pending",
              color: "bg-fuchsia-500",
            },
          ].map((stat, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center gap-2 rounded-2xl border border-gray-200 bg-white p-5 text-center"
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.color} text-white`}
              >
                {stat.icon}
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {Number(stat.value).toLocaleString()}
              </div>
              <div className="text-xs text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
          <div className="flex items-center gap-2 border-b border-gray-200 px-6 py-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-green-500 text-white">
              <Mail className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-gray-900">Contact Information</h2>
          </div>

          <div className="p-6">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">{user.email}</span>
              <button onClick={copyEmail} className="ml-auto rounded p-1 hover:bg-gray-100">
                {emailCopied ? (
                  <Check className="w-3.5 h-3.5 text-green-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-gray-400" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {showEdit && <EditModal user={user} onClose={() => setShowEdit(false)} />}

    </div>
  );
}