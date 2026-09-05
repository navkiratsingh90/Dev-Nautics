"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import {
  Briefcase, Search, Trash2, Users, Code2, Calendar,
} from "lucide-react";

interface Collaboration {
  _id: string;
  title: string;
  description: string;
  category: string;
  status: "Open" | "In Progress" | "On Hold" | "Completed" | "Closed";
  rolesLookingFor: string[];
  techStackUsed: string[];
  totalTeamSize: number;
  currentTeamMembers: { user: string | { _id: string; username: string }; roleAssigned: string }[];
  createdBy: { _id: string; username: string } | string;
  createdAt: string;
  updatedAt: string;
}

export default function CollaborationsPanel() {
  const [collaborations, setCollaborations] = useState<Collaboration[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // ── Fetch collaborations ────────────────────────────────────────────
  const fetchCollaborations = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/api/admin/collaborations");
      if (data.success) {
        setCollaborations(data.data);
      } else {
        setCollaborations(data.collaborations || []);
      }
    } catch (error) {
      console.error("Failed to fetch collaborations:", error);
      // Fallback mock data
      setCollaborations([
        {
          _id: "1",
          title: "AI Code Assistant",
          description: "LLM-powered code completion tool.",
          category: "AI/ML",
          status: "Open",
          rolesLookingFor: ["ML Engineer", "Frontend Dev"],
          techStackUsed: ["Python", "React", "FastAPI"],
          totalTeamSize: 5,
          currentTeamMembers: [
            { user: { _id: "u1", username: "navkirat" }, roleAssigned: "Project Lead" },
          ],
          createdBy: { _id: "u1", username: "navkirat" },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          _id: "2",
          title: "Decentralized Marketplace",
          description: "P2P gig economy on Ethereum.",
          category: "Blockchain",
          status: "In Progress",
          rolesLookingFor: ["Blockchain Dev", "Backend Dev"],
          techStackUsed: ["Solidity", "Next.js", "Hardhat"],
          totalTeamSize: 4,
          currentTeamMembers: [
            { user: { _id: "u4", username: "alex_eth" }, roleAssigned: "Lead" },
          ],
          createdBy: { _id: "u4", username: "alex_eth" },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollaborations();
  }, []);

  // ── Delete collaboration ─────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this collaboration? This action cannot be undone.")) return;
    try {
      await axios.delete(`/api/admin/collaborations/${id}`);
      toast.success("Collaboration deleted");
      await fetchCollaborations();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete collaboration");
    }
  };

  // ── Filter ───────────────────────────────────────────────────────────
  const filtered = collaborations.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.title.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q)
    );
  });

  // Helper: get creator name
  const getCreatorName = (creator: Collaboration["createdBy"]) => {
    if (typeof creator === "string") return creator;
    return creator?.username || "Unknown";
  };

  // Helper: get member count
  const getMemberCount = (members: Collaboration["currentTeamMembers"]) => {
    return members?.length || 0;
  };

  const statusColors: Record<string, string> = {
    Open: "bg-green-50 text-green-700 border-green-200",
    "In Progress": "bg-blue-50 text-blue-700 border-blue-200",
    "On Hold": "bg-amber-50 text-amber-700 border-amber-200",
    Completed: "bg-gray-50 text-gray-700 border-gray-200",
    Closed: "bg-red-50 text-red-700 border-red-200",
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[#0D1B2A]">Collaborations</h2>
          <p className="text-sm text-[#64748B]">Manage all collaborations.</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-sm">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
        <input
          type="text"
          placeholder="Search collaborations..."
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
          <Briefcase className="w-12 h-12 mx-auto text-[#0EA472] mb-3" />
          <p className="text-sm text-[#64748B]">No collaborations found.</p>
        </div>
      ) : (
        <div className="bg-white border border-[#E8EDF2] rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#F8FAFB] border-b border-[#E8EDF2]">
                <tr>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#64748B] uppercase">Title</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#64748B] uppercase">Category</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#64748B] uppercase">Status</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#64748B] uppercase">Roles</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#64748B] uppercase">Tech Stack</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#64748B] uppercase">Team</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#64748B] uppercase">Created By</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#64748B] uppercase">Created</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-[#64748B] uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c._id} className="border-b border-[#E8EDF2] last:border-0 hover:bg-[#F8FAFB] transition">
                    <td className="px-5 py-3 font-medium text-[#0D1B2A] truncate max-w-[150px]">{c.title}</td>
                    <td className="px-5 py-3">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-200">
                        {c.category}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${statusColors[c.status] || "bg-gray-50 text-gray-700 border-gray-200"}`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-[#64748B]">
                      <div className="flex flex-wrap gap-1">
                        {c.rolesLookingFor.slice(0, 2).map((role) => (
                          <span key={role} className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">
                            {role}
                          </span>
                        ))}
                        {c.rolesLookingFor.length > 2 && (
                          <span className="text-[10px] text-gray-400">+{c.rolesLookingFor.length - 2}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-[#64748B]">
                      <div className="flex flex-wrap gap-1">
                        {c.techStackUsed.slice(0, 2).map((tech) => (
                          <span key={tech} className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">
                            {tech}
                          </span>
                        ))}
                        {c.techStackUsed.length > 2 && (
                          <span className="text-[10px] text-gray-400">+{c.techStackUsed.length - 2}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-[#64748B]">
                      <div className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        {getMemberCount(c.currentTeamMembers)}/{c.totalTeamSize}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-[#64748B]">{getCreatorName(c.createdBy)}</td>
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