"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAppSelector } from "@/redux/hooks";
import { toast } from "sonner";
import { Sparkles, Send, Image as ImageIcon, Hash } from "lucide-react";
import ActivityCard from "@/components/ActivityCard";
import axios from "axios";
import CommentModal from "@/components/Comment-Modal";

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

// ─── Main Feed Page ───────────────────────────────────────────────────────────
export default function FeedPage() {
  const user = useAppSelector((state: any) => state.User.userData);
  const currentUserId = user?._id || "";  
  const [selectedFeed, setSelectedFeed] = useState<Feed>()
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [showComments, setShowComments] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState<"all" | "following" | "bookmarks">("all");

  // Load feeds from API
  useEffect(() => {
    const fetchFeeds = async () => {
      try {
          const {data} = await axios.get('/api/activity')
          console.log(data);
          setFeeds(data.activities)
          
      } catch (error) {
        console.error(error);
        
      }
    }
    fetchFeeds()
  }, []);
  const handleOpenComments = (activityId: string) => {
    const activity = feeds.find((item) => item._id === activityId);
    if (!activity) return;
    setSelectedFeed(activity);
    setShowComments(true);
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

  const handleBookmark = async (id: string) => {
    try {
      await axios.post(`/api/activity/${id}/bookmark`);
      // Toggle local bookmark state
      // setFeeds((prev) => ([...prev , prev.]));
      const updatedFeed = feeds.map((curr) =>
        curr._id === id
          ? {
              ...curr,
              bookmarks: curr.bookmarks.includes(currentUserId)
                ? curr.bookmarks.filter(
                    (userId) => userId !== currentUserId
                  )
                : [...curr.bookmarks, currentUserId],
            }
          : curr
      );
      
      setFeeds(updatedFeed);
      toast.success("Bookmark toggled");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to bookmark");
    }
  };

  const handleDelete = async (id: string) => {
    // if (!window.confirm("Delete this activity?")) return;
    try {
      await axios.delete(`/api/activity/${id}`);
      setFeeds((prev) => prev.filter((activity) => activity._id !== id));
      toast.success("Activity deleted");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete activity");
    }
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
          {/* <CreatePostBox onPost={handleNewPost} /> */}

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
                  activity={feed!}
                  currentUserId={currentUserId}
                  isBookmarked={feed.bookmarks.includes(currentUserId)}
                  onComment={handleOpenComments}
                  onBookmark={handleBookmark}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      <CommentModal
        isOpen={showComments}
        onClose={() => setShowComments(false)}
        activityId={selectedFeed?._id || ""}
        comments={selectedFeed?.comments || []}
        currentUserId={currentUserId}
        darkMode={false}
        // onAddComment={handleAddComment}
      />
    </div>
  );
}