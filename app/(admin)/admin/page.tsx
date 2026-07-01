"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import {
  Plus, Pencil, Trash2, X, Check, ChevronDown,
  ChevronLeft, ChevronRight,
} from "lucide-react";

const C = {
  pageBg:      "#08080F",
  cardBg:      "#0D0D1A",
  surface:     "#131325",
  surface2:    "#1A1A2E",
  violet:      "#7C3AED",
  violetDim:   "rgba(124,58,237,0.12)",
  violetBorder:"rgba(124,58,237,0.20)",
  cyan:        "#06B6D4",
  green:       "#10B981",
  red:         "#EF4444",
  textPrimary: "#F0EFFF",
  textMuted:   "#6B7280",
  border:      "rgba(255,255,255,0.06)",
};

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

export default function AdminQuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Question | null>(null);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

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

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/api/daily-question/add");
      if (data.success) {
        setQuestions(data.data);
      }
    } catch (error) {
      toast.error("Failed to load questions");
    } finally {
      setLoading(false);
    }
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.question.trim() || form.options.some(o => !o.trim())) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      const payload = {
        ...form,
        tags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
        options: form.options,
      };

      let response;
      if (editing) {
        // Update existing question
        response = await axios.put(`/api/daily-question/add/${editing._id}`, payload);
        toast.success("Question updated");
      } else {
        // Create new question
        response = await axios.post("/api/daily-question/add", payload);
        toast.success("Question created");
      }

      await fetchQuestions();
      setShowModal(false);
      resetForm();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save question");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this question?")) return;
    try {
      await axios.delete(`/api/questions/${id}`);
      toast.success("Question deleted");
      await fetchQuestions();
    } catch (error) {
      toast.error("Failed to delete question");
    }
  };

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

  const filtered = questions.filter(q => {
    const matchSearch = q.question.toLowerCase().includes(search.toLowerCase());
    const matchCategory = selectedCategory === "all" || q.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  return (
    <div style={{ background: C.pageBg, minHeight: "100vh", color: C.textPrimary }}
      className="py-8 px-4 sm:px-6 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Manage Questions</h1>
            <p style={{ color: C.textMuted }} className="text-sm mt-1">
              Create, edit, and delete questions for the Daily Questions feature.
            </p>
          </div>
          <button
            onClick={() => { resetForm(); setShowModal(true); }}
            style={{ background: C.violet }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" /> Add Question
          </button>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-wrap gap-4 mb-6">
          <input
            type="text"
            placeholder="Search questions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              background: C.surface,
              border: `1px solid ${C.border}`,
              color: C.textPrimary,
            }}
            className="flex-1 min-w-[200px] px-4 py-2 rounded-xl text-sm outline-none focus:ring-1 focus:ring-violet-500"
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{
              background: C.surface,
              border: `1px solid ${C.border}`,
              color: C.textPrimary,
            }}
            className="px-4 py-2 rounded-xl text-sm outline-none focus:ring-1 focus:ring-violet-500"
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Questions Table */}
        {loading ? (
          <div className="text-center py-10" style={{ color: C.textMuted }}>Loading...</div>
        ) : filtered.length === 0 ? (
          <div style={{ background: C.cardBg, border: `1px solid ${C.border}` }}
            className="rounded-2xl p-12 text-center">
            <div className="text-4xl mb-3">📭</div>
            <p style={{ color: C.textMuted }} className="text-sm">No questions found.</p>
          </div>
        ) : (
          <div style={{ background: C.cardBg, border: `1px solid ${C.border}` }}
            className="rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead style={{ borderBottom: `1px solid ${C.border}` }}>
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-medium" style={{ color: C.textMuted }}>Question</th>
                    <th className="text-left px-4 py-3 text-xs font-medium" style={{ color: C.textMuted }}>Category</th>
                    <th className="text-left px-4 py-3 text-xs font-medium" style={{ color: C.textMuted }}>Difficulty</th>
                    <th className="text-left px-4 py-3 text-xs font-medium" style={{ color: C.textMuted }}>Correct</th>
                    <th className="text-left px-4 py-3 text-xs font-medium" style={{ color: C.textMuted }}>Status</th>
                    <th className="text-right px-4 py-3 text-xs font-medium" style={{ color: C.textMuted }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((q) => (
                    <tr key={q._id} style={{ borderBottom: `1px solid ${C.border}` }}>
                      <td className="px-4 py-3 max-w-xs truncate" style={{ color: C.textPrimary }}>
                        {q.question}
                      </td>
                      <td className="px-4 py-3">
                        <span style={{
                          color: C.cyan,
                          background: C.cyanDim,
                          border: `1px solid ${C.cyan}25`,
                        }}
                          className="text-[10px] font-mono px-2 py-0.5 rounded-full">
                          {q.category}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span style={{
                          color: q.difficulty === "easy" ? C.green : q.difficulty === "medium" ? "#F59E0B" : C.red,
                          background: q.difficulty === "easy" ? C.greenDim : q.difficulty === "medium" ? "rgba(245,158,11,0.12)" : C.redDim,
                        }}
                          className="text-[10px] font-mono px-2 py-0.5 rounded-full">
                          {q.difficulty}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-mono" style={{ color: C.textMuted }}>{q.correctOption}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span style={{
                          color: q.isActive ? C.green : C.red,
                          background: q.isActive ? C.greenDim : C.redDim,
                        }}
                          className="text-[10px] font-mono px-2 py-0.5 rounded-full">
                          {q.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEdit(q)}
                            style={{ color: C.textMuted }}
                            className="p-1 hover:text-white transition-colors"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(q._id)}
                            style={{ color: C.textMuted }}
                            className="p-1 hover:text-red-400 transition-colors"
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
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div style={{ background: C.cardBg, border: `1px solid ${C.border}` }}
            className="w-full max-w-2xl rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center px-6 py-4 border-b" style={{ borderColor: C.border }}>
              <h2 className="text-lg font-bold">{editing ? "Edit Question" : "Add Question"}</h2>
              <button onClick={() => { setShowModal(false); resetForm(); }}
                className="text-gray-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Category */}
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: C.textMuted }}>Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))}
                  style={{ background: C.surface, border: `1px solid ${C.border}`, color: C.textPrimary }}
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none focus:ring-1 focus:ring-violet-500"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              {/* Question */}
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: C.textMuted }}>Question</label>
                <textarea
                  rows={3}
                  value={form.question}
                  onChange={(e) => setForm(f => ({ ...f, question: e.target.value }))}
                  style={{ background: C.surface, border: `1px solid ${C.border}`, color: C.textPrimary }}
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none focus:ring-1 focus:ring-violet-500 resize-none"
                  required
                />
              </div>
              {/* Image URL */}
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: C.textMuted }}>Image URL (optional)</label>
                <input
                  type="url"
                  value={form.image}
                  onChange={(e) => setForm(f => ({ ...f, image: e.target.value }))}
                  style={{ background: C.surface, border: `1px solid ${C.border}`, color: C.textPrimary }}
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none focus:ring-1 focus:ring-violet-500"
                  placeholder="https://..."
                />
              </div>
              {/* Options */}
              <div className="grid grid-cols-2 gap-3">
                {["A", "B", "C", "D"].map((label, idx) => (
                  <div key={label}>
                    <label className="block text-xs font-medium mb-1" style={{ color: C.textMuted }}>Option {label}</label>
                    <input
                      value={form.options[idx]}
                      onChange={(e) => {
                        const newOpts = [...form.options];
                        newOpts[idx] = e.target.value;
                        setForm(f => ({ ...f, options: newOpts }));
                      }}
                      style={{ background: C.surface, border: `1px solid ${C.border}`, color: C.textPrimary }}
                      className="w-full px-3 py-2 rounded-lg text-sm outline-none focus:ring-1 focus:ring-violet-500"
                      required
                    />
                  </div>
                ))}
              </div>
              {/* Correct Option */}
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: C.textMuted }}>Correct Option</label>
                <select
                  value={form.correctOption}
                  onChange={(e) => setForm(f => ({ ...f, correctOption: e.target.value }))}
                  style={{ background: C.surface, border: `1px solid ${C.border}`, color: C.textPrimary }}
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none focus:ring-1 focus:ring-violet-500"
                >
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                </select>
              </div>
              {/* Explanation */}
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: C.textMuted }}>Explanation (optional)</label>
                <textarea
                  rows={2}
                  value={form.explanation}
                  onChange={(e) => setForm(f => ({ ...f, explanation: e.target.value }))}
                  style={{ background: C.surface, border: `1px solid ${C.border}`, color: C.textPrimary }}
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none focus:ring-1 focus:ring-violet-500 resize-none"
                />
              </div>
              {/* Difficulty & Tags */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: C.textMuted }}>Difficulty</label>
                  <select
                    value={form.difficulty}
                    onChange={(e) => setForm(f => ({ ...f, difficulty: e.target.value }))}
                    style={{ background: C.surface, border: `1px solid ${C.border}`, color: C.textPrimary }}
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none focus:ring-1 focus:ring-violet-500"
                  >
                    {DIFFICULTIES.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: C.textMuted }}>Tags (comma separated)</label>
                  <input
                    value={form.tags}
                    onChange={(e) => setForm(f => ({ ...f, tags: e.target.value }))}
                    style={{ background: C.surface, border: `1px solid ${C.border}`, color: C.textPrimary }}
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none focus:ring-1 focus:ring-violet-500"
                    placeholder="react, arrays"
                  />
                </div>
              </div>
              {/* Scheduled Date */}
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: C.textMuted }}>Scheduled Date (YYYY-MM-DD, optional)</label>
                <input
                  type="date"
                  value={form.scheduledDate}
                  onChange={(e) => setForm(f => ({ ...f, scheduledDate: e.target.value }))}
                  style={{ background: C.surface, border: `1px solid ${C.border}`, color: C.textPrimary }}
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none focus:ring-1 focus:ring-violet-500"
                />
              </div>
              {/* Buttons */}
              <div className="flex gap-3 pt-4 border-t" style={{ borderColor: C.border }}>
                <button type="button" onClick={() => { setShowModal(false); resetForm(); }}
                  className="flex-1 py-2 rounded-lg border" style={{ borderColor: C.border, color: C.textMuted }}>
                  Cancel
                </button>
                <button type="submit"
                  style={{ background: C.violet }}
                  className="flex-1 py-2 rounded-lg text-white font-medium hover:opacity-90 transition-opacity">
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