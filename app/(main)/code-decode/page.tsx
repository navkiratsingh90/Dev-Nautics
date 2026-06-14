"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Zap, Trophy, Flame, Star, TrendingUp, Clock,
  CheckCircle, Code2, Target, ChevronRight, BarChart3, Calendar,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────
interface Problem {
  id: number; name: string; title: string; difficulty: "Easy" | "Medium" | "Hard";
  points: number; question: string; example?: string; topic?: string;
}
interface LeaderboardUser {
  rank: number; name: string; points: number; problemsSolved: number;
  avatar: string; isMe?: boolean; streak?: number;
}
interface SolvedProblem {
  id: number; title: string; difficulty: "Easy" | "Medium" | "Hard";
  date: string; points: number;
}

// ─── Static data ────────────────────────────────────────────────
const dailyProblem: Problem = {
  id: 1, name: "two-sum", title: "Two Sum", difficulty: "Easy", points: 15,
  topic: "Arrays & Hashing",
  question: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume each input has exactly one solution, and you may not use the same element twice.",
  example: "Input:  nums = [2,7,11,15], target = 9\nOutput: [0,1]\nReason: nums[0] + nums[1] == 9",
};

const csFundamentalsProblem: Problem = {
  id: 2, name: "database-normalization", title: "Database Normalization",
  difficulty: "Medium", points: 10, topic: "RDBMS",
  question: "Which of the following best describes the purpose of database normalization?",
};

const leaderboard: LeaderboardUser[] = [
  { rank: 1, name: "Alex Chen",       points: 1245, problemsSolved: 89, avatar: "AC", streak: 42  },
  { rank: 2, name: "Sarah Kim",       points: 1180, problemsSolved: 84, avatar: "SK", streak: 38  },
  { rank: 3, name: "Mike Rodriguez",  points: 1120, problemsSolved: 81, avatar: "MR", streak: 31  },
  { rank: 4, name: "You",             points:  985, problemsSolved: 72, avatar: "ME", isMe: true, streak: 5 },
  { rank: 5, name: "Emma Wilson",     points:  920, problemsSolved: 68, avatar: "EW", streak: 22  },
  { rank: 6, name: "James Brown",     points:  875, problemsSolved: 65, avatar: "JB", streak: 14  },
  { rank: 7, name: "Lisa Zhang",      points:  810, problemsSolved: 61, avatar: "LZ", streak: 9   },
];

const solvedProblems: SolvedProblem[] = [
  { id: 1, title: "Reverse String",          difficulty: "Easy",   date: "2025-04-12", points: 10 },
  { id: 2, title: "Valid Parentheses",        difficulty: "Easy",   date: "2025-04-11", points: 10 },
  { id: 3, title: "Merge Two Sorted Lists",   difficulty: "Medium", date: "2025-04-10", points: 15 },
  { id: 4, title: "Binary Search",            difficulty: "Easy",   date: "2025-04-09", points: 10 },
  { id: 5, title: "Maximum Subarray",         difficulty: "Medium", date: "2025-04-08", points: 15 },
  { id: 6, title: "Climbing Stairs",          difficulty: "Easy",   date: "2025-04-07", points: 10 },
];

const monthlyProgress = {
  totalSolved: 12, easySolved: 8, mediumSolved: 3, hardSolved: 1,
  currentStreak: 5, pointsEarned: 180,
};

const quickStats = [
  { label: "Global Rank",      value: "#4" },
  { label: "Total Points",     value: "985" },
  { label: "Problems Solved",  value: "72" },
  { label: "Success Rate",     value: "87%" },
];

// ─── Difficulty chip (solid colors) ────────────────────────────
function DiffChip({ diff }: { diff: "Easy" | "Medium" | "Hard" }) {
  const colors = {
    Easy:   "bg-green-100 text-green-700",
    Medium: "bg-amber-100 text-amber-700",
    Hard:   "bg-red-100 text-red-700",
  };
  return <span className={`text-xs px-2 py-0.5 rounded-full ${colors[diff]}`}>{diff}</span>;
}

