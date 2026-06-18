"use client";

import React, { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { useAppSelector } from "@/redux/hooks";
import axios from "axios";
import { toast } from "sonner";
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
import ActivityCard from "@/components/ActivityCard";

// ─── Types (aligned with your backend) ──────────────────────────────────────
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
  bookmark: string[];
  updatedAt?: string;
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function ActivityPage() {
  const params = useParams();
  const userId = params?.id as string; // from /profile/[id]/activity

  const currentUser = useAppSelector((state: any) => state.User.userData);
  const currentUserId = currentUser?._id || "";

  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  // Determine if the viewed profile belongs to the logged‑in user
  const isOwn = currentUser && currentUser._id === userId;

  // ── Fetch activities for the given userId ──────────────────────────────────
  const fetchActivities = async () => {
    if (!userId) {
      setError("No user ID provided");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const { data } = await axios.get(`/api/user/${userId}/activity`);
      if (data.success) {
        setActivities(data.activities || []);
      } else {
        setError(data.message || "Failed to load activities");
      }
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to load activities");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [userId]);

  // ── Form helpers ──────────────────────────────────────────────────────────
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
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (data.success) {
        // Refresh activities
        await fetchActivities();
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

  const handleBookmark = async (id: string) => {
    try {
      await axios.post(`/api/activity/${id}/bookmark`);
      // Toggle local bookmark state
      setBookmarks((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        return newSet;
      });
      toast.success("Bookmark toggled");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to bookmark");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this activity?")) return;
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

    try {
      await axios.post(`/api/activity/${activityId}/comment`, { content: trimmed });
    } catch {
      // Revert optimistic update
      setActivities((prev) =>
        prev.map((activity) =>
          activity._id === activityId
            ? {
                ...activity,
                comments: activity.comments.filter(
                  (c) => c._id !== newComment._id
                ),
              }
            : activity
        )
      );
      toast.error("Failed to add comment");
    }
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

  // ── Loading / error states ──────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading activities...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="bg-[#F8FAFB] min-h-screen font-['Inter',-apple-system,sans-serif] pt-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-[-0.8px] text-[#0D1B2A]">
              {isOwn ? "Your Activity" : "User Activity"}
            </h1>
            <p className="mt-1 text-sm text-[#64748B]">
              {isOwn
                ? "Post updates and view only your own activities"
                : "Activities posted by this user"}
            </p>
          </div>

          {isOwn && (
            <button
              onClick={() => setShowForm((prev) => !prev)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0D1B2A] text-white text-sm font-semibold hover:bg-[#1E3A5F] transition"
            >
              <Plus className="w-4 h-4" />
              New Activity
            </button>
          )}
        </div>

        {isOwn && showForm && (
          <div className="rounded-2xl border shadow-sm p-5 bg-white border-[#E8EDF2]">
            <form onSubmit={handleCreateActivity} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#0D1B2A] mb-1">
                  What are you working on?
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, description: e.target.value }))
                  }
                  rows={4}
                  placeholder="Share your latest project, progress, or thoughts..."
                  className="w-full px-4 py-3 rounded-xl border border-[#E8EDF2] outline-none resize-none focus:ring-2 focus:ring-[#0EA472]/25"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#0D1B2A] mb-1">
                  Upload Image
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full px-4 py-3 rounded-xl border border-[#E8EDF2] outline-none focus:ring-2 focus:ring-[#0EA472]/25"
                />
                {selectedFile && (
                  <p className="mt-2 text-xs text-[#64748B]">
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
                <label className="block text-sm font-medium text-[#0D1B2A] mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={form.tags}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, tags: e.target.value }))
                  }
                  placeholder="React, Next.js, MERN, AI"
                  className="w-full px-4 py-3 rounded-xl border border-[#E8EDF2] outline-none focus:ring-2 focus:ring-[#0EA472]/25"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className="px-5 py-2.5 rounded-xl border border-[#E8EDF2] text-sm font-semibold text-[#64748B] hover:bg-[#F8FAFB]"
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

        {activities.length === 0 ? (
          <div className="rounded-2xl border p-10 text-center bg-white border-[#E8EDF2]">
            <p className="text-[#64748B]">
              {isOwn
                ? "No activities yet. Share your first update."
                : "No activities posted by this user yet."}
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
        darkMode={false}
        // onAddComment={handleAddComment}
      />
    </div>
  );
}