"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAppSelector } from "@/redux/hooks";
import { toast } from "sonner";
import { Sparkles, Send, Image as ImageIcon, Hash } from "lucide-react";
import ActivityCard from "@/components/ActivityCard";

// ─── Types (matching Mongoose schema) ────────────────────────────────────────
interface CommentUser {
  _id: string;
  username: string;
}

interface FeedComment {
  _id: string;
  content: string;
  createdBy: CommentUser;
  createdAt: string;
}

interface Feed {
  _id: string;
  description: string;
  file?: string;
  tags: string[];
  createdBy: CommentUser;
  likes: number;
  bookmarks: string[];
  comments: FeedComment[];
  createdAt: string;
  updatedAt?: string;
}

// ─── API service functions (replace with actual imports) ─────────────────────
// import { getFeeds, createFeed, likeFeed, commentFeed, bookmarkFeed, deleteFeed } from "@/services/feedApis";

// Mock API functions – replace these with real API calls
async function fetchFeeds(): Promise<Feed[]> {
  // GET /api/feeds
  return [
    {
      _id: "1",
      description: "Just shipped a real‑time collaboration feature using WebSockets + Zustand. Latency under 50ms! 🚀",
      file: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&h=300&fit=crop",
      tags: ["react", "websockets"],
      createdBy: { _id: "u1", username: "alexj" },
      likes: 3,
      bookmarks: [],
      comments: [
        { _id: "c1", content: "Awesome work!", createdBy: { _id: "u2", username: "sarahc" }, createdAt: new Date().toISOString() },
      ],
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      _id: "2",
      description: "Writing a deep dive on useMemo vs useCallback – most devs over‑memoize. Blog post dropping this week.",
      tags: ["react", "performance"],
      createdBy: { _id: "u2", username: "sarahc" },
      likes: 5,
      bookmarks: [],
      comments: [],
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    },
  ];
}

async function createFeed(description: string, file?: string, tags?: string[]): Promise<Feed> {
  // POST /api/feeds
  return {
    _id: Date.now().toString(),
    description,
    file,
    tags: tags || [],
    createdBy: { _id: "current", username: "you" },
    likes: 0,
    bookmarks: [],
    comments: [],
    createdAt: new Date().toISOString(),
  };
}

async function likeFeed(feedId: string): Promise<{ likes: number }> {
  // POST /api/feeds/:id/like
  return { likes: 1 };
}

async function commentFeed(feedId: string, content: string): Promise<FeedComment> {
  // POST /api/feeds/:id/comment
  return { _id: Date.now().toString(), content, createdBy: { _id: "current", username: "you" }, createdAt: new Date().toISOString() };
}

async function bookmarkFeed(feedId: string): Promise<{ bookmarks: string[] }> {
  // POST /api/feeds/:id/bookmark
  return { bookmarks: ["current"] };
}

async function deleteFeed(feedId: string): Promise<void> {
  // DELETE /api/feeds/:id
}

