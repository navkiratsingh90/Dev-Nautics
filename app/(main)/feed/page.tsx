"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAppSelector } from "@/redux/hooks";
import { toast } from "sonner";
import {
  Bell, TrendingUp, Users, Sparkles, Send,
  Image as ImageIcon, Hash, ChevronRight, X
} from "lucide-react";
import { ActivityCard, Activity } from "@/components/ActivityCard";
// import { getActivities } from "@/services/activityApis";

// ─── Mock data ────────────────────────────────────────────────────────────────
const dummyPosts: Activity[] = [
  { _id: "1", description: "Just finished building a full-stack e-commerce app with Next.js, Tailwind, and MongoDB. Deployed on Vercel! 🚀 The hardest part was getting the cart sync working with optimistic UI — but Zustand made it surprisingly clean.", file: "https://images.unsplash.com/photo-1557821552-17105176677c?w=600&h=400&fit=crop", likes: [{ _id: "u2", username: "emilyc" }, { _id: "u3", username: "miked" }, { _id: "u5", username: "sarahj" }], comments: [{ _id: "c1", content: "Great work! Would love to see the repo.", createdBy: { _id: "u2", username: "emilyc" }, createdAt: "2026-03-23T10:30:00Z" }, { _id: "c2", content: "What did you use for authentication?", createdBy: { _id: "u3", username: "miked" }, createdAt: "2026-03-23T12:15:00Z" }], createdBy: { _id: "u1", username: "alexj" }, createdAt: "2026-03-23T09:45:00Z", isBookmarked: false },
  { _id: "2", description: "TypeScript 5.0 decorators are finally stable and the ergonomics are 10x better than the old experimental ones. If you're still avoiding decorators — it's time to revisit. The `const` type parameters alone are worth the upgrade. 🎯", file: undefined, likes: [{ _id: "u4", username: "chrisl" }, { _id: "u6", username: "tomb" }], comments: [{ _id: "c3", content: "Decorators are finally stable — this is huge for NestJS devs.", createdBy: { _id: "u4", username: "chrisl" }, createdAt: "2026-03-22T18:20:00Z" }], createdBy: { _id: "u7", username: "priyap" }, createdAt: "2026-03-22T16:10:00Z", isBookmarked: true },
  { _id: "3", description: "Refactored my portfolio to use Framer Motion for smooth page transitions. The layout animations with `AnimatePresence` took some trial and error but the result is buttery smooth. Check the live demo — link in bio! ✨", file: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&h=400&fit=crop", likes: [{ _id: "u1", username: "alexj" }, { _id: "u3", username: "miked" }, { _id: "u5", username: "sarahj" }, { _id: "u8", username: "lucaw" }], comments: [{ _id: "c4", content: "The animations are super smooth! Any tips on performance?", createdBy: { _id: "u1", username: "alexj" }, createdAt: "2026-03-21T22:45:00Z" }, { _id: "c5", content: "Exactly what I needed for my project!", createdBy: { _id: "u5", username: "sarahj" }, createdAt: "2026-03-22T09:30:00Z" }], createdBy: { _id: "u9", username: "jessicaw" }, createdAt: "2026-03-21T14:20:00Z", isBookmarked: false },
  { _id: "4", description: "Just launched `react-hot-key` — an open-source library for easily adding keyboard shortcuts to React apps. Zero dependencies, full TypeScript support, and an intuitive API. Star it if it helps! ⚡", file: undefined, likes: [{ _id: "u2", username: "emilyc" }, { _id: "u4", username: "chrisl" }, { _id: "u6", username: "tomb" }, { _id: "u7", username: "priyap" }], comments: [{ _id: "c6", content: "Starred! This will save me so much time.", createdBy: { _id: "u2", username: "emilyc" }, createdAt: "2026-03-20T15:10:00Z" }], createdBy: { _id: "u10", username: "davidk" }, createdAt: "2026-03-20T11:30:00Z", isBookmarked: false },
  { _id: "5", description: "Wrote a deep dive on optimizing React renders with `useMemo` and `useCallback`. The TL;DR: don't prematurely memoize — it actually hurts perf in most cases. Profile first, optimize second. Link in bio 📝", file: "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=600&h=400&fit=crop", likes: [{ _id: "u1", username: "alexj" }, { _id: "u3", username: "miked" }, { _id: "u8", username: "lucaw" }], comments: [{ _id: "c8", content: "This is gold! Sharing with my whole team.", createdBy: { _id: "u1", username: "alexj" }, createdAt: "2026-03-19T19:20:00Z" }], createdBy: { _id: "u11", username: "rachelb" }, createdAt: "2026-03-19T10:00:00Z", isBookmarked: false },
];

const PENDING_REQUESTS = [
  { id: 1, name: "Emma Davis",  username: "emdavis", avatar: "ED", mutual: 12 },
  { id: 2, name: "David Kim",   username: "davidk",  avatar: "DK", mutual:  8 },
  { id: 3, name: "Lisa Wang",   username: "lisaw",   avatar: "LW", mutual: 15 },
];

const SUGGESTED = [
  { id: "s1", name: "Tom Wilson",    username: "tomw",    avatar: "TW", mutual:  5, role: "Backend Dev"    },
  { id: "s2", name: "Sophie Brown",  username: "sophieb", avatar: "SB", mutual:  9, role: "ML Engineer"    },
  { id: "s3", name: "Chris Lee",     username: "chrisl",  avatar: "CL", mutual:  3, role: "Frontend Dev"   },
  { id: "s4", name: "Ana Petrova",   username: "anap",    avatar: "AP", mutual:  7, role: "Full-Stack Dev"  },
];

const TRENDING = [
  { name: "ReactJS",         posts: "12.5K", color: "cyan"    },
  { name: "TypeScript",      posts: "8.7K",  color: "blue"    },
  { name: "TailwindCSS",     posts: "6.3K",  color: "violet"  },
  { name: "NextJS",          posts: "5.9K",  color: "fuchsia" },
  { name: "WebDevelopment",  posts: "15.2K", color: "amber"   },
  { name: "OpenSource",      posts: "4.1K",  color: "green"   },
];

const trendingColors: Record<string, string> = {
  cyan:    "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
  blue:    "bg-blue-500/15 text-blue-400 border-blue-500/30",
  violet:  "bg-violet-500/15 text-violet-400 border-violet-500/30",
  fuchsia: "bg-fuchsia-500/15 text-fuchsia-400 border-fuchsia-500/30",
  amber:   "bg-amber-500/15 text-amber-400 border-amber-500/30",
  green:   "bg-green-500/15 text-green-400 border-green-500/30",
};

const avatarGradients = [
  "from-violet-500 to-fuchsia-500", "from-cyan-500 to-blue-500",
  "from-fuchsia-500 to-pink-500",   "from-amber-500 to-orange-500",
  "from-green-500 to-emerald-500",  "from-blue-500 to-violet-500",
  "from-rose-500 to-fuchsia-500",   "from-teal-500 to-cyan-500",
];
function hashIdx(s: string | number) {
  const str = String(s);
  return str.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % avatarGradients.length;
}

function useInView(threshold = 0.08) {
  const ref = useRef<HTMLDivElement>(null);
  const [v, setV] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setV(true); o.disconnect(); } }, { threshold });
    o.observe(el); return () => o.disconnect();
  }, [threshold]);
  return { ref, inView: v };
}

