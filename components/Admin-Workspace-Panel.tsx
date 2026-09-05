"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import {
  FolderOpen, Search, Trash2, Users, CheckCircle, Clock,
} from "lucide-react";

interface Workspace {
  _id: string;
  title: string;
  description: string;
  leader: { _id: string; username: string } | string;
  members: { user: string | { _id: string; username: string }; role: string }[];
  tasks: any[];
  timeline: { name: string; completed: boolean }[];
  status: string;
  createdAt: string;
  updatedAt: string;
}

export default function WorkspacesPanel() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // ── Fetch workspaces ──────────────────────────────────────────────────
  const fetchWorkspaces = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/api/admin/workspaces");
      if (data.success) {
        setWorkspaces(data.data);
      } else {
        setWorkspaces(data.workspaces || []);
      }
    } catch (error) {
      console.error("Failed to fetch workspaces:", error);
      // Fallback mock data
      setWorkspaces([
        {
          _id: "1",
          title: "AI Code Assistant",
          description: "Building an AI-powered code completion tool.",
          leader: { _id: "u1", username: "navkirat" },
          members: [
            { user: { _id: "u2", username: "alex" }, role: "Developer" },
            { user: { _id: "u3", username: "sarah" }, role: "Designer" },
          ],
          tasks: [],
          timeline: [
            { name: "Planning", completed: true },
            { name: "Development", completed: false },
            { name: "Testing", completed: false },
          ],
          status: "Active",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          _id: "2",
          title: "Decentralized Marketplace",
          description: "P2P marketplace on Ethereum.",
          leader: { _id: "u4", username: "alex_eth" },
          members: [
            { user: { _id: "u5", username: "priya" }, role: "Blockchain Dev" },
          ],
          tasks: [],
          timeline: [
            { name: "Contracts", completed: true },
            { name: "Frontend", completed: false },
          ],
          status: "On Hold",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  // ── Delete workspace ──────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this workspace? This action cannot be undone.")) return;
    try {
      await axios.delete(`/api/admin/workspaces/${id}`);
      toast.success("Workspace deleted");
      await fetchWorkspaces();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete workspace");
    }
  };

  // ── Filter ───────────────────────────────────────────────────────────
  const filtered = workspaces.filter((w) => {
    const q = search.toLowerCase();
    return w.title.toLowerCase().includes(q) || w.description.toLowerCase().includes(q);
  });

  // Helper: get leader name
  const getLeaderName = (leader: Workspace["leader"]) => {
    if (typeof leader === "string") return leader;
    return leader?.username || "Unknown";
  };

  // Helper: timeline progress
  const getProgress = (timeline: Workspace["timeline"]) => {
    if (!timeline || timeline.length === 0) return 0;
    const done = timeline.filter((t) => t.completed).length;
    return Math.round((done / timeline.length) * 100);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[#0D1B2A]">Workspaces</h2>
          <p className="text-sm text-[#64748B]">Manage all workspaces.</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-sm">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
        <input
          type="text"
          placeholder="Search workspaces..."
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
          <FolderOpen className="w-12 h-12 mx-auto text-[#0EA472] mb-3" />
          <p className="text-sm text-[#64748B]">No workspaces found.</p>
        </div>
      ) : (
        <div className="bg-white border border-[#E8EDF2] rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#F8FAFB] border-b border-[#E8EDF2]">
                <tr>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#64748B] uppercase">Title</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#64748B] uppercase">Leader</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#64748B] uppercase">Members</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#64748B] uppercase">Status</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#64748B] uppercase">Progress</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#64748B] uppercase">Created</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-[#64748B] uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((ws) => (
                  <tr key={ws._id} className="border-b border-[#E8EDF2] last:border-0 hover:bg-[#F8FAFB] transition">
                    <td className="px-5 py-3 font-medium text-[#0D1B2A]">{ws.title}</td>
                    <td className="px-5 py-3 text-[#64748B]">{getLeaderName(ws.leader)}</td>
                    <td className="px-5 py-3 text-[#64748B]">
                      <div className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        {ws.members?.length || 0}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                          ws.status === "Active"
                            ? "bg-green-50 text-green-700 border border-green-200"
                            : ws.status === "On Hold"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : ws.status === "Completed"
                            ? "bg-gray-50 text-gray-700 border border-gray-200"
                            : "bg-blue-50 text-blue-700 border border-blue-200"
                        }`}
                      >
                        {ws.status || "Not Started"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-[#64748B]">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono">{getProgress(ws.timeline)}%</span>
                        <div className="w-12 h-1.5 bg-[#E8EDF2] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#0EA472] rounded-full"
                            style={{ width: `${getProgress(ws.timeline)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-[#64748B]">
                      {new Date(ws.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => handleDelete(ws._id)}
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