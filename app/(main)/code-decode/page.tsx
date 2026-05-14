"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import { useAppSelector } from "@/redux/hooks";
import {
  Zap, Trophy, Flame, Star, TrendingUp, Clock,
  CheckCircle, Code2, Target, ChevronRight, BarChart3, Calendar,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Problem {
  id: number; name: string; title: string; difficulty: "Easy" | "Medium" | "Hard";
  points: number; question: string; example?: string; topic?: string;
  starterCode?: string;
}
interface LeaderboardUser {
  rank: number; name: string; points: number; problemsSolved: number;
  avatar: string; isMe?: boolean; streak?: number;
}
interface SolvedProblem {
  id: number; title: string; difficulty: "Easy" | "Medium" | "Hard";
  date: string; points: number;
}

// ─── Static data (replace with API calls) ────────────────────────────────────
const dailyProblem: Problem = {
  id: 1, name: "two-sum", title: "Two Sum", difficulty: "Easy", points: 15,
  topic: "Arrays & Hashing",
  question: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume each input has exactly one solution, and you may not use the same element twice.",
  example: "Input:  nums = [2,7,11,15], target = 9\nOutput: [0,1]\nReason: nums[0] + nums[1] == 9",
  starterCode: `function twoSum(nums, target) {\n  // Your solution here\n}`,
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
  { label: "Global Rank",      value: "#4",  accent: "violet"  },
  { label: "Total Points",     value: "985", accent: "amber"   },
  { label: "Problems Solved",  value: "72",  accent: "cyan"    },
  { label: "Success Rate",     value: "87%", accent: "green"   },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const difficultyConfig = {
  Easy:   { text: "text-green-400",  bg: "bg-green-500/15 border-green-500/30"   },
  Medium: { text: "text-amber-400",  bg: "bg-amber-500/15 border-amber-500/30"   },
  Hard:   { text: "text-red-400",    bg: "bg-red-500/15 border-red-500/30"       },
};

const rankConfig: Record<number, string> = {
  1: "bg-amber-400 text-amber-900",
  2: "bg-gray-300 text-gray-700",
  3: "bg-orange-400 text-orange-900",
};

const avatarGradients = [
  "from-violet-500 to-fuchsia-500", "from-cyan-500 to-blue-500",
  "from-fuchsia-500 to-pink-500",   "from-amber-500 to-orange-500",
  "from-green-500 to-emerald-500",  "from-blue-500 to-violet-500",
  "from-rose-500 to-fuchsia-500",
];

function useInView(threshold = 0.08) {
  const ref = useRef<HTMLDivElement>(null);
  const [v, setV] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setV(true); o.disconnect(); } }, { threshold });
    o.observe(el); return () => o.disconnect();
  }, [threshold]);
  return { ref, inView: v };
}

// ─── Animated counter ─────────────────────────────────────────────────────────
function Counter({ to, duration = 1000 }: { to: number; duration?: number }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = 0; const step = to / (duration / 16);
    const id = setInterval(() => {
      start += step; if (start >= to) { setVal(to); clearInterval(id); } else setVal(Math.floor(start));
    }, 16);
    return () => clearInterval(id);
  }, [to, duration]);
  return <>{val}</>;
}

