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
import React from "react";
import { Bookmark, Heart, MessageCircle, MoreHorizontal, Trash2, Tag } from "lucide-react";

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
  likes: number;
  comments: ActivityComment[];
  createdBy: {
    _id: string;
    username: string;
  };
  createdAt: string;
  isBookmarked?: boolean;
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

export default function ActivityCard({
  activity,
  currentUserId,
  onLike,
  onComment,
  onBookmark,
  onDelete,
}: {
  activity: Activity;
  currentUserId: string;
  onLike: (id: string) => void;
  onComment: (id: string) => void;
  onBookmark: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const isOwnPost = activity.createdBy._id === currentUserId;
  const isBookmarked = !!activity.isBookmarked;

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
              <p className="m-0 text-[12px] text-[#64748B]">
                Shared an activity
              </p>
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
              <Bookmark className="w-4 h-4" fill={isBookmarked ? "currentColor" : "none"} />
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

            <button className="inline-flex items-center justify-center w-9 h-9 rounded-xl border border-[#E8EDF2] text-[#64748B] hover:bg-[#F8FAFB] transition">
              <MoreHorizontal className="w-4 h-4" />
            </button>
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
            <span>{activity.comments?.length || 0} comments</span>
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