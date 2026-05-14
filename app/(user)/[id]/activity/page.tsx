"use client";

import React, { useState, useRef, ChangeEvent, useEffect } from "react";
import { useAppSelector } from "@/redux/hooks";
import { toast } from "sonner";
import { Sparkles, Image, Video, X } from "lucide-react";
import { ActivityCard } from "@/components/ActivityCard";

// Types (match the ActivityCard's expected types)
interface User {
  _id: string;
  username: string;
  avatar?: string;
}

interface Comment {
  _id: string;
  content: string;
  createdBy: User;
  createdAt: string;
}

interface Activity {
  _id: string;
  description: string;
  file?: string;
  likes: User[];
  comments: Comment[];
  createdBy: User;
  createdAt: string;
  isBookmarked: boolean;
}

// Mock data – replace with real API calls
const MOCK_ACTIVITIES: Activity[] = [
  {
    _id: "1",
    description: "Just shipped a real‑time collaboration feature using WebSockets + Zustand. Latency under 50ms! 🚀",
    file: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&h=300&fit=crop",
    likes: [{ _id: "u2", username: "sarahc" }],
    comments: [],
    createdBy: { _id: "u1", username: "alexj", avatar: "AJ" },
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    isBookmarked: false,
  },
  {
    _id: "2",
    description: "Writing a deep dive on useMemo vs useCallback – most devs over‑memoize. Blog post dropping this week.",
    // file: null,
    likes: [{ _id: "u3", username: "mikej" }],
    comments: [],
    createdBy: { _id: "u2", username: "sarahc", avatar: "SC" },
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    isBookmarked: false,
  },
];

