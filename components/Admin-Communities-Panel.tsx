"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import {
  Globe, Search, Trash2, Users, UserCheck, Hash, Calendar,
} from "lucide-react";

interface Community {
  _id: string;
  communityName: string;
  slug: string;
  totalMembers: number;
  onlineMembers: number;
  createdBy: { _id: string; username: string } | string;
  joinedMembers: string[];
  admins: string[];
  topics: string[];
  about?: string;
  createdAt: string;
  updatedAt: string;
}

export default function CommunitiesPanel() {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // ── Fetch communities ────────────────────────────────────────────────
  const fetchCommunities = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/api/admin/communities");
      if (data.success) {
        setCommunities(data.data);
      } else {
        setCommunities(data.communities || []);
      }
    } catch (error) {
      console.error("Failed to fetch communities:", error);
      // Fallback mock data
      setCommunities([
        {
          _id: "1",
          communityName: "React & Next.js Builders",
          slug: "react-next-builders",
          totalMembers: 4821,
          onlineMembers: 312,
          createdBy: { _id: "u1", username: "navkirat" },
          joinedMembers: ["u1", "u2", "u3"],
          admins: ["u1"],
          topics: ["React", "Next.js", "TypeScript"],
          about: "Deep dives into React patterns and Next.js.",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          _id: "2",
          communityName: "ML & AI Practitioners",
          slug: "ml-ai-practitioners",
          totalMembers: 6500,
          onlineMembers: 540,
          createdBy: { _id: "u4", username: "sophie_ml" },
          joinedMembers: ["u4", "u5", "u6"],
          admins: ["u4"],
          topics: ["Python", "PyTorch", "LLM"],
          about: "Cutting-edge ML research and production AI.",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommunities();
  }, []);

  // ── Delete community ──────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this community? This action cannot be undone.")) return;
    try {
      await axios.delete(`/api/admin/communities/${id}`);
      toast.success("Community deleted");
      await fetchCommunities();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete community");
    }
  };

  // ── Filter ───────────────────────────────────────────────────────────
  const filtered = communities.filter((c) => {
    const q = search.toLowerCase();
    const creatorName = typeof c.createdBy === "string" ? c.createdBy : c.createdBy?.username || "";
    return (
      c.communityName.toLowerCase().includes(q) ||
      creatorName.toLowerCase().includes(q) ||
      c.topics.some((t) => t.toLowerCase().includes(q))
    );
  });

  // Helper: get creator name
  const getCreatorName = (creator: Community["createdBy"]) => {
    if (typeof creator === "string") return creator;
    return creator?.username || "Unknown";
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[#0D1B2A]">Communities</h2>
          <p className="text-sm text-[#64748B]">Manage all communities.</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-sm">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
        <input
          type="text"
          placeholder="Search communities..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#E8EDF2] text-sm text-[#0D1B2A] outline-none focus:ring-2 focus:ring-[#0EA472]/30"
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-10 text-[#64748B]">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-[#E8EDF2] rounded-2xl p-12 text-center">
          <Globe className="w-12 h-12 mx-auto text-[#0EA472] mb-3" />
          <p className="text-sm text-[#64748B]">No communities found.</p>
        </div>
      ) : (
        <div className="bg-white border border-[#E8EDF2] rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#F8FAFB] border-b border-[#E8EDF2]">
                <tr>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#64748B] uppercase">Name</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#64748B] uppercase">Creator</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#64748B] uppercase">Members</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#64748B] uppercase">Online</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#64748B] uppercase">Topics</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#64748B] uppercase">Created</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-[#64748B] uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c._id} className="border-b border-[#E8EDF2] last:border-0 hover:bg-[#F8FAFB] transition">
                    <td className="px-5 py-3 font-medium text-[#0D1B2A]">{c.communityName}</td>
                    <td className="px-5 py-3 text-[#64748B]">{getCreatorName(c.createdBy)}</td>
                    <td className="px-5 py-3 text-[#64748B]">
                      <div className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        {c.totalMembers}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-[#64748B]">
                      <div className="flex items-center gap-1">
                        <UserCheck className="w-3.5 h-3.5" />
                        {c.onlineMembers}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex flex-wrap gap-1">
                        {c.topics.slice(0, 2).map((topic) => (
                          <span key={topic} className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">
                            {topic}
                          </span>
                        ))}
                        {c.topics.length > 2 && (
                          <span className="text-[10px] text-gray-400">+{c.topics.length - 2}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-[#64748B]">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => handleDelete(c._id)}
                        className="p-1 text-[#64748B] hover:text-red-500 transition"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}