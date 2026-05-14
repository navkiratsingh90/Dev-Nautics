"use client";

import React, { useState } from "react";
import { useAppSelector } from "@/redux/hooks";
import { Heart, MessageCircle, Bookmark, MoreHorizontal, Send } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export interface Post {
  id: string;
  user: { name: string; username: string; avatar?: string };
  content: { text: string; media?: string; mediaType?: "image" | "video" };
  timestamp: string;
  likes: number;
  comments: number;
  isLiked: boolean;
  isBookmarked: boolean;
}

interface PostCardProps {
  posts: Post[];
  onLike?: (postId: string) => void;
  onBookmark?: (postId: string) => void;
  onComment?: (postId: string) => void;
  onCommentSubmit?: (postId: string, comment: string) => void;
}

const PostCard: React.FC<PostCardProps> = ({
  posts,
  onLike,
  onBookmark,
  onComment,
  onCommentSubmit,
}) => {
  const darkMode = useAppSelector((state: any) => state.Theme.darkMode);
  const [commentInput, setCommentInput] = useState<{ [key: string]: string }>({});

  const cardBg = darkMode ? "bg-gray-800 border-gray-700/60" : "bg-white border-gray-200";
  const mutedText = darkMode ? "text-gray-400" : "text-gray-500";
  const headingText = darkMode ? "text-white" : "text-gray-900";

  const handleCommentChange = (postId: string, value: string) => {
    setCommentInput((prev) => ({ ...prev, [postId]: value }));
  };

  const handleSubmitComment = (postId: string) => {
    const comment = commentInput[postId]?.trim();
    if (comment && onCommentSubmit) {
      onCommentSubmit(postId, comment);
      setCommentInput((prev) => ({ ...prev, [postId]: "" }));
    }
  };

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <div key={post.id} className={`group relative rounded-2xl border overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${cardBg}`}>
          <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

          {/* Header */}
          <div className="p-5 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10">
                <AvatarFallback className="bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white font-bold">
                  {post.user.avatar || post.user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className={`text-sm font-semibold ${headingText}`}>{post.user.name}</p>
                <p className={`text-xs ${mutedText}`}>@{post.user.username} • {post.timestamp}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="rounded-full text-gray-400">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="px-5 pb-3">
            <p className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-700"} mb-3`}>{post.content.text}</p>
            {post.content.media && post.content.mediaType === "image" && (
              <div className="rounded-xl overflow-hidden mb-3">
                <img src={post.content.media} alt="Post media" className="w-full h-auto object-cover" />
              </div>
            )}
            {post.content.media && post.content.mediaType === "video" && (
              <div className="rounded-xl overflow-hidden mb-3 bg-black">
                <video src={post.content.media} className="w-full h-auto" controls />
              </div>
            )}
            <div className={`flex text-xs ${mutedText} gap-4`}>
              <span>{post.likes} likes</span>
              <span>{post.comments} comments</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="px-5 pb-2 flex border-t border-b border-gray-700/30 py-2">
            <button
              onClick={() => onLike?.(post.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg text-sm transition-all ${
                post.isLiked ? "text-rose-400" : darkMode ? "text-gray-400 hover:bg-gray-700/50" : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              <Heart className={`w-4 h-4 ${post.isLiked ? "fill-rose-400" : ""}`} />
              Like
            </button>
            <button
              onClick={() => onComment?.(post.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg text-sm transition-all ${
                darkMode ? "text-gray-400 hover:bg-gray-700/50" : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              <MessageCircle className="w-4 h-4" />
              Comment
            </button>
            <button
              onClick={() => onBookmark?.(post.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg text-sm transition-all ${
                post.isBookmarked ? "text-yellow-400" : darkMode ? "text-gray-400 hover:bg-gray-700/50" : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              <Bookmark className={`w-4 h-4 ${post.isBookmarked ? "fill-yellow-400" : ""}`} />
              Save
            </button>
          </div>

          {/* Comment input */}
          <div className="p-4 flex items-center gap-3">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white text-xs font-bold">ME</AvatarFallback>
            </Avatar>
            <div className={`flex-1 flex items-center rounded-full border ${darkMode ? "border-gray-700 bg-gray-800/50" : "border-gray-200 bg-gray-50"} px-4 py-1.5`}>
              <input
                type="text"
                placeholder="Write a comment..."
                className={`flex-1 bg-transparent outline-none text-sm ${darkMode ? "text-white placeholder-gray-500" : "text-gray-700 placeholder-gray-400"}`}
                value={commentInput[post.id] || ""}
                onChange={(e) => handleCommentChange(post.id, e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmitComment(post.id)}
              />
              {commentInput[post.id]?.trim() && (
                <button onClick={() => handleSubmitComment(post.id)} className="text-violet-400 hover:text-violet-300">
                  <Send className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PostCard;