export default function FeedPage() {
  const darkMode = useAppSelector((state: any) => state.Theme.darkMode);
  const currentUserId = "currentUser"; // Replace with real auth selector

  const [activities, setActivities] = useState<Activity[]>(MOCK_ACTIVITIES);
  const [newPostText, setNewPostText] = useState("");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handlers for ActivityCard callbacks
  const handleLike = async (postId: string) => {
    // Optimistic update
    setActivities((prev) =>
      prev.map((post) => {
        if (post._id === postId) {
          const isLiked = post.likes.some((u) => u._id === currentUserId);
          return {
            ...post,
            likes: isLiked
              ? post.likes.filter((u) => u._id !== currentUserId)
              : [...post.likes, { _id: currentUserId, username: "you" }],
          };
        }
        return post;
      })
    );
    // In a real app, call API: await likeActivity(postId);
  };

  const handleBookmark = async (postId: string) => {
    setActivities((prev) =>
      prev.map((post) =>
        post._id === postId
          ? { ...post, isBookmarked: !post.isBookmarked }
          : post
      )
    );
    // await bookmarkActivity(postId);
  };

  const handleDelete = async (postId: string) => {
    setActivities((prev) => prev.filter((p) => p._id !== postId));
    // await deleteActivity(postId);
  };

  const handleComment = async (postId: string, commentText: string) => {
    // Optimistically add comment
    const newComment: Comment = {
      _id: Date.now().toString(),
      content: commentText,
      createdBy: { _id: currentUserId, username: "you" },
      createdAt: new Date().toISOString(),
    };
    setActivities((prev) =>
      prev.map((post) =>
        post._id === postId
          ? { ...post, comments: [...post.comments, newComment] }
          : post
      )
    );
    // await addComment(postId, commentText);
  };

  // Create new post
  const handleMediaSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMediaFile(file);
    setMediaPreview(URL.createObjectURL(file));
  };

  const removeMedia = () => {
    setMediaFile(null);
    setMediaPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmitPost = async () => {
    if (!newPostText.trim()) {
      toast.error("Please write something");
      return;
    }
    // Simulate API call
    const newActivity: Activity = {
      _id: Date.now().toString(),
      description: newPostText,
      file: mediaPreview || undefined,
      likes: [],
      comments: [],
      createdBy: { _id: currentUserId, username: "currentuser", avatar: "ME" },
      createdAt: new Date().toISOString(),
      isBookmarked: false,
    };
    setActivities([newActivity, ...activities]);
    setNewPostText("");
    setMediaFile(null);
    setMediaPreview(null);
    toast.success("Post published!");
  };

  // Theme tokens (consistent with other pages)
  const bg = darkMode ? "bg-gray-900 text-white" : "bg-white text-gray-800";
  const cardBg = darkMode ? "bg-gray-800 border-gray-700/60" : "bg-white border-gray-200";
  const mutedText = darkMode ? "text-gray-400" : "text-gray-500";
  const headingText = darkMode ? "text-white" : "text-gray-900";
  const accentGradient = "from-violet-500 via-fuchsia-500 to-cyan-400";

  return (
    <div className={`min-h-screen ${bg} transition-colors duration-300 font-sans`}>
      <div className="max-w-3xl mx-auto px-6 py-8 space-y-8">
        {/* Hero Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium bg-violet-500/10 border-violet-500/30 text-violet-400">
            <Sparkles className="w-3.5 h-3.5" />
            Developer Network
          </div>
          <h1 className={`text-3xl sm:text-4xl font-extrabold tracking-tight mt-2 ${headingText}`}>
            Activity Feed
          </h1>
          <p className={`text-sm mt-1 ${mutedText}`}>
            Connect, collaborate, and grow together
          </p>
        </div>

        {/* Create Post Card (always visible) */}
        <div className={`group relative rounded-2xl border transition-all duration-300 hover:shadow-xl ${cardBg}`}>
          <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${accentGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-2xl`} />
          <div className="p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white font-bold shadow-md">
                ME
              </div>
              <div>
                <p className={`text-sm font-semibold ${headingText}`}>Current User</p>
                <p className={`text-xs ${mutedText}`}>Share what you're working on...</p>
              </div>
            </div>

            <textarea
              value={newPostText}
              onChange={(e) => setNewPostText(e.target.value)}
              placeholder="What's on your mind?"
              rows={3}
              className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all focus:ring-2 focus:ring-violet-500/30 resize-none ${
                darkMode
                  ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-violet-500/60"
                  : "bg-gray-50 border-gray-200 text-gray-900 focus:border-violet-400"
              }`}
            />

            {mediaPreview && (
              <div className="relative rounded-xl overflow-hidden">
                {mediaFile?.type.startsWith("video") ? (
                  <video src={mediaPreview} controls className="w-full max-h-64 object-cover" />
                ) : (
                  <img src={mediaPreview} alt="preview" className="w-full max-h-64 object-cover" />
                )}
                <button
                  onClick={removeMedia}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex gap-2">
                <label className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer transition-all hover:scale-105 ${
                  darkMode ? "bg-gray-700 text-gray-300 hover:bg-gray-600" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}>
                  <Image className="w-3.5 h-3.5" />
                  <input type="file" accept="image/*" onChange={handleMediaSelect} className="hidden" ref={fileInputRef} />
                  Image
                </label>
                <label className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer transition-all hover:scale-105 ${
                  darkMode ? "bg-gray-700 text-gray-300 hover:bg-gray-600" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}>
                  <Video className="w-3.5 h-3.5" />
                  <input type="file" accept="video/*" onChange={handleMediaSelect} className="hidden" />
                  Video
                </label>
              </div>
              <button
                onClick={handleSubmitPost}
                disabled={!newPostText.trim()}
                className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all hover:scale-[1.02] ${
                  newPostText.trim()
                    ? `bg-gradient-to-r ${accentGradient} text-white shadow-md hover:shadow-lg`
                    : `${darkMode ? "bg-gray-700 text-gray-400" : "bg-gray-100 text-gray-400"} cursor-not-allowed`
                }`}
              >
                Post
              </button>
            </div>
          </div>
        </div>

        {/* Feed – render ActivityCard for each post */}
        {activities.length === 0 ? (
          <div className={`text-center py-12 rounded-2xl border ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
            <p className={mutedText}>No activities yet. Be the first to share something!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {activities.map((activity, idx) => (
              <ActivityCard
                key={activity._id}
                post={activity}
                darkMode={darkMode}
                currentUserId={currentUserId}
                onLike={handleLike}
                onBookmark={handleBookmark}
                onDelete={handleDelete}
                onComment={handleComment}
                index={idx}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}