"use client";

import React, { useState } from "react";
import Link from "next/link";
import { deleteComment } from "@/services/activity-apis";

// Types
interface Comment {
  _id: string;
  content: string;
  createdBy: {
    _id: string;
    username: string;
  };
  createdAt: string;
}

interface CommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  activityId: string;
  comments: Comment[];
  currentUserId: string;
  darkMode: boolean;
  onAddComment: (activityId: string, content: string) => void;
}

const CommentModal: React.FC<CommentModalProps> = ({
  isOpen,
  onClose,
  activityId,
  comments = [],
  currentUserId,
  darkMode,
  onAddComment,
}) => {
  const [content, setContent] = useState("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!content.trim()) return;
    onAddComment(activityId, content);
    setContent("");
  };

  const handleDeleteComment = async (actId: string, comId: string) => {
    await deleteComment(actId, comId);
    setOpenMenuId(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div
        className={`w-full max-w-xl rounded-xl shadow-lg ${
          darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"
        }`}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-600">
          <h2 className="font-semibold text-lg">Comments</h2>
          <button onClick={onClose} className="text-xl font-bold">
            ×
          </button>
        </div>

        {/* Comments List */}
        <div className="max-h-80 overflow-y-auto p-4 space-y-4">
          {comments.length === 0 && (
            <p className="text-sm text-gray-400">No comments yet</p>
          )}

          {comments.map((comment) => (
            <div
              key={comment._id}
              className={`flex gap-3 p-3 rounded-lg ${
                darkMode ? "bg-gray-700" : "bg-gray-100"
              }`}
            >
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                {comment.createdBy.username?.[0]?.toUpperCase()}
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <Link
                      href={`/user/${comment.createdBy._id}`}
                      className={`font-medium hover:underline ${
                        darkMode ? "text-blue-300" : "text-blue-600"
                      }`}
                    >
                      {comment.createdBy.username}
                    </Link>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Three Dot Menu */}
                  {comment.createdBy._id === currentUserId && (
                    <div className="relative">
                      <button
                        onClick={() =>
                          setOpenMenuId(
                            openMenuId === comment._id ? null : comment._id
                          )
                        }
                        className="text-xl px-2 leading-none"
                      >
                        ⋮
                      </button>

                      {openMenuId === comment._id && (
                        <div
                          className={`absolute right-0 mt-2 w-32 rounded-md shadow-lg z-10 ${
                            darkMode ? "bg-gray-700" : "bg-white"
                          }`}
                        >
                          <button
                            onClick={() =>
                              handleDeleteComment(activityId, comment._id)
                            }
                            className={`block w-full text-left px-4 py-2 text-sm text-red-500 ${
                              darkMode
                                ? "hover:bg-gray-600"
                                : "hover:bg-gray-200"
                            }`}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <p className="mt-1 text-sm">{comment.content}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Add Comment */}
        <div className="p-4 border-t border-gray-600 flex gap-2">
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write a comment..."
            className={`flex-1 px-4 py-2 rounded-full outline-none ${
              darkMode
                ? "bg-gray-700 text-white"
                : "bg-gray-100 text-gray-800"
            }`}
          />
          <button
            onClick={handleSubmit}
            className="px-4 py-2 rounded-full bg-blue-500 text-white hover:bg-blue-600"
          >
            Post
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommentModal;