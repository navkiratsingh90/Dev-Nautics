"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { deleteComment } from "@/services/activity-apis";
import { X, Send, MoreHorizontal, Trash2, MessageCircle } from "lucide-react";
import axios from "axios";

interface CommentUser {
  _id: string;
  username: string;
}

interface Comment {
  _id: string;
  content: string;
  createdBy: CommentUser;
  createdAt: string;
}

interface CommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  activityId: string;
  comments: Comment[];
  currentUserId: string;
  darkMode: boolean;
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

const CommentModal: React.FC<CommentModalProps> = ({
  isOpen,
  onClose,
  activityId,
  comments = [],
  currentUserId,
  darkMode,
}) => {
  const [content, setContent] = useState("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [isPosting, setIsPosting] = useState(false);
  const [localComments, setLocalComments] = useState<Comment[]>(comments);
  
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    setLocalComments(comments);
  }, [comments]);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }

    setContent("");
    setOpenMenuId(null);
    setIsPosting(false);
  }, [isOpen]);
  const canPost = useMemo(
    () => content.trim().length > 0 && !isPosting,
    [content, isPosting]
  );

  if (!isOpen) return null;

  const handleSubmit = async () => {
    const trimmed = content.trim();
    if (!trimmed || isPosting) return;

    try {
      setIsPosting(true);

      const response  = await axios.post(`/api/activity/${activityId}/comment`, {
        content
      })
      console.log(response.data);
      
      const comments = response.data.activity.comments
      setLocalComments((prev) => [...prev, comments[comments.length - 1]]);
      setContent("");
      // setOpenMenuId(null);
    } catch (error) {
      console.error("Add comment error:", error);
    } finally {
      setIsPosting(false);
    }
  };
  // const getComments = async () => {
  //   try {

  //     const response  = await axios.post(`/api/activity/${activityId}/comment`)
  //     console.log(response.data);
  //     // setOpenMenuId(null);
  //   } catch (error) {
  //     console.error("Add comment error:", error);
  //   } finally {
  //   }
  // };
  const handleDeleteComment = async (commentId: string) => {
    try {
      const { data } = await axios.delete(
        `/api/activity/${activityId}/comment/${commentId}`
      );
      console.log(data);
      
      if (data.success) {
        setLocalComments((prev) =>
          prev.filter((comment) => comment._id !== commentId)
        );
        setOpenMenuId(null);
      }
    } catch (error: any) {
      console.error(error.response?.data?.message);
      
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6"
      onClick={onClose}
    >
      <div
        className={`w-full max-w-2xl rounded-3xl border shadow-2xl overflow-hidden ${
          darkMode
            ? "bg-gray-900 border-gray-800 text-white"
            : "bg-white border-[#E8EDF2] text-[#0D1B2A]"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-5 sm:px-6 py-4 border-b ${
            darkMode ? "border-gray-800" : "border-[#E8EDF2]"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#EDF7F3] border border-[#A7F3D0] flex items-center justify-center text-[#0EA472]">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h2
                className={`m-0 text-base sm:text-lg font-bold ${
                  darkMode ? "text-white" : "text-[#0D1B2A]"
                }`}
              >
                Comments
              </h2>
              <p
                className={`m-0 text-xs ${
                  darkMode ? "text-gray-400" : "text-[#64748B]"
                }`}
              >
                {localComments.length} comment
                {localComments.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`w-9 h-9 rounded-xl border flex items-center justify-center transition ${
              darkMode
                ? "border-gray-800 text-gray-300 hover:bg-gray-800"
                : "border-[#E8EDF2] text-[#64748B] hover:bg-[#F8FAFB]"
            }`}
            aria-label="Close comments"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Comments list */}
        <div className="max-h-[60vh] overflow-y-auto px-5 sm:px-6 py-5 space-y-3">
          {localComments.length === 0 ? (
            <div
              className={`rounded-2xl border px-5 py-10 text-center ${
                darkMode
                  ? "border-gray-800 bg-gray-950/40"
                  : "border-[#E8EDF2] bg-[#F8FAFB]"
              }`}
            >
              <p
                className={`m-0 text-sm font-medium ${
                  darkMode ? "text-gray-300" : "text-[#64748B]"
                }`}
              >
                No comments yet.
              </p>
              <p
                className={`m-0 mt-1 text-xs ${
                  darkMode ? "text-gray-500" : "text-[#94A3B8]"
                }`}
              >
                Start the conversation below.
              </p>
            </div>
          ) : (
            localComments.map((comment) => {
              const isOwn = comment.createdBy._id === currentUserId;

              return (
                <div
                  key={comment._id}
                  className={`flex gap-3 rounded-2xl border p-4 ${
                    darkMode
                      ? "border-gray-800 bg-gray-950/40"
                      : "border-[#E8EDF2] bg-[#F8FAFB]"
                  }`}
                >
                  <div className="w-10 h-10 rounded-2xl bg-[#EDF7F3] border border-[#A7F3D0] flex items-center justify-center text-[#0EA472] font-bold shrink-0">
                    {comment.createdBy.username.slice(0, 2).toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <Link
                          href={`/${comment.createdBy._id}`}
                          className={`block text-sm font-semibold hover:underline ${
                            darkMode ? "text-white" : "text-[#0D1B2A]"
                          }`}
                        >
                          {comment.createdBy.username}
                        </Link>
                        <p
                          className={`m-0 mt-0.5 text-xs ${
                            darkMode ? "text-gray-500" : "text-[#94A3B8]"
                          }`}
                        >
                          {formatDate(comment.createdAt)}
                        </p>
                      </div>

                      {isOwn && (
                        <div className="relative shrink-0">
                          <button
                            onClick={() =>
                              setOpenMenuId((prev) =>
                                prev === comment._id ? null : comment._id
                              )
                            }
                            className={`w-8 h-8 rounded-xl border flex items-center justify-center transition ${
                              darkMode
                                ? "border-gray-800 text-gray-300 hover:bg-gray-800"
                                : "border-[#E8EDF2] text-[#64748B] hover:bg-white"
                            }`}
                            aria-label="Comment options"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>

                          {openMenuId === comment._id && (
                            <div
                              className={`absolute right-0 mt-2 w-36 rounded-2xl border shadow-lg overflow-hidden z-10 ${
                                darkMode
                                  ? "bg-gray-900 border-gray-800"
                                  : "bg-white border-[#E8EDF2]"
                              }`}
                            >
                              <button
                                onClick={() => handleDeleteComment(comment._id)}
                                className={`w-full px-4 py-3 text-left text-sm flex items-center gap-2 transition ${
                                  darkMode
                                    ? "text-red-400 hover:bg-gray-800"
                                    : "text-red-500 hover:bg-[#F8FAFB]"
                                }`}
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <p
                      className={`mt-2 mb-0 text-[13px] leading-relaxed ${
                        darkMode ? "text-gray-300" : "text-[#64748B]"
                      }`}
                    >
                      {comment.content}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Add comment */}
        <div
          className={`px-5 sm:px-6 py-4 border-t ${
            darkMode ? "border-gray-800 bg-gray-950/30" : "border-[#E8EDF2] bg-white"
          }`}
        >
          <div className="flex items-end gap-3">
            <textarea
              ref={inputRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              placeholder="Write a comment..."
              rows={2}
              className={`flex-1 resize-none rounded-2xl border px-4 py-3 text-sm outline-none transition ${
                darkMode
                  ? "bg-gray-900 border-gray-800 text-white placeholder:text-gray-500 focus:ring-2 focus:ring-[#0EA472]/20"
                  : "bg-[#F8FAFB] border-[#E8EDF2] text-[#0D1B2A] placeholder:text-[#94A3B8] focus:ring-2 focus:ring-[#0EA472]/20"
              }`}
            />

            <button
              onClick={handleSubmit}
              disabled={!canPost}
              className={`inline-flex h-12 items-center gap-2 rounded-2xl px-5 text-sm font-semibold transition ${
                canPost
                  ? "bg-[#0D1B2A] text-white hover:bg-[#1E3A5F]"
                  : "bg-[#E8EDF2] text-[#94A3B8] cursor-not-allowed"
              }`}
            >
              <Send className="w-4 h-4" />
              {isPosting ? "Posting..." : "Post"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentModal;