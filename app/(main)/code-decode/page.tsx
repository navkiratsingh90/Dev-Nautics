"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Zap, Trophy, Flame, Star, Code2, Target, ChevronRight,
  CheckCircle, Clock, Terminal, BarChart3, Calendar,
  Filter, X, ChevronLeft,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────────
interface Question {
  _id: string;
  category: "aptitude" | "cs_fundamental" | "puzzle" | "dsa" | "pseudo";
  question: string;
  image?: string;
  options: string[];
  correctOption: string;
  explanation?: string;
  difficulty?: string;
}

interface Submission {
  _id: string;
  question: { _id: string };
  selectedOption: string;
  isCorrect: boolean;
  pointsEarned: number;
}

const CATEGORIES = [
  { key: "all", label: "All" },
  { key: "aptitude", label: "Aptitude" },
  { key: "dsa", label: "DSA" },
  { key: "cs_fundamental", label: "CS Fundamentals" },
  { key: "puzzle", label: "Puzzles" },
  { key: "pseudo", label: "Pseudo Code" },
];

// ─── Helper Components (styled with the new theme) ────────────────────
function CategoryBadge({ category }: { category: string }) {
  const colors: Record<string, string> = {
    aptitude: "bg-cyan-50 text-cyan-700 border-cyan-200",
    dsa: "bg-violet-50 text-violet-700 border-violet-200",
    cs_fundamental: "bg-green-50 text-green-700 border-green-200",
    puzzle: "bg-amber-50 text-amber-700 border-amber-200",
    pseudo: "bg-orange-50 text-orange-700 border-orange-200",
  };
  const cls = colors[category] || "bg-gray-50 text-gray-600 border-gray-200";
  return (
    <span className={`text-[10px] font-mono font-semibold px-2.5 py-0.5 rounded-full border ${cls} uppercase tracking-wider`}>
      {category}
    </span>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────
export default function DailyQuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"today" | "all">("today");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [score, setScore] = useState(0);
  const [submissionData, setSubmissionData] = useState<Record<string, { selectedOption: string; isCorrect: boolean; explanation?: string; pointsEarned: number }>>({});

  // ── Fetch questions ──────────────────────────────────────────────────
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        let url = "/api/daily-question";
        const { data } = await axios.get(url);
        if (data.success) {
          setQuestions(data.data);
          setCurrentIndex(0);
          setSelectedAnswers({});
          setRevealed({});
          await fetchSubmissions(data.data);
        } else {
          setQuestions([]);
        }
      } catch (error) {
        console.error("Failed to fetch questions:", error);
        setQuestions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [viewMode, selectedCategory]);

  // ── Fetch user submissions ──────────────────────────────────────────
  const fetchSubmissions = async (questionsList: Question[]) => {
    try {
      const { data } = await axios.get("/api/submissions");
      if (data.success) {
        const submissions = data.data as Submission[];
        const subMap: Record<string, any> = {};
        submissions.forEach((sub: Submission) => {
          const qId: any = sub.question?._id || sub.question;
          if (qId) {
            const question = questionsList.find(q => q._id === qId);
            subMap[qId] = {
              selectedOption: sub.selectedOption,
              isCorrect: sub.isCorrect,
              pointsEarned: sub.pointsEarned || 0,
              explanation: question?.explanation || "",
            };
          }
        });
        setSubmissionData(subMap);
        const newSelected: Record<string, string> = {};
        const newRevealed: Record<string, boolean> = {};
        Object.keys(subMap).forEach(qId => {
          newSelected[qId] = subMap[qId].selectedOption;
          newRevealed[qId] = true;
        });
        setSelectedAnswers(newSelected);
        setRevealed(newRevealed);
      }
    } catch (error) {
      console.error("Failed to fetch submissions:", error);
    }
  };

  // ── Submission handler ─────────────────────────────────────────────
  const handleOptionSelect = async (questionId: string, optionLabel: string) => {
    if (revealed[questionId] || submissionData[questionId]) return;
    try {
      const response = await axios.post("/api/submissions", {
        questionId,
        selectedOption: optionLabel,
      });
      const data = response.data.data;
      setSelectedAnswers(prev => ({ ...prev, [questionId]: optionLabel }));
      setRevealed(prev => ({ ...prev, [questionId]: true }));
      const question = questions.find(q => q._id === questionId);
      setSubmissionData(prev => ({
        ...prev,
        [questionId]: {
          selectedOption: optionLabel,
          isCorrect: data.isCorrect,
          pointsEarned: data.pointsEarned,
          explanation: question?.explanation || "",
        },
      }));
      if (data.isCorrect) {
        setScore(prev => prev + data.pointsEarned);
      }
    } catch (error) {
      console.error("Submission failed:", error);
    }
  };

  // ── Calculate score ─────────────────────────────────────────────────
  useEffect(() => {
    let correct = 0;
    questions.forEach(q => {
      if (selectedAnswers[q._id] && selectedAnswers[q._id] === q.correctOption) {
        correct++;
      }
    });
    setScore(correct);
  }, [selectedAnswers, questions]);

  const total = questions.length;
  const currentQ = questions[currentIndex] || null;

  const handlePrev = () => { if (currentIndex > 0) setCurrentIndex(currentIndex - 1); };
  const handleNext = () => { if (currentIndex < total - 1) setCurrentIndex(currentIndex + 1); };
  const resetQuiz = () => {
    setSelectedAnswers({});
    setRevealed({});
    setSubmissionData({});
    setCurrentIndex(0);
  };

  if (loading) {
    return (
      <div className="bg-[#F8FAFB] min-h-screen flex items-center justify-center">
        <div className="text-[#64748B]">Loading questions...</div>
      </div>
    );
  }

  if (!currentQ && total === 0) {
    return (
      <div className="bg-[#F8FAFB] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-3">{viewMode === "today" ? "📅" : "📭"}</div>
          <p className="text-sm text-[#64748B]">
            {viewMode === "today"
              ? "No question scheduled for today. Check back tomorrow!"
              : "No questions found for this category."}
          </p>
          {viewMode === "today" && (
            <button
              onClick={() => setViewMode("all")}
              className="mt-4 px-5 py-2 rounded-xl bg-[#0D1B2A] text-white text-sm font-medium hover:bg-[#1E3A5F] transition"
            >
              Browse all questions →
            </button>
          )}
        </div>
      </div>
    );
  }

  const hasSubmitted = !!submissionData[currentQ?._id];
  const isAnswered = revealed[currentQ._id] !== undefined;
  const selectedOption = selectedAnswers[currentQ._id];
  const isCorrect = isAnswered && selectedOption === currentQ.correctOption;
  const submissionInfo = submissionData[currentQ?._id];

  return (
    <div className="bg-[#F8FAFB] min-h-screen py-8 px-4 sm:px-6 font-['Inter',-apple-system,BlinkMacSystemFont,sans-serif]">
      <div className="max-w-4xl mx-auto">

        {/* ── Header ────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-[#EDF7F3] border border-[#A7F3D0] rounded-full py-1 px-3 mb-3 text-xs font-medium text-[#047857]">
              <Code2 className="w-3 h-3 text-[#0EA472]" /> daily-questions.devnautics.io
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-extrabold tracking-tight text-[#0D1B2A]">
                {viewMode === "today" ? "Today's Question" : "All Questions"}
              </h1>
            </div>
            {viewMode === "today" && (
              <p className="text-sm text-[#64748B] mt-1">
                {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
              </p>
            )}
          </div>
        </div>

        {/* ── Category filters (only in "all" mode) ────────────── */}
        {viewMode === "all" && (
          <div className="flex flex-wrap gap-2 mb-6">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`px-4 py-2 rounded-xl text-sm font-mono font-medium border transition ${
                  selectedCategory === cat.key
                    ? "bg-[#EDF7F3] text-[#0EA472] border-[#A7F3D0]"
                    : "bg-white text-[#64748B] border-[#E8EDF2] hover:bg-gray-50"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        )}

        {/* ── Question Card ────────────────────────────────────────── */}
        <div className="bg-white border border-[#E8EDF2] rounded-2xl overflow-hidden shadow-sm">
          <div className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <CategoryBadge category={currentQ.category} />
                <span className="text-xs font-mono text-[#64748B]">#{currentQ._id.slice(-6)}</span>
                {viewMode === "today" && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#EDF7F3] text-[#0EA472] border border-[#A7F3D0]">
                    Today's Pick
                  </span>
                )}
                {hasSubmitted && (
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                    submissionInfo?.isCorrect
                      ? "bg-green-50 text-green-700 border-green-200"
                      : "bg-red-50 text-red-700 border-red-200"
                  }`}>
                    {submissionInfo?.isCorrect ? "✅ Solved" : "❌ Attempted"}
                  </span>
                )}
              </div>
              <span className="text-xs text-[#64748B]">
                {isAnswered ? (isCorrect ? "✅ Correct" : "❌ Incorrect") : "❓ Not answered"}
              </span>
            </div>

            {/* Question text */}
            <div className="mb-5">
              <p className="text-base font-medium text-[#0D1B2A] leading-relaxed">
                {currentQ.question}
              </p>
              {currentQ.image && (
                <div className="mt-4 rounded-xl overflow-hidden border border-[#E8EDF2]">
                  <img src={currentQ.image} alt="Question" className="w-full max-h-64 object-cover" />
                </div>
              )}
            </div>

            {/* Options */}
            <div className="space-y-2.5 mb-6">
              {["A", "B", "C", "D"].map((label, idx) => {
                const opt = currentQ.options[idx];
                const isSelected = selectedOption === label;
                const showCorrect = isAnswered && label === currentQ.correctOption;
                const showWrong = isAnswered && isSelected && label !== currentQ.correctOption;
                const isDisabled = hasSubmitted || isAnswered;

                let borderColor = "border-[#E8EDF2]";
                let bgColor = "bg-white";
                let textColor = "text-[#0D1B2A]";
                let leftBorderColor = "border-l-[#E8EDF2]";

                if (showCorrect) {
                  borderColor = "border-green-300";
                  bgColor = "bg-green-50";
                  textColor = "text-green-700";
                  leftBorderColor = "border-l-green-500";
                } else if (showWrong) {
                  borderColor = "border-red-300";
                  bgColor = "bg-red-50";
                  textColor = "text-red-700";
                  leftBorderColor = "border-l-red-500";
                } else if (isSelected) {
                  borderColor = "border-[#0EA472]";
                  bgColor = "bg-[#EDF7F3]";
                  textColor = "text-[#0D1B2A]";
                  leftBorderColor = "border-l-[#0EA472]";
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleOptionSelect(currentQ._id, label)}
                    disabled={isDisabled}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-left transition border ${borderColor} border-l-[3px] ${leftBorderColor} ${bgColor} ${textColor} ${
                      isDisabled ? "cursor-default opacity-70" : "cursor-pointer hover:bg-[#F8FAFB]"
                    }`}
                  >
                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-mono font-bold shrink-0 ${
                      isSelected || showCorrect || showWrong
                        ? `${showCorrect ? "bg-green-200 text-green-800" : showWrong ? "bg-red-200 text-red-800" : "bg-[#0EA472] text-white"}`
                        : "bg-gray-100 text-gray-500"
                    }`}>
                      {label}
                    </span>
                    <span className="flex-1">{opt}</span>
                    {showCorrect && <CheckCircle className="w-4 h-4 shrink-0 text-green-600" />}
                    {showWrong && <X className="w-4 h-4 shrink-0 text-red-600" />}
                  </button>
                );
              })}
            </div>

            {/* Explanation */}
            {(isAnswered || hasSubmitted) && (currentQ.explanation || submissionInfo?.explanation) && (
              <div className={`p-4 rounded-xl text-sm mb-4 border ${
                (isAnswered && isCorrect) || (hasSubmitted && submissionInfo?.isCorrect)
                  ? "bg-green-50 border-green-200"
                  : "bg-red-50 border-red-200"
              }`}>
                <p className={`font-semibold mb-1 ${
                  (isAnswered && isCorrect) || (hasSubmitted && submissionInfo?.isCorrect)
                    ? "text-green-700"
                    : "text-red-700"
                }`}>
                  {(isAnswered && isCorrect) || (hasSubmitted && submissionInfo?.isCorrect) ? "✅ Correct" : "❌ Incorrect"}
                  {submissionInfo?.pointsEarned && submissionInfo.pointsEarned > 0 && ` (+${submissionInfo.pointsEarned} pts)`}
                </p>
                <p className="text-[#64748B] text-xs">{currentQ.explanation || submissionInfo?.explanation || ""}</p>
                {hasSubmitted && (
                  <p className="text-xs text-[#64748B] mt-2">
                    You already submitted this question. {submissionInfo?.isCorrect ? "Great job!" : "Keep practicing!"}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Stats ───────────────────────────────────────────────── */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Attempted", value: Object.keys(revealed).length, color: "text-cyan-600" },
            { label: "Correct", value: score, color: "text-green-600" },
            { label: "Incorrect", value: Object.keys(revealed).length - score, color: "text-red-600" },
            { label: "Accuracy", value: Object.keys(revealed).length > 0
                ? Math.round((score / Object.keys(revealed).length) * 100) + "%"
                : "—", color: "text-amber-600" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white border border-[#E8EDF2] rounded-xl p-4 text-center shadow-sm">
              <div className={`text-2xl font-mono font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-xs text-[#64748B] mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* ── Navigation dots ────────────────────────────────────── */}
        {total > 1 && (
          <div className="flex justify-center gap-1.5 mt-6">
            {questions.map((_, idx) => {
              const q = questions[idx];
              const isAnswered = revealed[q._id] !== undefined;
              const isCorrect = isAnswered && selectedAnswers[q._id] === q.correctOption;
              return (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-2 h-2 rounded-full transition ${
                    idx === currentIndex
                      ? "bg-[#0D1B2A]"
                      : isAnswered
                        ? isCorrect ? "bg-green-500" : "bg-red-500"
                        : "bg-[#E8EDF2]"
                  }`}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}