// ─── Create Post Box ──────────────────────────────────────────────────────────
function CreatePostBox({ onPost }: { onPost: (text: string, file?: string, tags?: string[]) => void }) {
  const [text, setText] = useState("");
  const [file, setFile] = useState("");
  const [tags, setTags] = useState("");
  const [focused, setFocused] = useState(false);

  function handlePost() {
    if (!text.trim()) return;
    const tagArray = tags.split(",").map(t => t.trim()).filter(Boolean);
    onPost(text.trim(), file || undefined, tagArray.length > 0 ? tagArray : undefined);
    setText("");
    setFile("");
    setTags("");
    setFocused(false);
    toast.success("Post shared! 🎉");
  }

  return (
    <div className={`bg-white border border-[#E8EDF2] rounded-2xl p-4 transition-all ${focused ? "shadow-md border-[#0EA472]/30" : ""}`}>
      <div className="flex gap-3">
        <div className="w-9 h-9 rounded-xl bg-gray-200 flex items-center justify-center text-gray-700 font-bold text-sm shrink-0">ME</div>
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
            <div className="space-y-3 mt-3 pt-3 border-t border-[#E8EDF2]">
              <input
                type="text"
                value={file}
                onChange={e => setFile(e.target.value)}
                placeholder="Image URL (optional)"
                className="w-full px-3 py-2 border border-[#E8EDF2] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#0EA472]/25"
              />
              <input
                type="text"
                value={tags}
                onChange={e => setTags(e.target.value)}
                placeholder="Tags (comma separated, e.g., React, Next.js)"
                className="w-full px-3 py-2 border border-[#E8EDF2] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#0EA472]/25"
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <button className="p-1.5 rounded-lg text-[#64748B] hover:bg-[#F8FAFB] transition"><ImageIcon className="w-4 h-4" /></button>
                  <button className="p-1.5 rounded-lg text-[#64748B] hover:bg-[#F8FAFB] transition"><Hash className="w-4 h-4" /></button>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => { setFocused(false); setText(""); setFile(""); setTags(""); }} className="px-3 py-1.5 rounded-xl text-xs font-medium border border-[#E8EDF2] text-[#64748B] hover:bg-[#F8FAFB]">Cancel</button>
                  <button onClick={handlePost} disabled={!text.trim()} className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold transition ${text.trim() ? "bg-[#0D1B2A] text-white hover:bg-[#1E3A5F] shadow-sm" : "bg-[#F8FAFB] text-[#94A3B8] cursor-not-allowed"}`}>
                    <Send className="w-3 h-3" /> Post
                  </button>
                </div>
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
  const user = useAppSelector((state: any) => state.User.userData);
  const currentUserId = user?._id || "";

  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<"all" | "following" | "bookmarks">("all");

  // Load feeds from API
  useEffect(() => {
    fetchFeeds()
      .then(data => {
        setFeeds(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        toast.error("Failed to load feed");
        setLoading(false);
      });
  }, []);

  // ── Handlers (with optimistic updates) ──
  const handleLike = async (feedId: string) => {
    setFeeds(prev =>
      prev.map(f => {
        if (f._id !== feedId) return f;
        const alreadyLiked = f.bookmarks.includes(currentUserId);
        return {
          ...f,
          likes: alreadyLiked ? f.likes - 1 : f.likes + 1,
          bookmarks: alreadyLiked
            ? f.bookmarks.filter(id => id !== currentUserId)
            : [...f.bookmarks, currentUserId],
        };
      })
    );
    try {
      await likeFeed(feedId);
    } catch {
      // Revert optimistic update
      setFeeds(prev =>
        prev.map(f => {
          if (f._id !== feedId) return f;
          const wasLiked = f.bookmarks.includes(currentUserId);
          return {
            ...f,
            likes: wasLiked ? f.likes - 1 : f.likes + 1,
            bookmarks: wasLiked
              ? [...f.bookmarks, currentUserId]
              : f.bookmarks.filter(id => id !== currentUserId),
          };
        })
      );
      toast.error("Failed to like post");
    }
  };

  const handleComment = async (feedId: string) => {
    const content = window.prompt("Write a comment:");
    if (!content) return;
    const tempComment: FeedComment = {
      _id: Date.now().toString(),
      content,
      createdBy: { _id: currentUserId, username: "you" },
      createdAt: new Date().toISOString(),
    };
    setFeeds(prev =>
      prev.map(f =>
        f._id === feedId ? { ...f, comments: [...f.comments, tempComment] } : f
      )
    );
    try {
      const realComment = await commentFeed(feedId, content);
      setFeeds(prev =>
        prev.map(f =>
          f._id === feedId
            ? { ...f, comments: f.comments.map(c => c._id === tempComment._id ? realComment : c) }
            : f
        )
      );
    } catch {
      setFeeds(prev =>
        prev.map(f =>
          f._id === feedId
            ? { ...f, comments: f.comments.filter(c => c._id !== tempComment._id) }
            : f
        )
      );
      toast.error("Failed to post comment");
    }
  };

  const handleBookmark = async (feedId: string) => {
    setFeeds(prev =>
      prev.map(f => {
        if (f._id !== feedId) return f;
        const isBookmarked = f.bookmarks.includes(currentUserId);
        return {
          ...f,
          bookmarks: isBookmarked
            ? f.bookmarks.filter(id => id !== currentUserId)
            : [...f.bookmarks, currentUserId],
        };
      })
    );
    try {
      await bookmarkFeed(feedId);
    } catch {
      setFeeds(prev =>
        prev.map(f => {
          if (f._id !== feedId) return f;
          const wasBookmarked = f.bookmarks.includes(currentUserId);
          return {
            ...f,
            bookmarks: wasBookmarked
              ? [...f.bookmarks, currentUserId]
              : f.bookmarks.filter(id => id !== currentUserId),
          };
        })
      );
      toast.error("Failed to bookmark");
    }
  };

  const handleDelete = async (feedId: string) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    const originalFeeds = feeds;
    setFeeds(prev => prev.filter(f => f._id !== feedId));
    try {
      await deleteFeed(feedId);
      toast.success("Post deleted");
    } catch {
      setFeeds(originalFeeds);
      toast.error("Failed to delete post");
    }
  };

  const handleNewPost = async (text: string, file?: string, tags?: string[]) => {
    const newFeed = await createFeed(text, file, tags);
    setFeeds(prev => [newFeed, ...prev]);
  };

  // Filter feeds
  const filteredFeeds = feeds.filter(feed => {
    if (activeFilter === "bookmarks") {
      return feed.bookmarks.includes(currentUserId);
    }
    // For "following" you would need a list of followed users; placeholder – returns all
    return true;
  });

  if (!user || loading) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-gray-500">{loading ? "Loading feed..." : "Loading profile..."}</div>
      </div>
    );
  }

  return (
    <div className="font-['Inter',-apple-system,sans-serif] bg-[#F8FAFB] min-h-screen">
      {/* Hero Banner */}
      <div className="border-b border-[#E8EDF2] bg-white px-6 py-6">
        <div className="max-w-4xl mx-auto"> {/* Reduced max-width since sidebar is removed */}
          <div className="inline-flex items-center gap-1.5 bg-[#EDF7F3] border border-[#A7F3D0] rounded-full py-1 px-3 mb-3">
            <Sparkles className="w-3 h-3 text-[#0EA472]" />
            <span className="text-xs font-medium text-[#047857]">Dev community activity feed</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#0D1B2A] tracking-tight">Social <span className="text-[#0EA472]">Activity</span></h1>
          <p className="text-sm text-[#64748B] mt-1">Latest from your network of developers</p>
        </div>
      </div>

      {/* Main feed column (centered) */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="space-y-5">
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
                {tab === "bookmarks"
                  ? `Saved${feeds.filter(f => f.bookmarks.includes(currentUserId)).length > 0 ? ` (${feeds.filter(f => f.bookmarks.includes(currentUserId)).length})` : ""}`
                  : tab}
              </button>
            ))}
          </div>

          {filteredFeeds.length === 0 ? (
            <div className="bg-white border border-[#E8EDF2] rounded-2xl p-12 text-center">
              <div className="text-4xl mb-3">📭</div>
              <h3 className="text-base font-bold text-[#0D1B2A] mb-1">Nothing here yet</h3>
              <p className="text-sm text-[#64748B]">
                {activeFilter === "bookmarks" ? "You haven't saved any posts yet." : "No posts in your feed yet."}
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {filteredFeeds.map(feed => (
                <ActivityCard
                  key={feed._id}
                  activity={feed}
                  currentUserId={currentUserId}
                  isBookmarked={feed.bookmarks.includes(currentUserId)}
                  onLike={handleLike}
                  onComment={handleComment}
                  onBookmark={handleBookmark}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}