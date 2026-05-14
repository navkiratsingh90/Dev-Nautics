// "use client";

// import React, { useEffect, useState } from "react";
// import { useSelector } from "react-redux";
// import { Heart, Send } from "lucide-react";

// import {
//   addComment,
//   deleteActivity,
//   getActivities,
//   likeActivity,
// } from "@/services/activityApis";
// import CommentModal from "./CommentModal";

// // Types
// interface User {
//   _id: string;
//   username: string;
//   email?: string;
//   avatar?: string;
// }

// interface Comment {
//   _id: string;
//   text: string;
//   createdBy: User;
//   createdAt: string;
// }

// interface Activity {
//   _id: string;
//   description: string;
//   file?: string;
//   likes: User[];
//   comments: Comment[];
//   createdBy: User;
//   createdAt: string;
//   isBookmarked?: boolean;
// }

// interface ActivityCardProps {
//   post?: Activity[];
//   darkMode: boolean;
//   currentPage?: number;
//   totalPage?: number;
// }

// const ActivityCard: React.FC<ActivityCardProps> = ({
//   post,
//   darkMode,
//   currentPage,
//   totalPage,
// }) => {
//   const [page, setPage] = useState(1);
//   const [posts, setPosts] = useState<Activity[]>(post || []);
//   const [totalPages, setTotalPages] = useState(totalPage || 1);
//   const [activeMenu, setActiveMenu] = useState<string | null>(null);
//   const [comment, setComment] = useState("");
//   const [currPage, setCurrPage] = useState(currentPage || 1);
//   const [showComments, setShowComments] = useState(false);
//   const [selectedPost, setSelectedPost] = useState<Activity | null>(null);

//   const userId = useSelector((state: any) => state.Auth.userId);
//   const limit = 3;

//   // const handleSubmitComment = async (id: string) => {
//   //   if (comment.trim().length === 0) return;
//   //   try {
//   //     const res = await addComment(id, comment);
//   //     // Optionally update local comments
//   //     setPosts((prev) =>
//   //       prev.map((p) =>
//   //         p._id === id ? { ...p, comments: [...p.comments, res.data] } : p
//   //       )
//   //     );
//   //     setComment("");
//   //   } catch (error) {
//   //     console.error(error);
//   //   }
//   // };

//   // const showCommentBox = (post: Activity) => {
//   //   setSelectedPost(post);
//   //   setShowComments(true);
//   // };

//   // const handleDelete = async (id: string) => {
//   //   try {
//   //     await deleteActivity(id);
//   //     setPosts((prev) => prev.filter((p) => p._id !== id));
//   //     setActiveMenu(null);
//   //   } catch (err) {
//   //     console.error(err);
//   //   }
//   // };

//   // const handleLike = async (id: string) => {
//   //   // Optimistic update
//   //   setPosts((prevPosts) =>
//   //     prevPosts.map((post) => {
//   //       if (post._id === id) {
//   //         const isLiked = post.likes.some((u) => u._id === userId);
//   //         return {
//   //           ...post,
//   //           likes: isLiked
//   //             ? post.likes.filter((u) => u._id !== userId)
//   //             : [...post.likes, { _id: userId } as User],
//   //         };
//   //       }
//   //       return post;
//   //     })
//   //   );

//   //   try {
//   //     await likeActivity(id);
//   //   } catch (error) {
//   //     console.error(error);
//   //     // Optionally revert on error
//   //   }
//   // };

//   // const handleBookmark = (id: string) => {
//   //   setPosts((prev) =>
//   //     prev.map((p) =>
//   //       p._id === id ? { ...p, isBookmarked: !p.isBookmarked } : p
//   //     )
//   //   );
//   // };

//   // useEffect(() => {
//   //   const fetchActivities = async () => {
//   //     try {
//   //       const res = await getActivities({ page, limit });
//   //       setTotalPages(res.totalPages);
//   //       setCurrPage(res.currentPage);
//   //       setPosts(res.data);
//   //     } catch (error) {
//   //       console.error(error);
//   //     }
//   //   };
//   //   fetchActivities();
//   // }, [page]);

