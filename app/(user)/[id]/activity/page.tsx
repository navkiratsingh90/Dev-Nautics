"use client";

import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import {
  Bookmark,
  Heart,
  Image as ImageIcon,
  MessageCircle,
  Plus,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import CommentModal from "@/components/Comment-Modal";

interface ActivityComment {
  _id: string;
  content: string;
  createdBy: {
    _id: string;
    username: string;
  };
  createdAt: string;
}

interface Activity {
  _id: string;
  description: string;
  file?: string;
  tags: string[];
  likes: number;
  comments: ActivityComment[];
  createdBy: {
    _id: string;
    username: string;
  };
  createdAt: string;
  updatedAt?: string;
}

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

function ActivityCard({
  activity,
  currentUserId,
  isBookmarked,
  onLike,
  onComment,
  onBookmark,
  onDelete,
}: {
  activity: Activity;
  currentUserId: string;
  isBookmarked: boolean;
  onLike: (id: string) => void;
  onComment: (id: string) => void;
  onBookmark: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const isOwnPost = activity.createdBy._id === currentUserId;

  return (
    <div className="bg-white border border-[#E8EDF2] rounded-2xl shadow-sm overflow-hidden">
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-[#EDF7F3] border border-[#A7F3D0] flex items-center justify-center text-[#0EA472] font-bold shrink-0">
              {activity.createdBy.username.slice(0, 2).toUpperCase()}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="m-0 text-sm font-semibold text-[#0D1B2A]">
                  {activity.createdBy.username}
                </p>
                <span className="text-[11px] text-[#94A3B8]">
                  {timeAgo(activity.createdAt)}
                </span>
              </div>
              <p className="m-0 text-[12px] text-[#64748B]">Shared an activity</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onBookmark(activity._id)}
              className={`inline-flex items-center justify-center w-9 h-9 rounded-xl border transition ${
                isBookmarked
                  ? "bg-[#EDF7F3] border-[#A7F3D0] text-[#0EA472]"
                  : "bg-white border-[#E8EDF2] text-[#64748B] hover:bg-[#F8FAFB]"
              }`}
              aria-label="Bookmark post"
            >
              <Bookmark
                className="w-4 h-4"
                fill={isBookmarked ? "currentColor" : "none"}
              />
            </button>

            {isOwnPost && (
              <button
                onClick={() => onDelete(activity._id)}
                className="inline-flex items-center justify-center w-9 h-9 rounded-xl border border-[#E8EDF2] text-[#64748B] hover:text-red-500 hover:bg-red-50 transition"
                aria-label="Delete post"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <p className="mt-4 text-[13.5px] text-[#64748B] leading-relaxed whitespace-pre-wrap">
          {activity.description}
        </p>

        {activity.file && (
          <div className="mt-4">
            <img
              src={activity.file}
              alt="activity"
              className="w-full max-h-96 object-cover rounded-xl border border-[#E8EDF2]"
            />
          </div>
        )}

        {activity.tags?.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {activity.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F8FAFB] border border-[#E8EDF2] text-[11px] text-[#64748B]"
              >
                <Tag className="w-3 h-3 text-[#0EA472]" />
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="mt-5 pt-4 border-t border-[#E8EDF2] flex items-center justify-between gap-3">
          <div className="flex items-center gap-4 text-xs text-[#64748B]">
            <span>{activity.likes} likes</span>
            <button
              onClick={() => onComment(activity._id)}
              className="hover:text-[#0EA472] transition"
            >
              {activity.comments?.length || 0} comments
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onLike(activity._id)}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-[#E8EDF2] text-xs font-medium text-[#0D1B2A] hover:bg-[#F8FAFB] transition"
            >
              <Heart className="w-4 h-4 text-[#0EA472]" />
              Like
            </button>

            <button
              onClick={() => onComment(activity._id)}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-[#E8EDF2] text-xs font-medium text-[#0D1B2A] hover:bg-[#F8FAFB] transition"
            >
              <MessageCircle className="w-4 h-4 text-[#0EA472]" />
              Comment
            </button>
          </div>
        </div>

        {activity.comments?.length > 0 && (
          <div className="mt-4 space-y-2">
            {activity.comments.slice(0, 2).map((comment, idx) => (
              <div
                key={comment._id || idx}
                className="bg-[#F8FAFB] border border-[#E8EDF2] rounded-xl px-3 py-2"
              >
                <p className="m-0 text-[12px] leading-relaxed text-[#64748B]">
                  <span className="font-semibold text-[#0D1B2A]">
                    {comment.createdBy.username}
                  </span>{" "}
                  {comment.content}
                </p>
              </div>
            ))}

            {activity.comments.length > 2 && (
              <button
                onClick={() => onComment(activity._id)}
                className="text-[12px] font-medium text-[#0EA472] hover:underline"
              >
                View all {activity.comments.length} comments
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ActivityPage() {
  const darkMode = false
  const currentUserId = useSelector((state: any) => state.User.userData?._id) || "";

  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);

  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());

  const [form, setForm] = useState({
    description: "",
    tags: "",
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/api/activity");

      if (data.success) {
        setActivities(data.activities || []);
      } else {
        toast.error(data.message || "Failed to load activities");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to load activities");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const resetForm = () => {
    setForm({ description: "", tags: "" });
    setSelectedFile(null);
    setPreviewUrl("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleCreateActivity = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.description.trim()) {
      toast.error("Please write something");
      return;
    }

    try {
      const fd = new FormData();
      fd.append("description", form.description.trim());
      fd.append("tags", form.tags);

      if (selectedFile) {
        fd.append("file", selectedFile);
      }

      const { data } = await axios.post("/api/activity", fd, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (data.success) {
        setActivities((prev) => [data.activity, ...prev]);
        toast.success("Activity posted successfully");
        resetForm();
        setShowForm(false);
      } else {
        toast.error(data.message || "Failed to create activity");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create activity");
    }
  };

  const handleLike = (id: string) => {
    setActivities((prev) =>
      prev.map((activity) =>
        activity._id === id
          ? { ...activity, likes: activity.likes + 1 }
          : activity
      )
    );
  };

  const handleBookmark = (id: string) => {
    setBookmarks((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleDelete = async (id: string) => {
    const ok = window.confirm("Delete this activity?");
    if (!ok) return;

    try {
      await axios.delete(`/api/activity/${id}`);
      setActivities((prev) => prev.filter((activity) => activity._id !== id));
      toast.success("Activity deleted");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete activity");
    }
  };

  const handleOpenComments = (activityId: string) => {
    const activity = activities.find((item) => item._id === activityId);
    if (!activity) return;

    setSelectedActivity(activity);
    setShowComments(true);
  };

  const handleAddComment = async (activityId: string, content: string) => {
    const trimmed = content.trim();
    if (!trimmed) return;

    const newComment: ActivityComment = {
      _id: `temp-${Date.now()}`,
      content: trimmed,
      createdBy: {
        _id: currentUserId,
        username: "you",
      },
      createdAt: new Date().toISOString(),
    };

    setActivities((prev) =>
      prev.map((activity) =>
        activity._id === activityId
          ? { ...activity, comments: [...activity.comments, newComment] }
          : activity
      )
    );

    setSelectedActivity((prev) =>
      prev && prev._id === activityId
        ? { ...prev, comments: [...prev.comments, newComment] }
        : prev
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    setPreviewUrl("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div
      className={`min-h-screen pt-16 font-['Inter',-apple-system,BlinkMacSystemFont,sans-serif] ${
        darkMode ? "bg-gray-950 text-white" : "bg-[#F8FAFB] text-[#0D1B2A]"
      }`}
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1
              className={`text-3xl font-extrabold tracking-[-0.8px] ${
                darkMode ? "text-white" : "text-[#0D1B2A]"
              }`}
            >
              Your Activity
            </h1>
            <p className={`mt-1 text-sm ${darkMode ? "text-gray-400" : "text-[#64748B]"}`}>
              Post updates and view only your own activities
            </p>
          </div>

          <button
            onClick={() => setShowForm((prev) => !prev)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0D1B2A] text-white text-sm font-semibold hover:bg-[#1E3A5F] transition"
          >
            <Plus className="w-4 h-4" />
            New Activity
          </button>
        </div>

        {showForm && (
          <div
            className={`rounded-2xl border shadow-sm p-5 ${
              darkMode ? "bg-gray-900 border-gray-800" : "bg-white border-[#E8EDF2]"
            }`}
          >
            <form onSubmit={handleCreateActivity} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-[#0D1B2A]"}`}>
                  What are you working on?
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, description: e.target.value }))
                  }
                  rows={4}
                  placeholder="Share your latest project, progress, or thoughts..."
                  className={`w-full px-4 py-3 rounded-xl border outline-none resize-none focus:ring-2 focus:ring-[#0EA472]/25 ${
                    darkMode
                      ? "bg-gray-950 border-gray-800 text-white placeholder:text-gray-500"
                      : "bg-white border-[#E8EDF2] text-[#0D1B2A] placeholder:text-[#94A3B8]"
                  }`}
                  required
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-[#0D1B2A]"}`}>
                  Upload Image
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className={`w-full px-4 py-3 rounded-xl border outline-none focus:ring-2 focus:ring-[#0EA472]/25 ${
                    darkMode
                      ? "bg-gray-950 border-gray-800 text-white file:text-white"
                      : "bg-white border-[#E8EDF2] text-[#0D1B2A]"
                  }`}
                />
                {selectedFile && (
                  <p className={`mt-2 text-xs ${darkMode ? "text-gray-400" : "text-[#64748B]"}`}>
                    Selected: {selectedFile.name}
                  </p>
                )}
              </div>

              {previewUrl && (
                <div className="relative rounded-xl overflow-hidden border border-[#E8EDF2]">
                  <img
                    src={previewUrl}
                    alt="preview"
                    className="w-full max-h-72 object-cover"
                  />
                  <button
                    type="button"
                    onClick={removeSelectedFile}
                    className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-[#0D1B2A]"}`}>
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={form.tags}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, tags: e.target.value }))
                  }
                  placeholder="React, Next.js, MERN, AI"
                  className={`w-full px-4 py-3 rounded-xl border outline-none focus:ring-2 focus:ring-[#0EA472]/25 ${
                    darkMode
                      ? "bg-gray-950 border-gray-800 text-white placeholder:text-gray-500"
                      : "bg-white border-[#E8EDF2] text-[#0D1B2A] placeholder:text-[#94A3B8]"
                  }`}
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className={`px-5 py-2.5 rounded-xl border text-sm font-semibold ${
                    darkMode
                      ? "border-gray-800 text-gray-300 hover:bg-gray-800"
                      : "border-[#E8EDF2] text-[#64748B] hover:bg-[#F8FAFB]"
                  }`}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0D1B2A] text-white text-sm font-semibold hover:bg-[#1E3A5F] transition"
                >
                  <ImageIcon className="w-4 h-4" />
                  Post Activity
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div
            className={`rounded-2xl border p-10 text-center ${
              darkMode ? "bg-gray-900 border-gray-800" : "bg-white border-[#E8EDF2]"
            }`}
          >
            Loading your activities...
          </div>
        ) : activities.length === 0 ? (
          <div
            className={`rounded-2xl border p-10 text-center ${
              darkMode ? "bg-gray-900 border-gray-800" : "bg-white border-[#E8EDF2]"
            }`}
          >
            <p className={darkMode ? "text-gray-400" : "text-[#64748B]"}>
              No activities yet. Share your first update.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {activities.map((activity) => (
              <ActivityCard
                key={activity._id}
                activity={activity}
                currentUserId={currentUserId}
                isBookmarked={bookmarks.has(activity._id)}
                onLike={handleLike}
                onComment={handleOpenComments}
                onBookmark={handleBookmark}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      <CommentModal
        isOpen={showComments}
        onClose={() => setShowComments(false)}
        activityId={selectedActivity?._id || ""}
        comments={selectedActivity?.comments || []}
        currentUserId={currentUserId}
        darkMode={darkMode}
        onAddComment={handleAddComment}
      />
    </div>
  );
}