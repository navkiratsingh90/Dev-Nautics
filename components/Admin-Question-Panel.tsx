"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import {
  BookOpen, Plus, Pencil, Trash2, X, Check, ChevronDown,
  Search, Calendar,
} from "lucide-react";

const CATEGORIES = [
  "aptitude",
  "dsa",
  "cs_fundamental",
  "puzzle",
  "pseudo",
];
const DIFFICULTIES = ["easy", "medium", "hard"];

interface Question {
  _id: string;
  category: string;
  question: string;
  image?: string;
  options: string[];
  correctOption: string;
  explanation?: string;
  difficulty: string;
  tags: string[];
  isActive: boolean;
  scheduledDate?: string;
}

export default function QuestionsPanel() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Question | null>(null);
  const [form, setForm] = useState({
    category: "aptitude",
    question: "",
    image: "",
    options: ["", "", "", ""],
    correctOption: "A",
    explanation: "",
    difficulty: "medium",
    tags: "",
    scheduledDate: "",
  });

  // ── Fetch questions ────────────────────────────────────────────────
  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/api/daily-question");
      if (data.success) {
        setQuestions(data.data);
      }
    } catch (error) {
      toast.error("Failed to load questions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  // ── Reset form ─────────────────────────────────────────────────────
  const resetForm = () => {
    setForm({
      category: "aptitude",
      question: "",
      image: "",
      options: ["", "", "", ""],
      correctOption: "A",
      explanation: "",
      difficulty: "medium",
      tags: "",
      scheduledDate: "",
    });
    setEditing(null);
  };

  // ── Open modal for edit ───────────────────────────────────────────
  const openEdit = (q: Question) => {
    setEditing(q);
    setForm({
      category: q.category,
      question: q.question,
      image: q.image || "",
      options: q.options,
      correctOption: q.correctOption,
      explanation: q.explanation || "",
      difficulty: q.difficulty,
      tags: (q.tags || []).join(", "),
      scheduledDate: q.scheduledDate || "",
    });
    setShowModal(true);
  };

  // ── Submit form ────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.question.trim() || form.options.some((o) => !o.trim())) {
      toast.error("Please fill all fields");
      return;
    }

    const payload = {
      ...form,
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      options: form.options,
    };

    try {
      if (editing) {
        await axios.put(`/api/daily-question/add/${editing._id}`, payload);
        toast.success("Question updated");
      } else {
        await axios.post("/api/daily-question/add", payload);
        toast.success("Question created");
      }
      await fetchQuestions();
      setShowModal(false);
      resetForm();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save question");
    }
  };

  // ── Delete ────────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this question?")) return;
    try {
      await axios.delete(`/api/questions/${id}`);
      toast.success("Question deleted");
      await fetchQuestions();
    } catch (error) {
      toast.error("Failed to delete question");
    }
  };

  // ── Filter ────────────────────────────────────────────────────────
  const filtered = questions.filter((q) => {
    const matchSearch = q.question.toLowerCase().includes(search.toLowerCase());
    const matchCategory = categoryFilter === "all" || q.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[#0D1B2A]">Questions</h2>
          <p className="text-sm text-[#64748B]">Manage all questions for the Daily Questions feature.</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0D1B2A] text-white text-sm font-medium hover:bg-[#1E3A5F] transition"
        >
          <Plus className="w-4 h-4" /> Add Question
        </button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
          <input
            type="text"
            placeholder="Search questions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#E8EDF2] text-sm text-[#0D1B2A] outline-none focus:ring-2 focus:ring-[#0EA472]/30"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-2 rounded-xl border border-[#E8EDF2] text-sm text-[#0D1B2A] outline-none focus:ring-2 focus:ring-[#0EA472]/30 bg-white"
        >
          <option value="all">All Categories</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-10 text-[#64748B]">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-[#E8EDF2] rounded-2xl p-12 text-center">
          <BookOpen className="w-12 h-12 mx-auto text-[#0EA472] mb-3" />
          <p className="text-sm text-[#64748B]">No questions found.</p>
        </div>
      ) : (
        <div className="bg-white border border-[#E8EDF2] rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#F8FAFB] border-b border-[#E8EDF2]">
                <tr>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#64748B] uppercase">Question</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#64748B] uppercase">Category</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#64748B] uppercase">Difficulty</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#64748B] uppercase">Correct</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#64748B] uppercase">Scheduled</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#64748B] uppercase">Status</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-[#64748B] uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((q) => (
                  <tr key={q._id} className="border-b border-[#E8EDF2] last:border-0 hover:bg-[#F8FAFB] transition">
                    <td className="px-5 py-3 max-w-xs truncate font-medium text-[#0D1B2A]">{q.question}</td>
                    <td className="px-5 py-3">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-200">
                        {q.category}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                          q.difficulty === "easy"
                            ? "bg-green-50 text-green-700 border border-green-200"
                            : q.difficulty === "medium"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-red-50 text-red-700 border border-red-200"
                        }`}
                      >
                        {q.difficulty}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-mono text-[#0D1B2A]">{q.correctOption}</td>
                    <td className="px-5 py-3 text-[#64748B]">
                      {q.scheduledDate ? (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {q.scheduledDate}
                        </span>
                      ) : (
                        <span className="text-xs text-[#94A3B8]">Not scheduled</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                          q.isActive
                            ? "bg-green-50 text-green-700 border border-green-200"
                            : "bg-red-50 text-red-700 border border-red-200"
                        }`}
                      >
                        {q.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEdit(q)}
                          className="p-1 text-[#64748B] hover:text-[#0D1B2A] transition"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(q._id)}
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
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-[#E8EDF2]">
            <div className="flex justify-between items-center px-6 py-4 border-b border-[#E8EDF2]">
              <h2 className="text-lg font-bold text-[#0D1B2A]">
                {editing ? "Edit Question" : "Add Question"}
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
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Category */}
              <div>
                <label className="block text-xs font-semibold text-[#0D1B2A] mb-1">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-[#E8EDF2] text-sm text-[#0D1B2A] outline-none focus:ring-2 focus:ring-[#0EA472]/30 bg-white"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Question */}
              <div>
                <label className="block text-xs font-semibold text-[#0D1B2A] mb-1">Question</label>
                <textarea
                  rows={3}
                  value={form.question}
                  onChange={(e) => setForm((f) => ({ ...f, question: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-[#E8EDF2] text-sm text-[#0D1B2A] outline-none focus:ring-2 focus:ring-[#0EA472]/30 resize-none"
                  required
                />
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-xs font-semibold text-[#0D1B2A] mb-1">Image URL (optional)</label>
                <input
                  type="url"
                  value={form.image}
                  onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-[#E8EDF2] text-sm text-[#0D1B2A] outline-none focus:ring-2 focus:ring-[#0EA472]/30"
                  placeholder="https://..."
                />
              </div>

              {/* Options */}
              <div>
                <label className="block text-xs font-semibold text-[#0D1B2A] mb-2">Options</label>
                <div className="grid grid-cols-2 gap-3">
                  {["A", "B", "C", "D"].map((label, idx) => (
                    <div key={label}>
                      <label className="block text-xs text-[#64748B] mb-1">Option {label}</label>
                      <input
                        value={form.options[idx]}
                        onChange={(e) => {
                          const newOpts = [...form.options];
                          newOpts[idx] = e.target.value;
                          setForm((f) => ({ ...f, options: newOpts }));
                        }}
                        className="w-full px-3 py-2 rounded-lg border border-[#E8EDF2] text-sm text-[#0D1B2A] outline-none focus:ring-2 focus:ring-[#0EA472]/30"
                        required
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Correct Option */}
              <div>
                <label className="block text-xs font-semibold text-[#0D1B2A] mb-1">Correct Option</label>
                <select
                  value={form.correctOption}
                  onChange={(e) => setForm((f) => ({ ...f, correctOption: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-[#E8EDF2] text-sm text-[#0D1B2A] outline-none focus:ring-2 focus:ring-[#0EA472]/30 bg-white"
                >
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                </select>
              </div>

              {/* Explanation */}
              <div>
                <label className="block text-xs font-semibold text-[#0D1B2A] mb-1">Explanation (optional)</label>
                <textarea
                  rows={2}
                  value={form.explanation}
                  onChange={(e) => setForm((f) => ({ ...f, explanation: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-[#E8EDF2] text-sm text-[#0D1B2A] outline-none focus:ring-2 focus:ring-[#0EA472]/30 resize-none"
                />
              </div>

              {/* Difficulty & Tags */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#0D1B2A] mb-1">Difficulty</label>
                  <select
                    value={form.difficulty}
                    onChange={(e) => setForm((f) => ({ ...f, difficulty: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-[#E8EDF2] text-sm text-[#0D1B2A] outline-none focus:ring-2 focus:ring-[#0EA472]/30 bg-white"
                  >
                    {DIFFICULTIES.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#0D1B2A] mb-1">Tags (comma separated)</label>
                  <input
                    value={form.tags}
                    onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-[#E8EDF2] text-sm text-[#0D1B2A] outline-none focus:ring-2 focus:ring-[#0EA472]/30"
                    placeholder="react, arrays"
                  />
                </div>
              </div>

              {/* Scheduled Date */}
              <div>
                <label className="block text-xs font-semibold text-[#0D1B2A] mb-1">Schedule for a specific day (optional)</label>
                <input
                  type="date"
                  value={form.scheduledDate}
                  onChange={(e) => setForm((f) => ({ ...f, scheduledDate: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-[#E8EDF2] text-sm text-[#0D1B2A] outline-none focus:ring-2 focus:ring-[#0EA472]/30"
                />
                <p className="text-xs text-[#64748B] mt-1">
                  If set, this question will appear on the "Today's Question" page for that date.
                </p>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4 border-t border-[#E8EDF2]">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1 py-2 rounded-lg border border-[#E8EDF2] text-[#64748B] hover:bg-[#F8FAFB] transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-lg bg-[#0D1B2A] text-white font-medium hover:bg-[#1E3A5F] transition"
                >
                  {editing ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}