// ─── Daily timer (simple) ──────────────────────────────────────
function DailyTimer() {
  const [timeLeft, setTimeLeft] = useState("");
  useEffect(() => {
    function update() {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);
      const diff = midnight.getTime() - now.getTime();
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`);
    }
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
      <Clock className="w-3 h-3" /> {timeLeft}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────
export default function CodeDecodePage() {
  const [quizSelected, setQuizSelected] = useState<string | null>(null);
  const [quizRevealed, setQuizRevealed] = useState(false);
  const correctAnswer = "A";
  const quizOptions = [
    { id: "A", text: "To reduce data redundancy and dependency" },
    { id: "B", text: "To increase data duplication for faster access" },
    { id: "C", text: "To complicate the database structure" },
    { id: "D", text: "To eliminate all primary keys from tables" },
  ];

  return (
    <div className="bg-gray-50 min-h-screen font-sans py-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Hero */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-3 py-1 text-xs text-green-700 mb-3">
            <Code2 className="w-3.5 h-3.5" /> Practice Platform · Daily Challenges Live
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Code & Decode</h1>
          <p className="text-sm text-gray-500 mt-1">Sharpen your problem‑solving, climb the leaderboard, and maintain your streak.</p>
        </div>

        {/* Hero stats row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center text-white">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{monthlyProgress.currentStreak}</div>
              <div className="text-xs text-gray-500">Day streak</div>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500 flex items-center justify-center text-white">
              <Star className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{monthlyProgress.pointsEarned}</div>
              <div className="text-xs text-gray-500">Points earned</div>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500 flex items-center justify-center text-white">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{monthlyProgress.totalSolved}</div>
              <div className="text-xs text-gray-500">Solved this month</div>
            </div>
          </div>
        </div>

        {/* Two‑column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left (2 cols) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Daily Challenge */}
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex flex-wrap justify-between items-center gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gray-800 flex items-center justify-center text-white">
                    <Star className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-gray-900">Daily Challenge</h2>
                    <p className="text-xs text-gray-500">Solve to keep your streak alive!</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <DiffChip diff={dailyProblem.difficulty} />
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">+{dailyProblem.points} pts</span>
                  <DailyTimer />
                </div>
              </div>
              <div className="p-6">
                <div className="text-xs text-cyan-600 bg-cyan-50 inline-block px-2 py-0.5 rounded-full mb-2">{dailyProblem.topic}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{dailyProblem.title}</h3>
                <p className="text-sm text-gray-600 mb-4">{dailyProblem.question}</p>
                {dailyProblem.example && (
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-5">
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Example</p>
                    <pre className="text-xs text-gray-700 whitespace-pre-wrap">{dailyProblem.example}</pre>
                  </div>
                )}
                <Link href={`/code-decode/${dailyProblem.name}`}>
                  <button className="w-full py-3 rounded-xl text-sm font-semibold bg-gray-800 text-white hover:bg-gray-700 flex items-center justify-center gap-2">
                    <Zap className="w-4 h-4" /> Solve Now <ChevronRight className="w-4 h-4" />
                  </button>
                </Link>
              </div>
            </div>

            {/* CS Fundamentals Quiz */}
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex flex-wrap justify-between items-center gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-fuchsia-500 flex items-center justify-center text-white">
                    <Target className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-gray-900">CS Fundamentals Quiz</h2>
                    <p className="text-xs text-gray-500">Test your theoretical knowledge</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <DiffChip diff={csFundamentalsProblem.difficulty} />
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">+{csFundamentalsProblem.points} pts</span>
                </div>
              </div>
              <div className="p-6">
                <div className="text-xs text-purple-600 bg-purple-50 inline-block px-2 py-0.5 rounded-full mb-2">{csFundamentalsProblem.topic}</div>
                <h3 className="text-base font-bold text-gray-900 mb-2">{csFundamentalsProblem.title}</h3>
                <p className="text-sm text-gray-600 mb-5">{csFundamentalsProblem.question}</p>

                <div className="space-y-2.5 mb-5">
                  {quizOptions.map(opt => {
                    const isSelected = quizSelected === opt.id;
                    const isCorrect = opt.id === correctAnswer;
                    let bgClass = "bg-gray-50 border-gray-200 hover:border-gray-300";
                    if (quizRevealed && isCorrect) bgClass = "bg-green-100 border-green-300";
                    else if (quizRevealed && isSelected && !isCorrect) bgClass = "bg-red-100 border-red-300";
                    else if (isSelected) bgClass = "bg-blue-50 border-blue-300";
                    return (
                      <button
                        key={opt.id}
                        className={`w-full flex items-start gap-3 px-4 py-3 rounded-xl border text-sm text-left ${bgClass}`}
                        onClick={() => { if (!quizRevealed) setQuizSelected(opt.id); }}
                      >
                        <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                          quizRevealed && isCorrect ? "bg-green-200 text-green-800" :
                          quizRevealed && isSelected && !isCorrect ? "bg-red-200 text-red-800" :
                          isSelected ? "bg-blue-200 text-blue-800" : "bg-gray-200 text-gray-700"
                        }`}>{opt.id}</span>
                        {opt.text}
                      </button>
                    );
                  })}
                </div>

                <button
                  disabled={!quizSelected}
                  onClick={() => setQuizRevealed(true)}
                  className={`w-full py-3 rounded-xl text-sm font-semibold ${
                    !quizSelected
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : quizRevealed
                        ? "bg-green-100 text-green-700 border border-green-300"
                        : "bg-gray-800 text-white hover:bg-gray-700"
                  }`}
                >
                  {quizRevealed ? "✓ Answer revealed" : quizSelected ? "Submit Answer" : "Select an option first"}
                </button>

                {quizRevealed && (
                  <div className="mt-4 p-4 rounded-xl bg-green-50 border border-green-200 text-sm text-green-800">
                    <p className="font-semibold mb-1">✓ Correct! Database normalization reduces redundancy.</p>
                    <p className="text-xs text-green-700">Normalization follows normal forms (1NF, 2NF, 3NF) to eliminate anomalies and improve integrity.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Monthly Progress */}
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex flex-wrap justify-between items-center gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gray-800 flex items-center justify-center text-white">
                    <BarChart3 className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-gray-900">Monthly Progress</h2>
                    <p className="text-xs text-gray-500">April 2025</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-sm font-bold text-orange-600">
                  <Flame className="w-4 h-4" /> {monthlyProgress.currentStreak} day streak
                </div>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Total", value: monthlyProgress.totalSolved, max: 30, color: "bg-purple-500" },
                    { label: "Easy", value: monthlyProgress.easySolved, max: 20, color: "bg-green-500" },
                    { label: "Medium", value: monthlyProgress.mediumSolved, max: 10, color: "bg-amber-500" },
                    { label: "Hard", value: monthlyProgress.hardSolved, max: 5, color: "bg-red-500" },
                  ].map(p => (
                    <div key={p.label} className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                      <div className="text-2xl font-bold text-gray-900 mb-0.5">{p.value}</div>
                      <div className="text-xs text-gray-500 mb-2">{p.label}</div>
                      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${p.color}`} style={{ width: `${Math.min((p.value / p.max) * 100, 100)}%` }} />
                      </div>
                    </div>
                  ))}
                </div>

                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-sm font-bold text-gray-900">Recently solved</h3>
                    <Link href="/code-decode/history"><span className="text-xs text-blue-600 hover:underline cursor-pointer">View all →</span></Link>
                  </div>
                  <div className="space-y-2">
                    {solvedProblems.map(p => (
                      <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                        <div className="w-7 h-7 rounded-lg bg-green-100 flex items-center justify-center text-green-600">
                          <CheckCircle className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-gray-900">{p.title}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <DiffChip diff={p.difficulty} />
                            <span className="text-xs text-gray-500 flex items-center gap-1"><Calendar className="w-2.5 h-2.5" />{p.date}</span>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-amber-600">+{p.points}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-200 flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-cyan-500 flex items-center justify-center text-white">
                  <Zap className="w-4 h-4" />
                </div>
                <h2 className="text-sm font-bold text-gray-900">Quick Stats</h2>
              </div>
              <div className="p-5 space-y-3">
                {quickStats.map(s => (
                  <div key={s.label} className="flex justify-between items-center p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <span className="text-xs text-gray-500">{s.label}</span>
                    <span className="text-sm font-bold text-gray-900">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Leaderboard */}
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-200 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-500 flex items-center justify-center text-white">
                    <Trophy className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-gray-900">Leaderboard</h2>
                    <p className="text-xs text-gray-500">All‑time top performers</p>
                  </div>
                </div>
                <Link href="/code-decode/leaderboard"><span className="text-xs text-blue-600 hover:underline">Full →</span></Link>
              </div>
              <div className="p-4 space-y-2">
                {leaderboard.map((user, idx) => (
                  <div
                    key={user.rank}
                    className={`flex items-center gap-3 p-3 rounded-xl border ${
                      user.isMe
                        ? "bg-blue-50 border-blue-200"
                        : "bg-gray-50 border-gray-100"
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                      user.rank === 1 ? "bg-amber-400 text-amber-900" :
                      user.rank === 2 ? "bg-gray-300 text-gray-700" :
                      user.rank === 3 ? "bg-orange-400 text-orange-900" :
                      "bg-gray-200 text-gray-600"
                    }`}>{user.rank}</div>
                    <div className="w-8 h-8 rounded-lg bg-gray-300 flex items-center justify-center text-xs font-bold text-gray-800 shrink-0">
                      {user.avatar}
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-semibold text-gray-900">
                        {user.name}{user.isMe && <span className="ml-1 text-xs text-blue-600">(you)</span>}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500">
                        <span>{user.problemsSolved} solved</span>
                        {user.streak && <span className="flex items-center gap-0.5 text-orange-500"><Flame className="w-2.5 h-2.5" />{user.streak}</span>}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-amber-600">{user.points}</div>
                      <div className="text-[10px] text-gray-500">pts</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}