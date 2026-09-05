"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import {
  FileText, Search, Trash2, CheckCircle, XCircle, Calendar,
  User, BookOpen, Filter,
} from "lucide-react";

interface Submission {
  _id: string;
  user: { _id: string; username: string } | string;
  question: { _id: string; title: string } | string;
  selectedOption: string;
  isCorrect: boolean;
  pointsEarned: number;
  submittedAt: string;
  createdAt: string;
}

export default function SubmissionsPanel() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterResult, setFilterResult] = useState<"all" | "correct" | "incorrect">("all");

  // ── Fetch submissions ────────────────────────────────────────────────
  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/api/admin/submissions");
      if (data.success) {
        setSubmissions(data.data);
      } else {
        setSubmissions(data.submissions || []);
      }
    } catch (error) {
      console.error("Failed to fetch submissions:", error);
      // Fallback mock data
      setSubmissions([
        {
          _id: "1",
          user: { _id: "u1", username: "navkirat" },
          question: { _id: "q1", title: "Two Sum" },
          selectedOption: "B",
          isCorrect: true,
          pointsEarned: 15,
          submittedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        },
        {
          _id: "2",
          user: { _id: "u2", username: "alex_eth" },
          question: { _id: "q2", title: "Binary Search" },
          selectedOption: "C",
          isCorrect: false,
          pointsEarned: 0,
          submittedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  // ── Delete submission ──────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this submission? This action cannot be undone.")) return;
    try {
      await axios.delete(`/api/admin/submissions/${id}`);
      toast.success("Submission deleted");
      await fetchSubmissions();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete submission");
    }
  };

  // ── Filter ───────────────────────────────────────────────────────────
  const filtered = submissions.filter((s) => {
    const q = search.toLowerCase();
    const username = typeof s.user === "string" ? s.user : s.user?.username || "";
    const questionTitle = typeof s.question === "string" ? s.question : s.question?.title || "";
    const matchSearch = username.toLowerCase().includes(q) || questionTitle.toLowerCase().includes(q);
    const matchResult =
      filterResult === "all" ? true : filterResult === "correct" ? s.isCorrect : !s.isCorrect;
    return matchSearch && matchResult;
  });

  // Helper: get username
  const getUsername = (user: Submission["user"]) => {
    if (typeof user === "string") return user;
    return user?.username || "Unknown";
  };

  // Helper: get question title
  const getQuestionTitle = (question: Submission["question"]) => {
    if (typeof question === "string") return question;
    return question?.title || "Unknown";
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[#0D1B2A]">Submissions</h2>
          <p className="text-sm text-[#64748B]">View and manage all user submissions.</p>
        </div>
        <div className="text-sm text-[#64748B] bg-white border border-[#E8EDF2] rounded-xl px-4 py-2">
          Total: {filtered.length} submission{filtered.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
          <input
            type="text"
            placeholder="Search by user or question..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#E8EDF2] text-sm text-[#0D1B2A] outline-none focus:ring-2 focus:ring-[#0EA472]/30"
          />
        </div>
        <select
          value={filterResult}
          onChange={(e) => setFilterResult(e.target.value as "all" | "correct" | "incorrect")}
          className="px-4 py-2 rounded-xl border border-[#E8EDF2] text-sm text-[#0D1B2A] outline-none focus:ring-2 focus:ring-[#0EA472]/30 bg-white"
        >
          <option value="all">All Results</option>
          <option value="correct">✅ Correct</option>
          <option value="incorrect">❌ Incorrect</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-10 text-[#64748B]">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-[#E8EDF2] rounded-2xl p-12 text-center">
          <FileText className="w-12 h-12 mx-auto text-[#0EA472] mb-3" />
          <p className="text-sm text-[#64748B]">No submissions found.</p>
        </div>
      ) : (
        <div className="bg-white border border-[#E8EDF2] rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#F8FAFB] border-b border-[#E8EDF2]">
                <tr>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#64748B] uppercase">User</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#64748B] uppercase">Question</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#64748B] uppercase">Selected</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#64748B] uppercase">Result</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#64748B] uppercase">Submitted</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-[#64748B] uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr key={s._id} className="border-b border-[#E8EDF2] last:border-0 hover:bg-[#F8FAFB] transition">
                    <td className="px-5 py-3 font-medium text-[#0D1B2A]">{getUsername(s.user)}</td>
                    <td className="px-5 py-3 text-[#64748B]">{getQuestionTitle(s.question)}</td>
                    <td className="px-5 py-3 font-mono text-[#0D1B2A]">{s.selectedOption}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium ${
                        s.isCorrect ? "text-green-600" : "text-red-600"
                      }`}>
                        {s.isCorrect ? (
                          <><CheckCircle className="w-3.5 h-3.5" /> Correct</>
                        ) : (
                          <><XCircle className="w-3.5 h-3.5" /> Incorrect</>
                        )}
                      </span>
                    </td>
                  
                    <td className="px-5 py-3 text-[#64748B]">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(s.submittedAt || s.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => handleDelete(s._id)}
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