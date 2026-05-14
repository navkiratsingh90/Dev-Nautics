"use client";

import React from "react";
import { useAppSelector } from "@/redux/hooks";
import { Plus } from "lucide-react";

interface PostActivityProps {
  onClick?: () => void;
}

const PostActivity: React.FC<PostActivityProps> = ({ onClick }) => {
  const darkMode = useAppSelector((state: any) => state.Theme.darkMode);
  const cardBg = darkMode ? "bg-gray-800 border-gray-700/60" : "bg-white border-gray-200";
  const mutedText = darkMode ? "text-gray-400" : "text-gray-500";

  return (
    <div
      onClick={onClick}
      className={`group relative rounded-2xl border p-5 cursor-pointer transition-all hover:-translate-y-1 hover:shadow-xl ${cardBg}`}
    >
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-2xl`} />
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white font-bold text-lg shadow-md">
          AJ
        </div>
        <div className="flex-1">
          <p className={`text-sm ${mutedText}`}>Share something with your network...</p>
        </div>
        <Plus className="w-5 h-5 text-violet-400" />
      </div>
    </div>
  );
};

export default PostActivity;