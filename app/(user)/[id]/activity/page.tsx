"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Image, Trash2, Plus, X, Tag } from "lucide-react";
import ActivityCard from "@/components/ActivityCard";
import { useAppSelector } from "@/redux/hooks";
import { RootState } from "@/redux/store";

interface ActivityComment {
  _id?: string;
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
  createdBy: {
    _id: string;
    username: string;
  };
  likes: number;
  comments: ActivityComment[];
  createdAt: string;
  updatedAt: string;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}



export default function ActivityPage() {
  const userData = useAppSelector((state : RootState) => state.User.userData)
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    description: "",
    tags: "",
  });
  
  const [file, setFile] = useState<File | null>(null);
const fetchActivities = async () => {
  try {
    const response = await axios.get(
      "/api/activity"
    );

    setActivities(response.data.activities);

  } catch (error) {
    console.log(error);
  }
};

useEffect(() => {
  fetchActivities();
}, []);

  useEffect(() => {
    fetchActivities();
  }, []);

  
const handleSubmit = async () => {
  try {
    const formData = new FormData();

    formData.append("description", form.description);

    formData.append(
      "tags",
      form.tags
    );

    if (file) {
      formData.append("file", file);
    }

    const response = await axios.post(
      "/api/activity",
      formData
    );
    console.log(response.data);
    
    toast.success(response.data.message);

  } catch (error: any) {
    toast.error(
      error.response?.data?.message ||
      "Failed to post activity"
    );
  }
};
const handleLike = async (id: string) => {
  console.log("Like:", id);
};

const handleComment = (id: string) => {
  console.log("Comment:", id);
};

const handleBookmark = async (id: string) => {
  console.log("Bookmark:", id);
};

  const handleDelete = async (id: string) => {
    try {
      const { data } = await axios.delete(`/api/feed/${id}`);

      if (data.success) {
        setActivities((prev) => prev.filter((item) => item._id !== id));
        toast.success("Activity deleted");
      } else {
        toast.error(data.message || "Failed to delete activity");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete activity");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFB] font-['Inter',-apple-system,BlinkMacSystemFont,sans-serif] px-4 py-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-[#0D1B2A] tracking-[-0.8px]">
            Your Activity
          </h1>
          <p className="mt-2 text-sm text-[#64748B]">
            Post updates and view only your own activities
          </p>
        </div>

        <div className="bg-white border border-[#E8EDF2] rounded-2xl p-5 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[#0D1B2A] mb-1">
            What are you working on?
          </label>
          <textarea
            value={form.description}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
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
    type="file"
    accept="image/*"
    onChange={(e) => {
      if (e.target.files?.[0]) {
        setFile(e.target.files[0]);
      }
    }}
    className="w-full px-4 py-3 rounded-xl border border-[#E8EDF2] outline-none focus:ring-2 focus:ring-[#0EA472]/25"
  />

  {file && (
    <p className="mt-2 text-sm text-gray-500">
      Selected: {file.name}
    </p>
  )}
</div>

        <div>
          <label className="block text-sm font-medium text-[#0D1B2A] mb-1">
            Tags (comma separated)
          </label>
          <input
            type="text"
            value={form.tags}
            onChange={(e) => setForm((prev) => ({ ...prev, tags: e.target.value }))}
            placeholder="React, Next.js, MERN, AI"
            className="w-full px-4 py-3 rounded-xl border border-[#E8EDF2] outline-none focus:ring-2 focus:ring-[#0EA472]/25"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            // disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0D1B2A] text-white text-sm font-semibold hover:bg-[#1E3A5F] transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
            {/* {isSubmitting ? "Posting..." : "Post Activity"} */}
            Post Activity
          </button>
        </div>
      </form>
        </div>

        {loading ? (
          <div className="bg-white border border-[#E8EDF2] rounded-2xl p-8 text-center text-[#64748B]">
            Loading your activities...
          </div>
        ) : activities.length === 0 ? (
          <div className="bg-white border border-[#E8EDF2] rounded-2xl p-10 text-center">
            <p className="text-[#64748B]">
              No activities yet. Share your first update.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {activities.map((activity) => (
            <ActivityCard
            key={activity._id}
            activity={activity}
            currentUserId={userData?._id.toString() ?? ""}
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
  );
}