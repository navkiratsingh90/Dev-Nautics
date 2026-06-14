"use client";

import React, { useState, useRef, ChangeEvent } from "react";
import { toast } from "sonner";
import { Image, Video, X } from "lucide-react";

// Types
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

// Mock data
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
    likes: [{ _id: "u3", username: "mikej" }],
    comments: [],
    createdBy: { _id: "u2", username: "sarahc", avatar: "SC" },
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    isBookmarked: false,
  },
];

// Helper: time ago
function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

// Activity Card Component (simplified)
function ActivityCard({
  post,
  currentUserId,
  onLike,
  onBookmark,
  onDelete,
  onComment,
}: {
  post: Activity;
  currentUserId: string;
  onLike: (id: string) => void;
  onBookmark: (id: string) => void;
  onDelete: (id: string) => void;
  onComment: (id: string, text: string) => void;
}) {
  const [showComment, setShowComment] = useState(false);
  const [commentText, setCommentText] = useState("");
  const isLiked = post.likes.some((u) => u._id === currentUserId);
  const isOwn = post.createdBy._id === currentUserId;

  const handleAddComment = () => {
    if (!commentText.trim()) return;
    onComment(post._id, commentText);
    setCommentText("");
    setShowComment(false);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5">
      <div className="flex gap-3">
        <div className="w-10 h-10 rounded-xl bg-gray-200 flex items-center justify-center text-gray-700 font-bold shrink-0">
          {post.createdBy.username.slice(0, 2).toUpperCase()}
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <span className="font-semibold text-gray-900">{post.createdBy.username}</span>
              <span className="text-xs text-gray-400 ml-2">{timeAgo(post.createdAt)}</span>
            </div>
            {isOwn && (
              <button onClick={() => onDelete(post._id)} className="text-gray-400 hover:text-red-500">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <p className="text-gray-700 text-sm mt-2">{post.description}</p>
          {post.file && (
            <img src={post.file} alt="post" className="mt-3 rounded-xl w-full max-h-80 object-cover border border-gray-200" />
          )}
          <div className="flex items-center gap-4 mt-4 pt-2 border-t border-gray-100">
            <button
              onClick={() => onLike(post._id)}
              className={`flex items-center gap-1 text-xs ${isLiked ? "text-green-600" : "text-gray-500 hover:text-green-600"}`}
            >
              ❤️ {post.likes.length}
            </button>
            <button
              onClick={() => setShowComment(!showComment)}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
            >
              💬 {post.comments.length}
            </button>
            <button
              onClick={() => onBookmark(post._id)}
              className={`flex items-center gap-1 text-xs ${post.isBookmarked ? "text-green-600" : "text-gray-500 hover:text-green-600"}`}
            >
              🔖 Save
            </button>
          </div>
          {showComment && (
            <div className="mt-3 pt-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment..."
                  className="flex-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500"
                />
                <button
                  onClick={handleAddComment}
                  className="px-3 py-1.5 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-800"
                >
                  Post
                </button>
              </div>
            </div>
          )}
          {post.comments.length > 0 && (
            <div className="mt-3 space-y-2">
              {post.comments.slice(0, 2).map((c) => (
                <div key={c._id} className="text-xs text-gray-600">
                  <span className="font-medium text-gray-800">{c.createdBy.username}</span> {c.content}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Main Feed Page
export default function FeedPage() {
  const currentUserId = "currentUser";

  const [activities, setActivities] = useState<Activity[]>(MOCK_ACTIVITIES);
  const [newPostText, setNewPostText] = useState("");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLike = (postId: string) => {
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
  };

  const handleBookmark = (postId: string) => {
    setActivities((prev) =>
      prev.map((post) =>
        post._id === postId ? { ...post, isBookmarked: !post.isBookmarked } : post
      )
    );
  };

  const handleDelete = (postId: string) => {
    setActivities((prev) => prev.filter((p) => p._id !== postId));
    toast.info("Post deleted");
  };

  const handleComment = (postId: string, commentText: string) => {
    const newComment: Comment = {
      _id: Date.now().toString(),
      content: commentText,
      createdBy: { _id: currentUserId, username: "you" },
      createdAt: new Date().toISOString(),
    };
    setActivities((prev) =>
      prev.map((post) =>
        post._id === postId ? { ...post, comments: [...post.comments, newComment] } : post
      )
    );
  };

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

  const handleSubmitPost = () => {
    if (!newPostText.trim()) {
      toast.error("Please write something");
      return;
    }
    const newActivity: Activity = {
      _id: Date.now().toString(),
      description: newPostText,
      file: mediaPreview || undefined,
      likes: [],
      comments: [],
      createdBy: { _id: currentUserId, username: "currentuser" },
      createdAt: new Date().toISOString(),
      isBookmarked: false,
    };
    setActivities([newActivity, ...activities]);
    setNewPostText("");
    setMediaFile(null);
    setMediaPreview(null);
    toast.success("Post published!");
  };

  return (
    <div className="bg-gray-50 min-h-screen font-sans py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Activity Feed</h1>
          <p className="text-sm text-gray-500 mt-1">Connect, collaborate, and grow together</p>
        </div>

        {/* Create Post Card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gray-200 flex items-center justify-center text-gray-700 font-bold">
              ME
            </div>
            <div>
              <div className="font-medium text-gray-900">Current User</div>
              <div className="text-xs text-gray-500">Share what you're working on...</div>
            </div>
          </div>
          <textarea
            value={newPostText}
            onChange={(e) => setNewPostText(e.target.value)}
            placeholder="What's on your mind?"
            rows={3}
            className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-1 focus:ring-green-500"
          />
          {mediaPreview && (
            <div className="relative mt-3 rounded-xl overflow-hidden">
              <img src={mediaPreview} alt="preview" className="w-full max-h-64 object-cover" />
              <button
                onClick={removeMedia}
                className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white hover:bg-black/70"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          <div className="flex flex-wrap justify-between items-center gap-3 mt-4">
            <div className="flex gap-2">
              <label className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 text-gray-600 cursor-pointer hover:bg-gray-50">
                <Image className="w-3.5 h-3.5" />
                <input type="file" accept="image/*" onChange={handleMediaSelect} className="hidden" ref={fileInputRef} />
                Image
              </label>
              <label className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 text-gray-600 cursor-pointer hover:bg-gray-50">
                <Video className="w-3.5 h-3.5" />
                <input type="file" accept="video/*" onChange={handleMediaSelect} className="hidden" />
                Video
              </label>
            </div>
            <button
              onClick={handleSubmitPost}
              disabled={!newPostText.trim()}
              className={`px-5 py-2 rounded-xl text-sm font-medium ${
                newPostText.trim()
                  ? "bg-gray-900 text-white hover:bg-gray-800"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              Post
            </button>
          </div>
        </div>

        {/* Feed */}
        {activities.length === 0 ? (
          <div className="text-center py-12 border border-gray-200 rounded-2xl bg-white">
            <p className="text-gray-500">No activities yet. Be the first to share something!</p>
          </div>
        ) : (
          <div className="space-y-5">
            {activities.map((activity) => (
              <ActivityCard
                key={activity._id}
                post={activity}
                currentUserId={currentUserId}
                onLike={handleLike}
                onBookmark={handleBookmark}
                onDelete={handleDelete}
                onComment={handleComment}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}