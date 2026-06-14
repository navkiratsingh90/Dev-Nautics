"use client";

import React, { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Bell, TrendingUp, Users, Sparkles, Send,
  Image as ImageIcon, Hash, ChevronRight, Heart, MessageCircle, Bookmark, Trash2,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Comment {
  _id: string;
  content: string;
  createdBy: { _id: string; username: string };
  createdAt: string;
}

interface Activity {
  _id: string;
  description: string;
  file?: string;
  likes: { _id: string; username: string }[];
  comments: Comment[];
  createdBy: { _id: string; username: string };
  createdAt: string;
  isBookmarked: boolean;
}

// ─── Mock Data (unchanged) ────────────────────────────────────────────────────
const dummyPosts: Activity[] = [
  { _id: "1", description: "Just finished building a full-stack e-commerce app with Next.js, Tailwind, and MongoDB. Deployed on Vercel! 🚀 The hardest part was getting the cart sync working with optimistic UI — but Zustand made it surprisingly clean.", file: "https://images.unsplash.com/photo-1557821552-17105176677c?w=600&h=400&fit=crop", likes: [{ _id: "u2", username: "emilyc" }, { _id: "u3", username: "miked" }, { _id: "u5", username: "sarahj" }], comments: [{ _id: "c1", content: "Great work! Would love to see the repo.", createdBy: { _id: "u2", username: "emilyc" }, createdAt: "2026-03-23T10:30:00Z" }, { _id: "c2", content: "What did you use for authentication?", createdBy: { _id: "u3", username: "miked" }, createdAt: "2026-03-23T12:15:00Z" }], createdBy: { _id: "u1", username: "alexj" }, createdAt: "2026-03-23T09:45:00Z", isBookmarked: false },
  { _id: "2", description: "TypeScript 5.0 decorators are finally stable and the ergonomics are 10x better than the old experimental ones. If you're still avoiding decorators — it's time to revisit. The `const` type parameters alone are worth the upgrade. 🎯", file: undefined, likes: [{ _id: "u4", username: "chrisl" }, { _id: "u6", username: "tomb" }], comments: [{ _id: "c3", content: "Decorators are finally stable — this is huge for NestJS devs.", createdBy: { _id: "u4", username: "chrisl" }, createdAt: "2026-03-22T18:20:00Z" }], createdBy: { _id: "u7", username: "priyap" }, createdAt: "2026-03-22T16:10:00Z", isBookmarked: true },
  { _id: "3", description: "Refactored my portfolio to use Framer Motion for smooth page transitions. The layout animations with `AnimatePresence` took some trial and error but the result is buttery smooth. Check the live demo — link in bio! ✨", file: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&h=400&fit=crop", likes: [{ _id: "u1", username: "alexj" }, { _id: "u3", username: "miked" }, { _id: "u5", username: "sarahj" }, { _id: "u8", username: "lucaw" }], comments: [{ _id: "c4", content: "The animations are super smooth! Any tips on performance?", createdBy: { _id: "u1", username: "alexj" }, createdAt: "2026-03-21T22:45:00Z" }, { _id: "c5", content: "Exactly what I needed for my project!", createdBy: { _id: "u5", username: "sarahj" }, createdAt: "2026-03-22T09:30:00Z" }], createdBy: { _id: "u9", username: "jessicaw" }, createdAt: "2026-03-21T14:20:00Z", isBookmarked: false },
  { _id: "4", description: "Just launched `react-hot-key` — an open-source library for easily adding keyboard shortcuts to React apps. Zero dependencies, full TypeScript support, and an intuitive API. Star it if it helps! ⚡", file: undefined, likes: [{ _id: "u2", username: "emilyc" }, { _id: "u4", username: "chrisl" }, { _id: "u6", username: "tomb" }, { _id: "u7", username: "priyap" }], comments: [{ _id: "c6", content: "Starred! This will save me so much time.", createdBy: { _id: "u2", username: "emilyc" }, createdAt: "2026-03-20T15:10:00Z" }], createdBy: { _id: "u10", username: "davidk" }, createdAt: "2026-03-20T11:30:00Z", isBookmarked: false },
  { _id: "5", description: "Wrote a deep dive on optimizing React renders with `useMemo` and `useCallback`. The TL;DR: don't prematurely memoize — it actually hurts perf in most cases. Profile first, optimize second. Link in bio 📝", file: "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=600&h=400&fit=crop", likes: [{ _id: "u1", username: "alexj" }, { _id: "u3", username: "miked" }, { _id: "u8", username: "lucaw" }], comments: [{ _id: "c8", content: "This is gold! Sharing with my whole team.", createdBy: { _id: "u1", username: "alexj" }, createdAt: "2026-03-19T19:20:00Z" }], createdBy: { _id: "u11", username: "rachelb" }, createdAt: "2026-03-19T10:00:00Z", isBookmarked: false },
];

const PENDING_REQUESTS = [
  { id: 1, name: "Emma Davis", username: "emdavis", avatar: "ED", mutual: 12 },
  { id: 2, name: "David Kim", username: "davidk", avatar: "DK", mutual: 8 },
  { id: 3, name: "Lisa Wang", username: "lisaw", avatar: "LW", mutual: 15 },
];

const SUGGESTED = [
  { id: "s1", name: "Tom Wilson", username: "tomw", avatar: "TW", mutual: 5, role: "Backend Dev" },
  { id: "s2", name: "Sophie Brown", username: "sophieb", avatar: "SB", mutual: 9, role: "ML Engineer" },
  { id: "s3", name: "Chris Lee", username: "chrisl", avatar: "CL", mutual: 3, role: "Frontend Dev" },
  { id: "s4", name: "Ana Petrova", username: "anap", avatar: "AP", mutual: 7, role: "Full-Stack Dev" },
];

const TRENDING = [
  { name: "ReactJS", posts: "12.5K", color: "cyan" },
  { name: "TypeScript", posts: "8.7K", color: "blue" },
  { name: "TailwindCSS", posts: "6.3K", color: "violet" },
  { name: "NextJS", posts: "5.9K", color: "fuchsia" },
  { name: "WebDevelopment", posts: "15.2K", color: "amber" },
  { name: "OpenSource", posts: "4.1K", color: "green" },
];

const avatarGradients = [
  "from-[#0EA472] to-[#059669]", "from-blue-500 to-cyan-500", "from-fuchsia-500 to-pink-500",
  "from-amber-500 to-orange-500", "from-violet-500 to-purple-500", "from-rose-500 to-pink-500",
];

function hashIdx(s: string | number) {
  const str = String(s);
  return str.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % avatarGradients.length;
}

// ─── Post Card Component (inline, matches reference card style) ───────────────
function PostCard({ post, currentUserId, onLike, onDelete, onBookmark }: {
  post: Activity;
  currentUserId: string;
  onLike: (id: string) => void;
  onDelete: (id: string) => void;
  onBookmark: (id: string) => void;
}) {
  const isLiked = post.likes.some(l => l._id === currentUserId);
  const isOwn = post.createdBy._id === currentUserId;

  return (
    <div className="bg-white border border-[#E8EDF2] rounded-2xl p-5 transition-all hover:shadow-md">
      {/* Header: avatar + name + date */}
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${avatarGradients[hashIdx(post.createdBy._id)]} flex items-center justify-center text-white font-bold text-sm shrink-0`}>
          {post.createdBy.username.slice(0, 2).toUpperCase()}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-[#0D1B2A]">{post.createdBy.username}</span>
            <span className="text-xs text-[#94A3B8]">· {new Date(post.createdAt).toLocaleDateString()}</span>
          </div>
          <p className="text-[13.5px] text-[#64748B] leading-relaxed mt-1.5">{post.description}</p>
          {post.file && (
            <img src={post.file} alt="post visual" className="mt-3 rounded-xl w-full max-h-80 object-cover border border-[#E8EDF2]" />
          )}
          {/* Actions row */}
          <div className="flex items-center gap-4 mt-4 pt-2 border-t border-[#E8EDF2]">
            <button onClick={() => onLike(post._id)} className={`flex items-center gap-1.5 text-xs font-medium transition ${isLiked ? "text-[#0EA472]" : "text-[#64748B] hover:text-[#0EA472]"}`}>
              <Heart className="w-4 h-4" fill={isLiked ? "#0EA472" : "none"} /> {post.likes.length}
            </button>
            <button className="flex items-center gap-1.5 text-xs font-medium text-[#64748B] hover:text-[#0EA472] transition">
              <MessageCircle className="w-4 h-4" /> {post.comments.length}
            </button>
            <button onClick={() => onBookmark(post._id)} className={`flex items-center gap-1.5 text-xs font-medium transition ${post.isBookmarked ? "text-[#0EA472]" : "text-[#64748B] hover:text-[#0EA472]"}`}>
              <Bookmark className="w-4 h-4" fill={post.isBookmarked ? "#0EA472" : "none"} /> Save
            </button>
            {isOwn && (
              <button onClick={() => onDelete(post._id)} className="flex items-center gap-1.5 text-xs font-medium text-[#64748B] hover:text-red-500 transition ml-auto">
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            )}
          </div>
          {/* Comments preview (simplified) */}
          {post.comments.length > 0 && (
            <div className="mt-3 pt-2 border-t border-[#E8EDF2]">
              <p className="text-xs text-[#64748B]">
                <span className="font-semibold text-[#0D1B2A]">{post.comments[0].createdBy.username}</span> {post.comments[0].content}
              </p>
              {post.comments.length > 1 && (
                <button className="text-xs text-[#0EA472] mt-1 hover:underline">View all {post.comments.length} comments →</button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Create Post Box ──────────────────────────────────────────────────────────
function CreatePostBox({ onPost }: { onPost: (text: string) => void }) {
  const [text, setText] = useState("");
  const [focused, setFocused] = useState(false);

  function handlePost() {
    if (!text.trim()) return;
    onPost(text.trim());
    setText("");
    setFocused(false);
    toast.success("Post shared! 🎉");
  }

  return (
    <div className={`bg-white border border-[#E8EDF2] rounded-2xl p-4 transition-all ${focused ? "shadow-md border-[#0EA472]/30" : ""}`}>
      <div className="flex gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0EA472] to-[#059669] flex items-center justify-center text-white font-bold text-sm shrink-0">
          ME
        </div>
        <div className="flex-1">
          <textarea
            rows={focused ? 3 : 1}
            value={text}
            onChange={e => setText(e.target.value)}
            onFocus={() => setFocused(true)}
            placeholder="Share something with the dev community…"
            className="w-full text-sm outline-none resize-none transition-all bg-transparent text-[#0D1B2A] placeholder:text-[#94A3B8]"
          />
          {focused && (
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#E8EDF2]">
              <div className="flex items-center gap-1.5">
                <button className="p-1.5 rounded-lg text-[#64748B] hover:bg-[#F8FAFB] transition">
                  <ImageIcon className="w-4 h-4" />
                </button>
                <button className="p-1.5 rounded-lg text-[#64748B] hover:bg-[#F8FAFB] transition">
                  <Hash className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => { setFocused(false); setText(""); }} className="px-3 py-1.5 rounded-xl text-xs font-medium border border-[#E8EDF2] text-[#64748B] hover:bg-[#F8FAFB] transition">
                  Cancel
                </button>
                <button onClick={handlePost} disabled={!text.trim()} className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold transition ${text.trim() ? "bg-[#0D1B2A] text-white hover:bg-[#1E3A5F] shadow-sm" : "bg-[#F8FAFB] text-[#94A3B8] cursor-not-allowed"}`}>
                  <Send className="w-3 h-3" /> Post
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Feed Page ───────────────────────────────────────────────────────────
export default function FeedPage() {
  const currentUserId = "3"; // replace with actual user ID from Redux
  const [posts, setPosts] = useState<Activity[]>(dummyPosts);
  const [connected, setConnected] = useState<Set<string>>(new Set());
  const [activeFilter, setActiveFilter] = useState<"all" | "following" | "bookmarks">("all");

  function handleLike(id: string) {
    setPosts(p => p.map(post => post._id === id
      ? { ...post, likes: post.likes.some(u => u._id === currentUserId) ? post.likes.filter(u => u._id !== currentUserId) : [...post.likes, { _id: currentUserId, username: "you" }] }
      : post));
  }
  function handleDelete(id: string) { setPosts(p => p.filter(post => post._id !== id)); }
  function handleBookmark(id: string) { setPosts(p => p.map(post => post._id === id ? { ...post, isBookmarked: !post.isBookmarked } : post)); }
  function handleNewPost(text: string) {
    const newPost: Activity = {
      _id: Date.now().toString(),
      description: text,
      file: undefined,
      likes: [],
      comments: [],
      createdBy: { _id: currentUserId, username: "you" },
      createdAt: new Date().toISOString(),
      isBookmarked: false,
    };
    setPosts(p => [newPost, ...p]);
  }

  const filteredPosts = posts.filter(p => activeFilter === "bookmarks" ? p.isBookmarked : true);

  return (
    <div className="font-['Inter',-apple-system,sans-serif] bg-[#F8FAFB] min-h-screen">

      {/* ── Hero Banner (matches reference style) ── */}
      <div className="border-b border-[#E8EDF2] bg-white px-6 py-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-[#EDF7F3] border border-[#A7F3D0] rounded-full py-1 px-3 mb-3">
              <Sparkles className="w-3 h-3 text-[#0EA472]" />
              <span className="text-xs font-medium text-[#047857]">Dev community activity feed</span>
            </div>
            <h1 className="text-3xl font-extrabold text-[#0D1B2A] tracking-tight">
              Social <span className="text-[#0EA472]">Activity</span>
            </h1>
            <p className="text-sm text-[#64748B] mt-1">Latest from your network of developers</p>
          </div>
          <Link href="/inbox">
            <button className="relative flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#E8EDF2] bg-white text-sm font-medium text-[#0D1B2A] hover:shadow-md transition">
              <Bell className="w-4 h-4" />
              Pending Requests
              {PENDING_REQUESTS.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center bg-[#0EA472] text-white shadow-sm">
                  {PENDING_REQUESTS.length}
                </span>
              )}
            </button>
          </Link>
        </div>
      </div>

      {/* ── Main 2-column layout ── */}
      <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col lg:flex-row gap-8">

        {/* LEFT COLUMN: Feed */}
        <div className="flex-1 min-w-0 space-y-5">
          <CreatePostBox onPost={handleNewPost} />

          {/* Filter tabs */}
          <div className="flex items-center gap-1 p-1 bg-[#F8FAFB] border border-[#E8EDF2] rounded-xl w-fit">
            {(["all", "following", "bookmarks"] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveFilter(tab)}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                  activeFilter === tab
                    ? "bg-[#0D1B2A] text-white shadow-sm"
                    : "text-[#64748B] hover:text-[#0D1B2A]"
                }`}
              >
                {tab === "bookmarks" ? `Saved${posts.filter(p => p.isBookmarked).length > 0 ? ` (${posts.filter(p => p.isBookmarked).length})` : ""}` : tab}
              </button>
            ))}
          </div>

          {/* Posts list */}
          {filteredPosts.length === 0 ? (
            <div className="bg-white border border-[#E8EDF2] rounded-2xl p-12 text-center">
              <div className="text-4xl mb-3">📭</div>
              <h3 className="text-base font-bold text-[#0D1B2A] mb-1">Nothing here yet</h3>
              <p className="text-sm text-[#64748B]">{activeFilter === "bookmarks" ? "You haven't saved any posts yet." : "No posts in your feed yet."}</p>
            </div>
          ) : (
            <div className="space-y-5">
              {filteredPosts.map(post => (
                <PostCard
                  key={post._id}
                  post={post}
                  currentUserId={currentUserId}
                  onLike={handleLike}
                  onDelete={handleDelete}
                  onBookmark={handleBookmark}
                />
              ))}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Sidebar */}
        <aside className="lg:w-80 shrink-0 space-y-5">

          {/* Pending requests preview */}
          {PENDING_REQUESTS.length > 0 && (
            <div className="bg-white border border-[#E8EDF2] rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#E8EDF2]">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#0EA472] to-[#059669] flex items-center justify-center text-white">
                    <Bell className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-sm font-bold text-[#0D1B2A]">Connection requests</span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#0EA472] text-white">{PENDING_REQUESTS.length}</span>
                </div>
                <Link href="/inbox">
                  <span className="text-xs font-medium text-[#0EA472] hover:underline cursor-pointer">View all →</span>
                </Link>
              </div>
              <div className="p-4 space-y-3">
                {PENDING_REQUESTS.slice(0, 2).map(r => (
                  <div key={r.id} className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${avatarGradients[hashIdx(r.id)]} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                      {r.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-[#0D1B2A] truncate">{r.name}</p>
                      <p className="text-[11px] text-[#64748B]">{r.mutual} mutual</p>
                    </div>
                    <div className="flex gap-1.5">
                      <button className="text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-[#0EA472] text-white hover:bg-[#059669] transition">✓</button>
                      <button className="text-[10px] font-semibold px-2.5 py-1 rounded-lg border border-[#E8EDF2] text-[#64748B] hover:bg-[#F8FAFB] transition">✕</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Suggested developers */}
          <div className="bg-white border border-[#E8EDF2] rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E8EDF2]">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white">
                  <Users className="w-3.5 h-3.5" />
                </div>
                <span className="text-sm font-bold text-[#0D1B2A]">Suggested developers</span>
              </div>
            </div>
            <div className="p-4 space-y-3">
              {SUGGESTED.map(u => {
                const isConnected = connected.has(u.id);
                return (
                  <div key={u.id} className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${avatarGradients[hashIdx(u.id)]} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                      {u.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-[#0D1B2A] truncate">{u.name}</p>
                      <p className="text-[11px] text-[#64748B]">{u.mutual} mutual · {u.role}</p>
                    </div>
                    <button
                      onClick={() => setConnected(prev => { const n = new Set(prev); isConnected ? n.delete(u.id) : n.add(u.id); return n; })}
                      className={`text-[10px] font-semibold px-3 py-1.5 rounded-xl border transition whitespace-nowrap ${
                        isConnected
                          ? "border-[#0EA472] bg-[#EDF7F3] text-[#0EA472]"
                          : "border-[#E8EDF2] text-[#0D1B2A] hover:bg-[#F8FAFB]"
                      }`}
                    >
                      {isConnected ? "✓ Connected" : "+ Connect"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Trending topics */}
          <div className="bg-white border border-[#E8EDF2] rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E8EDF2]">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-fuchsia-500 to-amber-500 flex items-center justify-center text-white">
                  <TrendingUp className="w-3.5 h-3.5" />
                </div>
                <span className="text-sm font-bold text-[#0D1B2A]">Trending topics</span>
              </div>
            </div>
            <div className="p-4 flex flex-wrap gap-2">
              {TRENDING.map(t => (
                <button
                  key={t.name}
                  className="flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-full border border-[#E8EDF2] bg-[#F8FAFB] text-[#0D1B2A] hover:shadow-sm transition"
                >
                  <Hash className="w-3 h-3 text-[#0EA472]" /> {t.name}
                  <span className="text-[10px] text-[#64748B]">{t.posts}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Quick navigation */}
          <div className="bg-white border border-[#E8EDF2] rounded-2xl overflow-hidden">
            <div className="p-4 space-y-1">
              {[
                { label: "Find Similar People", href: "/people", emoji: "👥" },
                { label: "Project Collaboration", href: "/project-collaboration", emoji: "🤝" },
                { label: "Chatrooms", href: "/chatrooms", emoji: "💬" },
                { label: "Events", href: "/events", emoji: "📅" },
                { label: "Code & Decode", href: "/code-decode", emoji: "🧩" },
              ].map(item => (
                <Link key={item.href} href={item.href}>
                  <div className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-[#64748B] hover:bg-[#F8FAFB] hover:text-[#0D1B2A] transition cursor-pointer">
                    <span className="flex items-center gap-2.5">
                      <span className="text-base">{item.emoji}</span> {item.label}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 opacity-40" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}