// ─── Create Post Box ──────────────────────────────────────────────────────────
function CreatePostBox({ darkMode, onPost }: { darkMode: boolean; onPost: (text: string) => void }) {
  const [text, setText] = useState("");
  const [focused, setFocused] = useState(false);
  const accentGradient = "from-violet-500 via-fuchsia-500 to-cyan-400";
  const cardBg  = darkMode ? "bg-gray-800 border-gray-700/60" : "bg-white border-gray-200";
  const mutedText = darkMode ? "text-gray-500" : "text-gray-400";

  function handlePost() {
    if (!text.trim()) return;
    onPost(text.trim());
    setText("");
    setFocused(false);
    toast.success("Post shared! 🎉");
  }

  return (
    <div className={`rounded-2xl border p-4 transition-all ${cardBg} ${focused ? darkMode ? "border-violet-500/50 shadow-lg shadow-violet-500/5" : "border-violet-300 shadow-lg shadow-violet-100" : ""}`}>
      <div className="flex gap-3">
        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${avatarGradients[0]} flex items-center justify-center text-xs font-bold text-white shrink-0`}>ME</div>
        <div className="flex-1">
          <textarea
            rows={focused ? 3 : 1}
            value={text}
            onChange={e => setText(e.target.value)}
            onFocus={() => setFocused(true)}
            placeholder="Share something with the dev community…"
            className={`w-full text-sm outline-none resize-none transition-all bg-transparent ${darkMode ? "text-white placeholder-gray-600" : "text-gray-900 placeholder-gray-400"}`}
          />
          {focused && (
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-700/30">
              <div className="flex items-center gap-1.5">
                <button className={`p-1.5 rounded-lg transition-colors ${darkMode ? "text-gray-500 hover:bg-gray-700 hover:text-gray-300" : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"}`}>
                  <ImageIcon className="w-4 h-4" />
                </button>
                <button className={`p-1.5 rounded-lg transition-colors ${darkMode ? "text-gray-500 hover:bg-gray-700 hover:text-gray-300" : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"}`}>
                  <Hash className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => { setFocused(false); setText(""); }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${darkMode ? "border-gray-700 text-gray-500 hover:bg-gray-700" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}>
                  Cancel
                </button>
                <button onClick={handlePost} disabled={!text.trim()}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${text.trim()
                    ? `bg-gradient-to-r ${accentGradient} text-white shadow-sm shadow-violet-500/20 hover:shadow-violet-500/40 hover:scale-[1.02]`
                    : `${darkMode ? "bg-gray-700 text-gray-500" : "bg-gray-100 text-gray-400"} cursor-not-allowed`
                  }`}>
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

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function FeedPage() {
  const darkMode      = useAppSelector((state: any) => state.Theme.darkMode);
  const currentUserId = "3"; // replace with: useAppSelector(s => s.Auth.userId)

  const [posts, setPosts]         = useState<Activity[]>(dummyPosts);
  const [connected, setConnected] = useState<Set<string>>(new Set());
  const [mounted, setMounted]     = useState(false);
  const [activeFilter, setActiveFilter] = useState<"all" | "following" | "bookmarks">("all");
  const heroRef = useInView();

  useEffect(() => { setMounted(true); }, []);

  function handleLike(id: string) {
    setPosts(p => p.map(post => post._id === id
      ? { ...post, likes: post.likes.some(u => u._id === currentUserId) ? post.likes.filter(u => u._id !== currentUserId) : [...post.likes, { _id: currentUserId, username: "you" }] }
      : post));
  }
  function handleDelete(id: string) { setPosts(p => p.filter(post => post._id !== id)); }
  function handleBookmark(id: string) { setPosts(p => p.map(post => post._id === id ? { ...post, isBookmarked: !post.isBookmarked } : post)); }
  function handleNewPost(text: string) {
    const newPost: Activity = { _id: Date.now().toString(), description: text, file: undefined, likes: [], comments: [], createdBy: { _id: currentUserId, username: "you" }, createdAt: new Date().toISOString(), isBookmarked: false };
    setPosts(p => [newPost, ...p]);
  }

  const filteredPosts = posts.filter(p => activeFilter === "bookmarks" ? p.isBookmarked : true);

  // ── Theme tokens ──────────────────────────────────────────────────────────
  const bg          = darkMode ? "bg-gray-900 text-white"        : "bg-white text-gray-800";
  const cardBg      = darkMode ? "bg-gray-800 border-gray-700/60": "bg-white border-gray-200";
  const surfaceBg   = darkMode ? "bg-gray-800/40"                : "bg-gray-50";
  const mutedText   = darkMode ? "text-gray-400"                 : "text-gray-500";
  const headingText = darkMode ? "text-white"                    : "text-gray-900";
  const divider     = darkMode ? "border-gray-700/60"            : "border-gray-100";
  const accentGradient = "from-violet-500 via-fuchsia-500 to-cyan-400";
  const accentText     = "bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent";

  return (
    <div className={`min-h-screen ${bg} transition-colors duration-300 font-sans`}>

      {/* ── HERO BANNER ── */}
      <section className={`relative overflow-hidden border-b ${divider}`}>
        <div className="absolute inset-0 opacity-[0.025] pointer-events-none" style={{ backgroundImage: `linear-gradient(${darkMode ? "#fff" : "#000"} 1px, transparent 1px), linear-gradient(90deg, ${darkMode ? "#fff" : "#000"} 1px, transparent 1px)`, backgroundSize: "50px 50px" }} />
        <div className="absolute top-0 left-1/4 w-72 h-40 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 right-1/4 w-56 h-40 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div ref={heroRef.ref} className="relative max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5"
            style={{ opacity: heroRef.inView ? 1 : 0, transform: heroRef.inView ? "none" : "translateY(16px)", transition: "opacity 0.6s ease, transform 0.6s ease" }}>
            <div>
              <div className={`inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full border text-xs font-medium ${darkMode ? "bg-violet-500/10 border-violet-500/30 text-violet-300" : "bg-violet-50 border-violet-200 text-violet-600"}`}>
                <Sparkles className="w-3 h-3" /> Dev community activity feed
              </div>
              <h1 className={`text-3xl md:text-4xl font-extrabold tracking-tight ${headingText}`}>
                Social <span className={accentText}>Activity</span>
              </h1>
              <p className={`text-sm mt-1 ${mutedText}`}>Latest from your network of developers</p>
            </div>

            <Link href="/inbox">
              <button className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all hover:scale-[1.02] ${darkMode ? "border-gray-700 text-gray-300 hover:bg-gray-800 hover:border-violet-500/40" : "border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-violet-300"}`}>
                <Bell className="w-4 h-4" />
                Pending Requests
                {PENDING_REQUESTS.length > 0 && (
                  <span className={`absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center bg-gradient-to-br ${accentGradient} text-white shadow-sm`}>
                    {PENDING_REQUESTS.length}
                  </span>
                )}
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── BODY ── */}
      <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col lg:flex-row gap-8">

        {/* ── MAIN FEED ── */}
        <div className="flex-1 min-w-0 space-y-5">

          {/* Create post */}
          <CreatePostBox darkMode={darkMode} onPost={handleNewPost} />

          {/* Feed filter tabs */}
          <div className={`flex items-center gap-1 p-1 rounded-xl ${darkMode ? "bg-gray-800" : "bg-gray-100"} w-fit`}>
            {(["all", "following", "bookmarks"] as const).map(tab => (
              <button key={tab} onClick={() => setActiveFilter(tab)}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                  activeFilter === tab
                    ? `bg-gradient-to-r ${accentGradient} text-white shadow-sm`
                    : `${darkMode ? "text-gray-400 hover:text-gray-200" : "text-gray-500 hover:text-gray-700"}`
                }`}>
                {tab === "bookmarks" ? `Saved${posts.filter(p => p.isBookmarked).length > 0 ? ` (${posts.filter(p => p.isBookmarked).length})` : ""}` : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Posts */}
          {filteredPosts.length === 0 ? (
            <div className={`rounded-2xl border p-12 text-center ${cardBg}`}>
              <div className="text-4xl mb-3">📭</div>
              <h3 className={`text-base font-bold mb-1 ${headingText}`}>Nothing here yet</h3>
              <p className={`text-sm ${mutedText}`}>{activeFilter === "bookmarks" ? "You haven't saved any posts yet." : "No posts in your feed yet."}</p>
            </div>
          ) : (
            <div className="space-y-5">
              {filteredPosts.map((post, i) => (
                <ActivityCard key={post._id} post={post} darkMode={darkMode} currentUserId={currentUserId}
                  onLike={handleLike} onDelete={handleDelete} onBookmark={handleBookmark} index={i} />
              ))}
            </div>
          )}
        </div>

        {/* ── SIDEBAR ── */}
        <aside className="lg:w-80 shrink-0 space-y-5">

          {/* Pending requests preview */}
          {PENDING_REQUESTS.length > 0 && (
            <div className={`rounded-2xl border overflow-hidden ${cardBg}`}>
              <div className={`flex items-center justify-between px-5 py-4 border-b ${divider}`}>
                <div className="flex items-center gap-2.5">
                  <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${accentGradient} flex items-center justify-center`}>
                    <Bell className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className={`text-sm font-bold ${headingText}`}>Connection requests</span>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r ${accentGradient} text-white`}>{PENDING_REQUESTS.length}</span>
                </div>
                <Link href="/inbox">
                  <span className={`text-xs font-medium transition-colors ${darkMode ? "text-violet-400 hover:text-violet-300" : "text-violet-600 hover:text-violet-700"} cursor-pointer`}>View all →</span>
                </Link>
              </div>
              <div className="p-4 space-y-3">
                {PENDING_REQUESTS.slice(0, 2).map((r, i) => (
                  <div key={r.id} className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${avatarGradients[hashIdx(r.id)]} flex items-center justify-center text-[11px] font-bold text-white shrink-0`}>{r.avatar}</div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-semibold truncate ${headingText}`}>{r.name}</p>
                      <p className={`text-[11px] ${mutedText}`}>{r.mutual} mutual</p>
                    </div>
                    <div className="flex gap-1.5">
                      <button className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:scale-105 transition-all`}>✓</button>
                      <button className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg border transition-all hover:scale-105 ${darkMode ? "border-gray-600 text-gray-400 hover:bg-gray-700" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}>✕</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Suggested developers */}
          <div className={`rounded-2xl border overflow-hidden ${cardBg}`}>
            <div className={`flex items-center justify-between px-5 py-4 border-b ${divider}`}>
              <div className="flex items-center gap-2.5">
                <div className={`w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center`}>
                  <Users className="w-3.5 h-3.5 text-white" />
                </div>
                <span className={`text-sm font-bold ${headingText}`}>Suggested developers</span>
              </div>
            </div>
            <div className="p-4 space-y-3">
              {SUGGESTED.map((u, i) => {
                const isConnected = connected.has(u.id);
                return (
                  <div key={u.id} className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${avatarGradients[hashIdx(u.id)]} flex items-center justify-center text-[11px] font-bold text-white shrink-0`}>{u.avatar}</div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-semibold truncate ${headingText}`}>{u.name}</p>
                      <p className={`text-[11px] ${mutedText}`}>{u.mutual} mutual · {u.role}</p>
                    </div>
                    <button
                      onClick={() => setConnected(prev => { const n = new Set(prev); isConnected ? n.delete(u.id) : n.add(u.id); return n; })}
                      className={`text-[10px] font-semibold px-3 py-1.5 rounded-xl border transition-all hover:scale-105 whitespace-nowrap ${
                        isConnected
                          ? `${darkMode ? "border-green-500/40 bg-green-500/10 text-green-400" : "border-green-300 bg-green-50 text-green-600"}`
                          : `${darkMode ? "border-violet-500/40 text-violet-400 hover:bg-violet-500/10" : "border-violet-200 text-violet-600 hover:bg-violet-50"}`
                      }`}>
                      {isConnected ? "✓ Connected" : "+ Connect"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Trending topics */}
          <div className={`rounded-2xl border overflow-hidden ${cardBg}`}>
            <div className={`flex items-center gap-2.5 px-5 py-4 border-b ${divider}`}>
              <div className={`w-7 h-7 rounded-lg bg-gradient-to-br from-fuchsia-500 to-amber-400 flex items-center justify-center`}>
                <TrendingUp className="w-3.5 h-3.5 text-white" />
              </div>
              <span className={`text-sm font-bold ${headingText}`}>Trending topics</span>
            </div>
            <div className="p-4 flex flex-wrap gap-2">
              {TRENDING.map((t, i) => (
                <button key={t.name}
                  className={`flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-full border transition-all hover:scale-[1.04] hover:-translate-y-0.5 ${trendingColors[t.color]}`}>
                  <Hash className="w-3 h-3" />{t.name}
                  <span className={`opacity-60 text-[10px]`}>{t.posts}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Quick nav */}
          <div className={`rounded-2xl border overflow-hidden ${cardBg}`}>
            <div className="p-4 space-y-1">
              {[
                { label: "Find Similar People",     href: "/people",                 emoji: "👥" },
                { label: "Project Collaboration",   href: "/project-collaboration",  emoji: "🤝" },
                { label: "Chatrooms",               href: "/chatrooms",              emoji: "💬" },
                { label: "Events",                  href: "/events",                 emoji: "📅" },
                { label: "Code & Decode",           href: "/code-decode",            emoji: "🧩" },
              ].map(({ label, href, emoji }) => (
                <Link key={href} href={href}>
                  <div className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all hover:scale-[1.01] ${darkMode ? "text-gray-400 hover:bg-gray-700/50 hover:text-white" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"} cursor-pointer`}>
                    <span className="flex items-center gap-2.5">
                      <span className="text-base">{emoji}</span>{label}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 opacity-40" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>

      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}