"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import {
  Users, Search, Pencil, Trash2, X, Plus,
} from "lucide-react";

interface User {
  _id: string;
  username: string;
  email: string;
  position?: string;
  portfolio?: string;
  about?: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function UsersPanel() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [form, setForm] = useState({
    username: "",
    email: "",
    position: "",
    portfolio: "",
    about: "",
  });

  // ── Fetch users ────────────────────────────────────────────────────
  const fetchUsers = async () => {
    try {
      setLoading(true);
      // Replace with your actual API endpoint
      const { data } = await axios.get("/api/admin/users");
      if (data.success) {
        setUsers(data.data);
      } else {
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
      // Fallback mock data
      setUsers([
        {
          _id: "1",
          username: "navkirat",
          email: "nav@dev.io",
          position: "Full-Stack Developer",
          portfolio: "navkirat.dev",
          about: "Passionate developer building communities.",
          isVerified: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          _id: "2",
          username: "alex_eth",
          email: "alex@eth.io",
          position: "Blockchain Engineer",
          portfolio: "alex.eth",
          about: "Building decentralized systems.",
          isVerified: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ── Reset form ─────────────────────────────────────────────────────
  const resetForm = () => {
    setForm({
      username: "",
      email: "",
      position: "",
      portfolio: "",
      about: "",
    });
    setEditing(null);
  };

  // ── Open edit modal ──────────────────────────────────────────────
  const openEdit = (user: User) => {
    setEditing(user);
    setForm({
      username: user.username,
      email: user.email,
      position: user.position || "",
      portfolio: user.portfolio || "",
      about: user.about || "",
    });
    setShowModal(true);
  };

  // ── Delete user ──────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this user? This action cannot be undone.")) return;
    try {
      await axios.delete(`/api/admin/users/${id}`);
      toast.success("User deleted");
      await fetchUsers();
    } catch (error) {
      toast.error("Failed to delete user");
    }
  };

  // ── Filter ────────────────────────────────────────────────────────
  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return u.username.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[#0D1B2A]">Users</h2>
          <p className="text-sm text-[#64748B]">Manage all registered users.</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-sm">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
        <input
          type="text"
          placeholder="Search users..."
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
          <Users className="w-12 h-12 mx-auto text-[#0EA472] mb-3" />
          <p className="text-sm text-[#64748B]">No users found.</p>
        </div>
      ) : (
        <div className="bg-white border border-[#E8EDF2] rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#F8FAFB] border-b border-[#E8EDF2]">
                <tr>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#64748B] uppercase">Username</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#64748B] uppercase">Email</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#64748B] uppercase">Position</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#64748B] uppercase">Joined</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#64748B] uppercase">Verified</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-[#64748B] uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user) => (
                  <tr key={user._id} className="border-b border-[#E8EDF2] last:border-0 hover:bg-[#F8FAFB] transition">
                    <td className="px-5 py-3 font-medium text-[#0D1B2A]">{user.username}</td>
                    <td className="px-5 py-3 text-[#64748B]">{user.email}</td>
                    <td className="px-5 py-3 text-[#64748B]">{user.position || "—"}</td>
                    <td className="px-5 py-3 text-[#64748B]">{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                          user.isVerified
                            ? "bg-green-50 text-green-700 border border-green-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {user.isVerified ? "Verified" : "Pending"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleDelete(user._id)}
                          className="p-1 text-[#64748B] hover:text-red-500 transition"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Modal ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto border border-[#E8EDF2]">
            <div className="flex justify-between items-center px-6 py-4 border-b border-[#E8EDF2]">
              <h2 className="text-lg font-bold text-[#0D1B2A]">
                {editing ? "Edit User" : "Add User"}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="text-[#64748B] hover:text-[#0D1B2A] transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}