// ─── Difficulty chip ──────────────────────────────────────────────────────────
function DiffChip({ diff }: { diff: "Easy" | "Medium" | "Hard" }) {
  const c = difficultyConfig[diff];
  return <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${c.bg} ${c.text}`}>{diff}</span>;
}

// ─── Section header ───────────────────────────────────────────────────────────
function SectionHeader({ icon, title, subtitle, darkMode }: { icon: React.ReactNode; title: string; subtitle?: string; darkMode: boolean }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-400 flex items-center justify-center text-white shrink-0">
        {icon}
      </div>
      <div>
        <h2 className={`text-base font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>{title}</h2>
        {subtitle && <p className={`text-xs mt-0.5 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{subtitle}</p>}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CodeDecodePage() {
  const darkMode = useAppSelector((state: any) => state.Theme.darkMode);
  const [mounted, setMounted] = useState(false);
  const heroSection   = useInView();
  const statsSection  = useInView();

  useEffect(() => { setMounted(true); }, []);

  // ── Theme tokens ──────────────────────────────────────────────────────────
  const bg          = darkMode ? "bg-gray-900 text-white"        : "bg-white text-gray-800";
  const cardBg      = darkMode ? "bg-gray-800 border-gray-700/60": "bg-white border-gray-200";
  const surfaceBg   = darkMode ? "bg-gray-800/50"                : "bg-gray-50";
  const mutedText   = darkMode ? "text-gray-400"                 : "text-gray-500";
  const headingText = darkMode ? "text-white"                    : "text-gray-900";
  const divider     = darkMode ? "border-gray-700/60"            : "border-gray-100";
  const accentGradient = "from-violet-500 via-fuchsia-500 to-cyan-400";
  const accentText     = "bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent";

  return (
    <div className={`min-h-screen ${bg} transition-colors duration-300 font-sans`}>

      {/* ── HERO ── */}
      <section className={`relative overflow-hidden border-b ${divider}`}>
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `linear-gradient(${darkMode ? "#fff" : "#000"} 1px, transparent 1px), linear-gradient(90deg, ${darkMode ? "#fff" : "#000"} 1px, transparent 1px)`, backgroundSize: "50px 50px" }} />
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div ref={heroSection.ref} className="relative max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            {/* Left copy */}
            <div className="max-w-lg"
              style={{ opacity: heroSection.inView ? 1 : 0, transform: heroSection.inView ? "none" : "translateY(20px)", transition: "opacity 0.6s ease, transform 0.6s ease" }}>
              <div className={`inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full border text-xs font-medium ${darkMode ? "bg-violet-500/10 border-violet-500/30 text-violet-300" : "bg-violet-50 border-violet-200 text-violet-600"}`}>
                <Code2 className="w-3.5 h-3.5" />
                Practice Platform · Daily Challenges Live
              </div>
              <h1 className={`text-4xl md:text-5xl font-extrabold tracking-tight leading-tight mb-3 ${headingText}`}>
                Code <span className={accentText}>&amp;</span> Decode
              </h1>
              <p className={`text-base ${mutedText} leading-relaxed`}>
                Sharpen your problem-solving, climb the leaderboard, and maintain your streak — one challenge at a time.
              </p>
            </div>

            {/* Streak + points hero stats */}
            <div ref={statsSection.ref} className="flex flex-wrap gap-3"
              style={{ opacity: statsSection.inView ? 1 : 0, transform: statsSection.inView ? "none" : "translateY(20px)", transition: "opacity 0.6s ease 0.15s, transform 0.6s ease 0.15s" }}>
              {[
                { icon: <Flame className="w-5 h-5" />, value: monthlyProgress.currentStreak, label: "Day streak",   from: "from-orange-500", to: "to-amber-400"  },
                { icon: <Star  className="w-5 h-5" />, value: monthlyProgress.pointsEarned,  label: "Points earned", from: "from-violet-500", to: "to-fuchsia-500"},
                { icon: <CheckCircle className="w-5 h-5" />, value: monthlyProgress.totalSolved, label: "Solved this month", from: "from-cyan-500", to: "to-blue-500" },
              ].map((s, i) => (
                <div key={s.label} className={`flex items-center gap-3 px-5 py-4 rounded-2xl border ${cardBg}`}>
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.from} ${s.to} flex items-center justify-center text-white shrink-0`}>{s.icon}</div>
                  <div>
                    <div className={`text-2xl font-extrabold tracking-tight ${headingText}`}>{s.value}</div>
                    <div className={`text-xs ${mutedText}`}>{s.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── MAIN GRID ── */}
      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ── LEFT (2 cols) ── */}
        <div className="lg:col-span-2 space-y-7">

          {/* Daily Coding Challenge */}
          <DailyChallengeCard problem={dailyProblem} darkMode={darkMode} cardBg={cardBg} mutedText={mutedText} headingText={headingText} divider={divider} accentGradient={accentGradient} />

          {/* CS Fundamentals */}
          <CsFundamentalsCard problem={csFundamentalsProblem} darkMode={darkMode} cardBg={cardBg} mutedText={mutedText} headingText={headingText} divider={divider} accentGradient={accentGradient} />

          {/* Monthly Progress */}
          <MonthlyProgressCard
            progress={monthlyProgress} solvedProblems={solvedProblems}
            darkMode={darkMode} cardBg={cardBg} mutedText={mutedText} headingText={headingText} divider={divider} accentGradient={accentGradient}
          />
        </div>

        {/* ── RIGHT SIDEBAR ── */}
        <div className="space-y-6">

          {/* Quick stats */}
          <QuickStatsCard stats={quickStats} darkMode={darkMode} cardBg={cardBg} mutedText={mutedText} headingText={headingText} divider={divider} accentText={accentText} />

          {/* Leaderboard */}
          <LeaderboardCard leaderboard={leaderboard} darkMode={darkMode} cardBg={cardBg} mutedText={mutedText} headingText={headingText} divider={divider} accentGradient={accentGradient} />
        </div>
      </div>

      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}

// ─── Daily Challenge Card ─────────────────────────────────────────────────────
function DailyChallengeCard({ problem, darkMode, cardBg, mutedText, headingText, divider, accentGradient }: any) {
  const { ref, inView } = useInView();
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    function calc() {
      const now = new Date(); const midnight = new Date(); midnight.setHours(24, 0, 0, 0);
      const diff = midnight.getTime() - now.getTime();
      const h = Math.floor(diff / 3600000); const m = Math.floor((diff % 3600000) / 60000); const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`);
    }
    calc(); const id = setInterval(calc, 1000); return () => clearInterval(id);
  }, []);

  return (
    <div ref={ref} className={`rounded-2xl border overflow-hidden transition-all duration-300 hover:shadow-xl ${cardBg} ${darkMode ? "hover:border-violet-500/40 hover:shadow-violet-500/5" : "hover:border-violet-300 hover:shadow-violet-100"}`}
      style={{ opacity: inView ? 1 : 0, transform: inView ? "none" : "translateY(24px)", transition: "opacity 0.55s ease, transform 0.55s ease" }}>

      {/* Header */}
      <div className={`px-6 py-4 border-b ${divider} flex items-center justify-between`}>
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${accentGradient} flex items-center justify-center`}>
            <Star className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className={`text-sm font-bold ${headingText}`}>Daily Challenge</h2>
            <p className={`text-[11px] ${mutedText}`}>Solve to keep your streak alive!</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <DiffChip diff={problem.difficulty} />
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${darkMode ? "bg-amber-500/15 text-amber-400 border-amber-500/30" : "bg-amber-50 text-amber-600 border-amber-200"}`}>
            +{problem.points} pts
          </span>
          <div className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border ${darkMode ? "bg-gray-700/50 border-gray-600 text-gray-300" : "bg-gray-50 border-gray-200 text-gray-600"}`}>
            <Clock className="w-3 h-3" /> {timeLeft}
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${darkMode ? "bg-cyan-500/15 text-cyan-400" : "bg-cyan-50 text-cyan-600"}`}>{problem.topic}</span>
        </div>
        <h3 className={`text-lg font-bold mb-3 ${headingText}`}>{problem.title}</h3>
        <p className={`text-sm leading-relaxed mb-4 ${mutedText}`}>{problem.question}</p>

        {problem.example && (
          <div className={`rounded-xl p-4 mb-5 font-mono text-xs leading-relaxed border ${darkMode ? "bg-gray-900/60 border-gray-700/40 text-gray-300" : "bg-gray-50 border-gray-200 text-gray-700"}`}>
            <p className={`text-[10px] font-semibold uppercase tracking-wider mb-2 ${mutedText}`}>Example</p>
            <pre className="whitespace-pre-wrap">{problem.example}</pre>
          </div>
        )}

        <Link href={`/code-decode/${problem.name}`}>
          <button className={`w-full py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 bg-gradient-to-r ${accentGradient} text-white shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40 transition-all hover:scale-[1.02] active:scale-[0.98]`}>
            <Zap className="w-4 h-4" /> Solve Now
            <ChevronRight className="w-4 h-4" />
          </button>
        </Link>
      </div>
    </div>
  );
}

// ─── CS Fundamentals Card ─────────────────────────────────────────────────────
function CsFundamentalsCard({ problem, darkMode, cardBg, mutedText, headingText, divider, accentGradient }: any) {
  const { ref, inView } = useInView();
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const correct = "A";
  const options = [
    { id: "A", text: "To reduce data redundancy and dependency" },
    { id: "B", text: "To increase data duplication for faster access" },
    { id: "C", text: "To complicate the database structure" },
    { id: "D", text: "To eliminate all primary keys from tables" },
  ];

  return (
    <div ref={ref} className={`rounded-2xl border overflow-hidden transition-all duration-300 hover:shadow-xl ${cardBg} ${darkMode ? "hover:border-fuchsia-500/40 hover:shadow-fuchsia-500/5" : "hover:border-fuchsia-300 hover:shadow-fuchsia-100"}`}
      style={{ opacity: inView ? 1 : 0, transform: inView ? "none" : "translateY(24px)", transition: "opacity 0.55s ease 0.07s, transform 0.55s ease 0.07s" }}>

      <div className={`px-6 py-4 border-b ${divider} flex items-center justify-between`}>
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl bg-gradient-to-br from-fuchsia-500 to-cyan-400 flex items-center justify-center`}>
            <Target className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className={`text-sm font-bold ${headingText}`}>CS Fundamentals Quiz</h2>
            <p className={`text-[11px] ${mutedText}`}>Test your theoretical knowledge</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <DiffChip diff={problem.difficulty} />
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${darkMode ? "bg-amber-500/15 text-amber-400 border-amber-500/30" : "bg-amber-50 text-amber-600 border-amber-200"}`}>
            +{problem.points} pts
          </span>
        </div>
      </div>

      <div className="p-6">
        <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full mb-3 inline-block ${darkMode ? "bg-violet-500/15 text-violet-400" : "bg-violet-50 text-violet-600"}`}>{problem.topic}</span>
        <h3 className={`text-base font-bold mb-2 ${headingText}`}>{problem.title}</h3>
        <p className={`text-sm leading-relaxed mb-5 ${mutedText}`}>{problem.question}</p>

        <div className="space-y-2.5 mb-5">
          {options.map(o => {
            const isSelected = selected === o.id;
            const isCorrect  = o.id === correct;
            const showResult = revealed;
            let cls = `w-full flex items-start gap-3 px-4 py-3 rounded-xl border text-sm text-left transition-all cursor-pointer `;
            if (showResult && isCorrect) cls += `bg-green-500/10 border-green-500/50 text-green-400`;
            else if (showResult && isSelected && !isCorrect) cls += `bg-red-500/10 border-red-500/50 text-red-400`;
            else if (isSelected) cls += darkMode ? `bg-violet-500/15 border-violet-500/50 text-violet-300` : `bg-violet-50 border-violet-300 text-violet-700`;
            else cls += darkMode ? `bg-gray-700/30 border-gray-700/50 hover:border-gray-500 text-gray-300` : `bg-gray-50 border-gray-200 hover:border-gray-300 text-gray-700`;

            return (
              <button key={o.id} className={cls} onClick={() => { if (!revealed) setSelected(o.id); }}>
                <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                  showResult && isCorrect ? "bg-green-500/20 text-green-400" :
                  showResult && isSelected && !isCorrect ? "bg-red-500/20 text-red-400" :
                  isSelected ? "bg-violet-500/20 text-violet-400" :
                  darkMode ? "bg-gray-700 text-gray-400" : "bg-gray-100 text-gray-500"
                }`}>{o.id}</span>
                {o.text}
              </button>
            );
          })}
        </div>

        <button
          disabled={!selected}
          onClick={() => setRevealed(true)}
          className={`w-full py-3 rounded-xl text-sm font-semibold transition-all ${
            !selected
              ? `${darkMode ? "bg-gray-700/40 text-gray-500" : "bg-gray-100 text-gray-400"} cursor-not-allowed`
              : revealed
                ? `bg-green-500/15 text-green-400 border border-green-500/30`
                : `bg-gradient-to-r from-fuchsia-500 to-violet-500 text-white shadow-lg shadow-fuchsia-500/20 hover:shadow-fuchsia-500/40 hover:scale-[1.02] active:scale-[0.98]`
          }`}>
          {revealed ? "✓ Answer revealed" : selected ? "Submit Answer" : "Select an option first"}
        </button>

        {revealed && (
          <div className={`mt-4 p-4 rounded-xl border text-sm ${darkMode ? "bg-green-500/10 border-green-500/20 text-green-300" : "bg-green-50 border-green-200 text-green-700"}`}>
            <p className="font-semibold mb-1">✓ Correct! Database normalization reduces redundancy.</p>
            <p className={`text-xs ${darkMode ? "text-green-400/70" : "text-green-600/80"}`}>
              Normalization follows normal forms (1NF, 2NF, 3NF) to eliminate anomalies and improve integrity.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Monthly Progress Card ────────────────────────────────────────────────────
function MonthlyProgressCard({ progress, solvedProblems, darkMode, cardBg, mutedText, headingText, divider, accentGradient }: any) {
  const { ref, inView } = useInView();
  const progressItems = [
    { label: "Total",  value: progress.totalSolved,  max: 30, color: "from-violet-500 to-fuchsia-500",  bg: darkMode ? "bg-violet-500/10 text-violet-400" : "bg-violet-50 text-violet-600"  },
    { label: "Easy",   value: progress.easySolved,   max: 20, color: "from-green-500 to-emerald-400",   bg: darkMode ? "bg-green-500/10 text-green-400"  : "bg-green-50 text-green-600"    },
    { label: "Medium", value: progress.mediumSolved,  max: 10, color: "from-amber-500 to-yellow-400",   bg: darkMode ? "bg-amber-500/10 text-amber-400"  : "bg-amber-50 text-amber-600"    },
    { label: "Hard",   value: progress.hardSolved,   max: 5,  color: "from-red-500 to-rose-400",        bg: darkMode ? "bg-red-500/10 text-red-400"      : "bg-red-50 text-red-600"        },
  ];

  return (
    <div ref={ref} className={`rounded-2xl border overflow-hidden ${cardBg}`}
      style={{ opacity: inView ? 1 : 0, transform: inView ? "none" : "translateY(24px)", transition: "opacity 0.55s ease 0.14s, transform 0.55s ease 0.14s" }}>

      <div className={`px-6 py-4 border-b ${divider} flex items-center justify-between`}>
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${accentGradient} flex items-center justify-center`}>
            <BarChart3 className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className={`text-sm font-bold ${headingText}`}>Monthly Progress</h2>
            <p className={`text-[11px] ${mutedText}`}>April 2025</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-1.5 text-sm font-bold ${darkMode ? "text-orange-400" : "text-orange-500"}`}>
            <Flame className="w-4 h-4" /> {progress.currentStreak} day streak
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Progress bars */}
        <div className="grid grid-cols-2 gap-4">
          {progressItems.map(p => (
            <div key={p.label} className={`p-4 rounded-xl ${p.bg.split(" ")[0]}/10 border ${darkMode ? "border-gray-700/40" : "border-gray-100"}`}>
              <div className={`text-2xl font-extrabold tracking-tight mb-0.5 ${p.bg.split(" ").slice(1).join(" ")}`}>{p.value}</div>
              <div className={`text-xs mb-2 ${mutedText}`}>{p.label}</div>
              <div className={`h-1.5 rounded-full ${darkMode ? "bg-gray-700" : "bg-gray-100"} overflow-hidden`}>
                <div className={`h-full rounded-full bg-gradient-to-r ${p.color} transition-all duration-1000`}
                  style={{ width: inView ? `${Math.min((p.value / p.max) * 100, 100)}%` : "0%" }} />
              </div>
            </div>
          ))}
        </div>

        {/* Solved problems list */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className={`text-sm font-bold ${headingText}`}>Recently solved</h3>
            <Link href="/code-decode/history">
              <span className={`text-xs font-medium ${darkMode ? "text-violet-400 hover:text-violet-300" : "text-violet-600 hover:text-violet-700"} transition-colors cursor-pointer`}>View all →</span>
            </Link>
          </div>
          <div className="space-y-2">
            {solvedProblems.map((p: SolvedProblem, i: number) => (
              <div key={p.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-all hover:scale-[1.01] ${darkMode ? "bg-gray-700/30 border-gray-700/40 hover:border-gray-600" : "bg-gray-50 border-gray-100 hover:border-gray-200"}`}>
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${darkMode ? "bg-green-500/15 text-green-400" : "bg-green-50 text-green-600"}`}>
                  <CheckCircle className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-semibold truncate ${headingText}`}>{p.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <DiffChip diff={p.difficulty} />
                    <span className={`text-[10px] flex items-center gap-1 ${mutedText}`}><Calendar className="w-2.5 h-2.5" />{p.date}</span>
                  </div>
                </div>
                <span className={`text-xs font-bold shrink-0 ${darkMode ? "text-amber-400" : "text-amber-600"}`}>+{p.points}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Quick Stats Card ─────────────────────────────────────────────────────────
function QuickStatsCard({ stats, darkMode, cardBg, mutedText, headingText, divider, accentText }: any) {
  const { ref, inView } = useInView();
  const accentMap: Record<string, string> = {
    violet: "from-violet-400 to-fuchsia-400", cyan:  "from-cyan-400 to-blue-400",
    amber:  "from-amber-400 to-yellow-400",    green: "from-green-400 to-emerald-400",
  };

  return (
    <div ref={ref} className={`rounded-2xl border overflow-hidden ${cardBg}`}
      style={{ opacity: inView ? 1 : 0, transform: inView ? "none" : "translateY(24px)", transition: "opacity 0.55s ease, transform 0.55s ease" }}>
      <div className={`px-5 py-4 border-b ${divider} flex items-center gap-3`}>
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-400 flex items-center justify-center">
          <Zap className="w-4 h-4 text-white" />
        </div>
        <h2 className={`text-sm font-bold ${headingText}`}>Quick Stats</h2>
      </div>
      <div className="p-5 space-y-3">
        {stats.map((s: any, i: number) => (
          <div key={s.label} className={`flex items-center justify-between p-3 rounded-xl border transition-all hover:scale-[1.01] ${darkMode ? "bg-gray-700/30 border-gray-700/40" : "bg-gray-50 border-gray-100"}`}>
            <span className={`text-xs ${mutedText}`}>{s.label}</span>
            <span className={`text-sm font-extrabold bg-gradient-to-r ${accentMap[s.accent]} bg-clip-text text-transparent`}>{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Leaderboard Card ─────────────────────────────────────────────────────────
function LeaderboardCard({ leaderboard, darkMode, cardBg, mutedText, headingText, divider, accentGradient }: any) {
  const { ref, inView } = useInView();

  return (
    <div ref={ref} className={`rounded-2xl border overflow-hidden ${cardBg}`}
      style={{ opacity: inView ? 1 : 0, transform: inView ? "none" : "translateY(24px)", transition: "opacity 0.55s ease 0.07s, transform 0.55s ease 0.07s" }}>

      <div className={`px-5 py-4 border-b ${divider} flex items-center justify-between`}>
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${accentGradient} flex items-center justify-center`}>
            <Trophy className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className={`text-sm font-bold ${headingText}`}>Leaderboard</h2>
            <p className={`text-[11px] ${mutedText}`}>All-time top performers</p>
          </div>
        </div>
        <Link href="/code-decode/leaderboard">
          <span className={`text-xs font-medium ${darkMode ? "text-violet-400 hover:text-violet-300" : "text-violet-600 hover:text-violet-700"} transition-colors cursor-pointer`}>Full →</span>
        </Link>
      </div>

      <div className="p-4 space-y-2">
        {leaderboard.map((user: LeaderboardUser, i: number) => (
          <div key={user.rank}
            className={`group flex items-center gap-3 p-3 rounded-xl border transition-all hover:scale-[1.01] ${
              user.isMe
                ? darkMode ? "bg-violet-500/10 border-violet-500/40" : "bg-violet-50 border-violet-200"
                : darkMode ? "bg-gray-700/30 border-gray-700/40 hover:border-gray-600" : "bg-gray-50/80 border-gray-100 hover:border-gray-200"
            }`}
            style={{ opacity: inView ? 1 : 0, transform: inView ? "none" : "translateX(20px)", transition: `opacity 0.5s ease ${i * 0.07}s, transform 0.5s ease ${i * 0.07}s` }}>

            {/* Rank badge */}
            <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-bold shrink-0 ${rankConfig[user.rank] ?? (darkMode ? "bg-gray-700 text-gray-400" : "bg-gray-100 text-gray-500")}`}>
              {user.rank}
            </div>

            {/* Avatar */}
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${avatarGradients[i % avatarGradients.length]} flex items-center justify-center text-[11px] font-bold text-white shrink-0`}>
              {user.avatar}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className={`text-xs font-semibold truncate ${user.isMe ? darkMode ? "text-violet-300" : "text-violet-700" : headingText}`}>
                  {user.name}{user.isMe && <span className={`ml-1.5 text-[10px] font-medium ${darkMode ? "text-violet-400" : "text-violet-500"}`}>(you)</span>}
                </p>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`text-[10px] ${mutedText}`}>{user.problemsSolved} solved</span>
                {user.streak && <span className={`text-[10px] flex items-center gap-0.5 ${darkMode ? "text-orange-400/70" : "text-orange-500/70"}`}><Flame className="w-2.5 h-2.5" />{user.streak}</span>}
              </div>
            </div>

            {/* Points */}
            <div className="text-right shrink-0">
              <div className={`text-sm font-extrabold ${darkMode ? "text-amber-400" : "text-amber-600"}`}>{user.points}</div>
              <div className={`text-[10px] ${mutedText}`}>pts</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}