//   if (!posts.length) return <div>Loading...</div>;

//   return (
//     <>
//       <CommentModal
//         isOpen={showComments}
//         onClose={() => setShowComments(false)}
//         activityId={selectedPost?._id}
//         comments={selectedPost?.comments || []}
//         currentUserId={userId}
//         darkMode={darkMode}
//         onAddComment={addComment}
//         // onDeleteComment={handleDeleteComment} // not implemented
//       />

//       {posts.map((post) => (
//         <div
//           key={post._id}
//           className={`rounded-xl shadow-lg overflow-hidden ${
//             darkMode ? "bg-gray-800" : "bg-white"
//           }`}
//         >
//           {/* Post Header */}
//           <div className="p-4 border-b border-gray-700 flex items-center justify-between">
//             <div className="flex items-center">
//               <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center mr-3">
//                 <span className="text-white font-bold">
//                   {post.createdBy.username.charAt(0).toUpperCase()}
//                 </span>
//               </div>
//               <div>
//                 <h3
//                   className={`font-semibold ${
//                     darkMode ? "text-white" : "text-gray-800"
//                   }`}
//                 >
//                   {post.createdBy.username}
//                 </h3>
//                 <p
//                   className={`text-sm ${
//                     darkMode ? "text-gray-400" : "text-gray-500"
//                   }`}
//                 >
//                   @{post.createdBy.username} •{" "}
//                   {new Date(post.createdAt).toLocaleDateString()}
//                 </p>
//               </div>
//             </div>

//             {/* Three Dots Menu */}
//             <div className="relative">
//               <button
//                 onClick={() =>
//                   setActiveMenu(activeMenu === post._id ? null : post._id)
//                 }
//                 className={`p-2 rounded-full hover:bg-opacity-20 ${
//                   darkMode
//                     ? "text-gray-400 hover:bg-gray-700"
//                     : "text-gray-500 hover:bg-gray-200"
//                 }`}
//               >
//                 <svg
//                   xmlns="http://www.w3.org/2000/svg"
//                   className="h-5 w-5"
//                   viewBox="0 0 20 20"
//                   fill="currentColor"
//                 >
//                   <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
//                 </svg>
//               </button>

//               {activeMenu === post._id && (
//                 <div
//                   className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg ${
//                     darkMode ? "bg-gray-700" : "bg-white"
//                   } ring-1 ring-black ring-opacity-5 z-10`}
//                 >
//                   <div className="py-1">
//                     {post.createdBy._id === userId && (
//                       <button
//                         onClick={() => handleDelete(post._id)}
//                         className={`block w-full text-left px-4 py-2 text-sm ${
//                           darkMode
//                             ? "text-red-400 hover:bg-gray-600"
//                             : "text-red-600 hover:bg-gray-100"
//                         }`}
//                       >
//                         Delete Post
//                       </button>
//                     )}
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Post Content */}
//           <div className="p-4">
//             <p className={`mb-4 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
//               {post.description}
//             </p>

//             {post.file && (
//               <div className="rounded-lg overflow-hidden mb-4">
//                 <img
//                   src={post.file}
//                   alt="Post media"
//                   className="w-full h-auto object-cover max-h-96"
//                 />
//               </div>
//             )}

//             {/* Engagement Stats */}
//             <div className="flex text-sm text-gray-400 mb-3">
//               <span className="mr-4">{post.likes.length} likes</span>
//               <button
//                 onClick={() => {
//                   setSelectedPost(post);
//                   setShowComments(true);
//                 }}
//                 className="hover:underline"
//               >
//                 {post.comments.length} comments
//               </button>
//             </div>

//             {/* Engagement Buttons */}
//             <div className="flex border-t border-b border-gray-700 py-2">
//               <button
//                 onClick={() => handleLike(post._id)}
//                 className={`flex-1 flex items-center justify-center py-2 rounded-lg transition-colors ${
//                   post.likes.some((u) => u._id === userId)
//                     ? "text-red-500"
//                     : darkMode
//                     ? "text-gray-400 hover:bg-gray-700"
//                     : "text-gray-500 hover:bg-gray-100"
//                 }`}
//               >
//                 <Heart
//                   className={`h-5 w-5 mr-2 transition-transform ${
//                     post.likes.some((u) => u._id === userId)
//                       ? "fill-red-500 scale-110"
//                       : ""
//                   }`}
//                 />
//                 Like
//               </button>
//               <button
//                 onClick={() => showCommentBox(post)}
//                 className={`flex-1 flex items-center justify-center py-2 rounded-lg transition-colors ${
//                   darkMode
//                     ? "text-gray-400 hover:bg-gray-700"
//                     : "text-gray-500 hover:bg-gray-100"
//                 }`}
//               >
//                 <svg
//                   xmlns="http://www.w3.org/2000/svg"
//                   className="h-5 w-5 mr-2"
//                   viewBox="0 0 20 20"
//                   fill="currentColor"
//                 >
//                   <path
//                     fillRule="evenodd"
//                     d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z"
//                     clipRule="evenodd"
//                   />
//                 </svg>
//                 Comment
//               </button>
//               <button
//                 onClick={() => handleBookmark(post._id)}
//                 className={`flex-1 flex items-center justify-center py-2 rounded-lg transition-colors ${
//                   post.isBookmarked
//                     ? "text-blue-500"
//                     : darkMode
//                     ? "text-gray-400 hover:bg-gray-700"
//                     : "text-gray-500 hover:bg-gray-100"
//                 }`}
//               >
//                 <svg
//                   xmlns="http://www.w3.org/2000/svg"
//                   className="h-5 w-5 mr-2"
//                   viewBox="0 0 20 20"
//                   fill="currentColor"
//                 >
//                   <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
//                 </svg>
//                 Save
//               </button>
//             </div>

//             {/* Comment Input */}
//             <div className="pt-4 flex items-center">
//               <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center mr-3 flex-shrink-0">
//                 <span className="text-white font-bold text-sm">AJ</span>
//               </div>
//               <div
//                 className={`flex-1 flex items-center rounded-full px-4 py-2 ${
//                   darkMode ? "bg-gray-700" : "bg-gray-100"
//                 }`}
//               >
//                 <input
//                   type="text"
//                   value={comment}
//                   onChange={(e) => setComment(e.target.value)}
//                   placeholder="Write a comment..."
//                   className={`flex-1 bg-transparent outline-none ${
//                     darkMode ? "text-gray-300" : "text-gray-700"
//                   }`}
//                 />
//                 <button
//                   onClick={() => handleSubmitComment(post._id)}
//                   disabled={!comment.trim()}
//                   className={`ml-3 p-2 rounded-full transition ${
//                     comment.trim()
//                       ? "bg-blue-600 hover:bg-blue-700 text-white"
//                       : "bg-gray-400 cursor-not-allowed text-white"
//                   }`}
//                 >
//                   <Send size={18} />
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       ))}

//       {/* Pagination */}
//       <div className="flex justify-center items-center mt-6 gap-2">
//         <button
//           disabled={page === 1}
//           onClick={() => setPage((prev) => prev - 1)}
//           className={`px-4 py-2 rounded-lg text-sm font-medium transition
//           ${
//             page === 1
//               ? "bg-gray-400 cursor-not-allowed text-white"
//               : darkMode
//               ? "bg-gray-700 text-white hover:bg-gray-600"
//               : "bg-gray-200 text-gray-800 hover:bg-gray-300"
//           }`}
//         >
//           Prev
//         </button>
//         <span className="px-3 py-1">{currPage}</span>
//         <button
//           disabled={page === totalPages}
//           onClick={() => setPage((prev) => prev + 1)}
//           className={`px-4 py-2 rounded-lg text-sm font-medium transition
//           ${
//             page === totalPages
//               ? "bg-gray-400 cursor-not-allowed text-white"
//               : darkMode
//               ? "bg-gray-700 text-white hover:bg-gray-600"
//               : "bg-gray-200 text-gray-800 hover:bg-gray-300"
//           }`}
//         >
//           Next
//         </button>
//       </div>
//     </>
//   );
// };

// export default ActivityCard;
"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import {
  Heart, MessageCircle, Bookmark, MoreHorizontal,
  Send, Trash2, X, ChevronDown,
} from "lucide-react";

// Types
export interface CommentUser { _id: string; username: string; avatar?: string; }
export interface Comment    { _id: string; content: string; createdBy: CommentUser; createdAt: string; }
export interface LikeUser   { _id: string; username: string; avatar?: string; }
export interface Activity {
  _id: string; description: string; file?: string;
  likes: LikeUser[]; comments: Comment[];
  createdBy: CommentUser; createdAt: string; isBookmarked: boolean;
}

interface Props {
  post: Activity; darkMode: boolean; currentUserId: string;
  onDelete?: (id: string) => void;
  onLike?:   (id: string) => void;
  onBookmark?(id: string): void;
  onComment?: (postId: string, text: string) => void;
  index?: number;
}

const avatarGradients = [
  "from-violet-500 to-fuchsia-500", "from-cyan-500 to-blue-500",
  "from-fuchsia-500 to-pink-500",   "from-amber-500 to-orange-500",
  "from-green-500 to-emerald-500",  "from-blue-500 to-violet-500",
  "from-rose-500 to-fuchsia-500",   "from-teal-500 to-cyan-500",
];
function hashIndex(s: string) { return s.split("").reduce((a, c) => a + c.charCodeAt(0), 0); }

export const ActivityCard: React.FC<Props> = ({
  post, darkMode, currentUserId, onDelete, onLike, onBookmark, onComment, index = 0,
}) => {
  const [showComments, setShowComments]   = useState(false);
  const [commentText, setCommentText]     = useState("");
  const [localComments, setLocalComments] = useState<Comment[]>(post.comments);
  const [isLiked, setIsLiked]             = useState(post.likes.some(u => u._id === currentUserId));
  const [likeCount, setLikeCount]         = useState(post.likes.length);
  const [bookmarked, setBookmarked]       = useState(post.isBookmarked);
  const [menuOpen, setMenuOpen]           = useState(false);
  const [likeAnim, setLikeAnim]           = useState(false);
  const [imgExpanded, setImgExpanded]     = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isOwnPost = post.createdBy._id === currentUserId;
  const avatarIdx = hashIndex(post.createdBy._id) % avatarGradients.length;
  const accentGradient = "from-violet-500 via-fuchsia-500 to-cyan-400";

  // ── Theme tokens ──────────────────────────────────────────────────────────
  const cardBg      = darkMode ? "bg-gray-800 border-gray-700/60" : "bg-white border-gray-200";
  const mutedText   = darkMode ? "text-gray-400"  : "text-gray-500";
  const headingText = darkMode ? "text-white"     : "text-gray-900";
  const divider     = darkMode ? "border-gray-700/60" : "border-gray-100";
  const inputCls    = `w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all focus:ring-2 focus:ring-violet-500/30 resize-none ${darkMode ? "bg-gray-700/60 border-gray-600 text-white placeholder-gray-500 focus:border-violet-500/60" : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-violet-400"}`;

  function handleLike() {
    setIsLiked(p => !p);
    setLikeCount(p => isLiked ? p - 1 : p + 1);
    setLikeAnim(true);
    setTimeout(() => setLikeAnim(false), 400);
    onLike?.(post._id);
  }

  function handleBookmark() {
    setBookmarked(p => !p);
    onBookmark?.(post._id);
    toast(bookmarked ? "Removed from bookmarks" : "Saved to bookmarks");
  }

  function handleDelete() {
    setMenuOpen(false);
    onDelete?.(post._id);
    toast.success("Post deleted");
  }

  function submitComment() {
    if (!commentText.trim()) return;
    const newComment: Comment = {
      _id: Math.random().toString(36).slice(2),
      content: commentText.trim(),
      createdBy: { _id: currentUserId, username: "you" },
      createdAt: new Date().toISOString(),
    };
    setLocalComments(p => [...p, newComment]);
    onComment?.(post._id, commentText.trim());
    setCommentText("");
    toast.success("Comment added");
  }

  return (
    <>
      <article className={`group relative rounded-2xl border overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl ${cardBg} ${darkMode ? "hover:border-violet-500/30 hover:shadow-violet-500/5" : "hover:border-violet-200 hover:shadow-violet-100/60"}`}>
        {/* Gradient accent bar */}
        <div className={`absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r ${accentGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

        {/* ── Header ── */}
        <div className="flex items-start justify-between px-5 pt-5 pb-3">
          <div className="flex items-center gap-3">
            <Link href={`/user/${post.createdBy._id}`}>
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${avatarGradients[avatarIdx]} flex items-center justify-center text-sm font-bold text-white cursor-pointer hover:scale-105 transition-transform`}>
                {post.createdBy.username.slice(0, 2).toUpperCase()}
              </div>
            </Link>
            <div>
              <Link href={`/user/${post.createdBy._id}`}>
                <span className={`text-sm font-bold ${headingText} hover:underline cursor-pointer`}>{post.createdBy.username}</span>
              </Link>
              <p className={`text-[11px] mt-0.5 ${mutedText}`}>
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>

          {/* Menu */}
          <div className="relative" ref={menuRef}>
            <button onClick={() => setMenuOpen(p => !p)}
              className={`p-1.5 rounded-lg transition-all ${darkMode ? "text-gray-500 hover:bg-gray-700 hover:text-gray-300" : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"}`}>
              <MoreHorizontal className="w-4 h-4" />
            </button>
            {menuOpen && (
              <div className={`absolute right-0 top-8 z-20 w-44 rounded-xl border shadow-xl overflow-hidden ${darkMode ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"}`}
                style={{ animation: "scaleIn 0.15s ease both" }}>
                {isOwnPost && (
                  <button onClick={handleDelete}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-red-400 hover:bg-red-500/10 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" /> Delete post
                  </button>
                )}
                <button onClick={() => { navigator.clipboard.writeText(window.location.href + `/post/${post._id}`); toast("Link copied!"); setMenuOpen(false); }}
                  className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium transition-colors ${darkMode ? "text-gray-400 hover:bg-gray-800" : "text-gray-600 hover:bg-gray-50"}`}>
                  Copy link
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── Body ── */}
        <div className="px-5 pb-3">
          <p className={`text-sm leading-relaxed ${darkMode ? "text-gray-300" : "text-gray-700"}`}>{post.description}</p>
        </div>

        {/* ── Image ── */}
        {post.file && (
          <div className="px-5 pb-4">
            <div className="rounded-xl overflow-hidden cursor-zoom-in border relative" style={{ maxHeight: 320 }}
              onClick={() => setImgExpanded(true)}>
              <img src={post.file} alt="Post media"
                className="w-full object-cover transition-transform duration-500 hover:scale-[1.02]"
                style={{ maxHeight: 320, objectFit: "cover" }} />
            </div>
          </div>
        )}

        {/* ── Divider ── */}
        <div className={`mx-5 h-px ${darkMode ? "bg-gray-700/50" : "bg-gray-100"}`} />

        {/* ── Actions ── */}
        <div className="flex items-center justify-between px-5 py-3">
          <div className="flex items-center gap-1">
            {/* Like */}
            <button onClick={handleLike}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all hover:scale-105 active:scale-95 ${
                isLiked
                  ? "bg-rose-500/15 text-rose-400"
                  : darkMode ? "text-gray-400 hover:bg-gray-700 hover:text-rose-400" : "text-gray-500 hover:bg-gray-50 hover:text-rose-500"
              }`}>
              <Heart className={`w-4 h-4 transition-all duration-300 ${isLiked ? "fill-rose-400 scale-110" : ""} ${likeAnim ? "scale-125" : ""}`} />
              <span>{likeCount}</span>
            </button>

            {/* Comment */}
            <button onClick={() => setShowComments(p => !p)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all hover:scale-105 ${
                showComments
                  ? "bg-violet-500/15 text-violet-400"
                  : darkMode ? "text-gray-400 hover:bg-gray-700 hover:text-violet-400" : "text-gray-500 hover:bg-gray-50 hover:text-violet-500"
              }`}>
              <MessageCircle className="w-4 h-4" />
              <span>{localComments.length}</span>
            </button>
          </div>

          {/* Bookmark */}
          <button onClick={handleBookmark}
            className={`p-1.5 rounded-xl transition-all hover:scale-105 active:scale-95 ${
              bookmarked
                ? "text-amber-400 bg-amber-500/15"
                : darkMode ? "text-gray-500 hover:bg-gray-700 hover:text-amber-400" : "text-gray-400 hover:bg-gray-50 hover:text-amber-500"
            }`}>
            <Bookmark className={`w-4 h-4 ${bookmarked ? "fill-amber-400" : ""}`} />
          </button>
        </div>

        {/* ── Comment section ── */}
        {showComments && (
          <div className={`border-t ${divider} px-5 py-4 space-y-4`}>
            {/* Existing comments */}
            {localComments.length === 0 ? (
              <p className={`text-xs text-center py-2 ${mutedText}`}>No comments yet. Be the first!</p>
            ) : (
              <div className="space-y-3">
                {localComments.map((c, i) => {
                  const cidx = hashIndex(c.createdBy._id) % avatarGradients.length;
                  return (
                    <div key={c._id} className="flex gap-3">
                      <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${avatarGradients[cidx]} flex items-center justify-center text-[10px] font-bold text-white shrink-0 mt-0.5`}>
                        {c.createdBy.username.slice(0, 2).toUpperCase()}
                      </div>
                      <div className={`flex-1 px-3 py-2.5 rounded-xl text-xs ${darkMode ? "bg-gray-700/50" : "bg-gray-50"}`}>
                        <span className={`font-semibold mr-1.5 ${headingText}`}>{c.createdBy.username}</span>
                        <span className={darkMode ? "text-gray-300" : "text-gray-700"}>{c.content}</span>
                        <p className={`text-[10px] mt-1.5 ${mutedText}`}>
                          {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Add comment */}
            <div className="flex gap-2.5">
              <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${avatarGradients[0]} flex items-center justify-center text-[10px] font-bold text-white shrink-0 mt-1`}>
                ME
              </div>
              <div className="flex-1 flex gap-2">
                <textarea rows={1} value={commentText} onChange={e => setCommentText(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submitComment(); } }}
                  placeholder="Write a comment…"
                  className={`${inputCls} min-h-[38px] py-2`} />
                <button onClick={submitComment} disabled={!commentText.trim()}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 self-start mt-0 ${
                    commentText.trim()
                      ? `bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white hover:scale-105 shadow-sm shadow-violet-500/20`
                      : `${darkMode ? "bg-gray-700 text-gray-500" : "bg-gray-100 text-gray-400"} cursor-not-allowed`
                  }`}>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </article>

      {/* ── Image lightbox ── */}
      {imgExpanded && post.file && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }}
          onClick={() => setImgExpanded(false)}>
          <button className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors">
            <X className="w-4 h-4" />
          </button>
          <img src={post.file} alt="Expanded" className="max-w-full max-h-[90vh] rounded-2xl object-contain shadow-2xl"
            onClick={e => e.stopPropagation()} />
        </div>
      )}

      <style>{`
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.92); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </>
  );
};