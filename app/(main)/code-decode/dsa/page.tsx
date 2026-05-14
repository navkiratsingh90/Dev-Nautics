"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useAppSelector } from "@/redux/hooks";
import {
  ArrowLeft, Play, CheckCircle, Terminal, Sparkles, Layers,
  Clock, Zap, Code2, RotateCcw, Trash2, ChevronDown
} from "lucide-react";
import CodeEditor from "@/components/code-editor"; // adjust path as needed

// ─── Types ───────────────────────────────────────────────────────────────────
interface TestCase {
  input: any[];
  output: any;
}

interface DailyChallenge {
  id: number;
  name: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  points: number;
  question: string;
  example: string;
  starterCode: string;
  testCases: TestCase[];
}

// ─── Helper Functions ───────────────────────────────────────────────────────
const getDifficultyColor = (difficulty: string, darkMode: boolean) => {
  switch (difficulty.toLowerCase()) {
    case "easy":
      return darkMode
        ? "bg-green-900/50 text-green-300 border border-green-700"
        : "bg-green-100 text-green-700 border border-green-200";
    case "medium":
      return darkMode
        ? "bg-yellow-900/50 text-yellow-300 border border-yellow-700"
        : "bg-yellow-100 text-yellow-700 border border-yellow-200";
    case "hard":
      return darkMode
        ? "bg-red-900/50 text-red-300 border border-red-700"
        : "bg-red-100 text-red-700 border border-red-200";
    default:
      return darkMode
        ? "bg-gray-800 text-gray-300 border border-gray-700"
        : "bg-gray-100 text-gray-700 border border-gray-200";
  }
};

// ─── Main Component ─────────────────────────────────────────────────────────
export default function DailyCodingChallengePage() {
  const darkMode = useAppSelector((state: any) => state.Theme.darkMode);

  const [selectedChallenge, setSelectedChallenge] = useState<DailyChallenge | null>(null);
  const [userCode, setUserCode] = useState("");
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [language, setLanguage] = useState("javascript");
  const [mounted, setMounted] = useState(false);

  // Mock daily problem (same as original)
  const dailyProblem = useMemo<DailyChallenge>(
    () => ({
      id: 1,
      name: "two-sum",
      title: "Two Sum – Daily Challenge",
      difficulty: "Easy",
      points: 15,
      question:
        "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.",
      example:
        "Input: nums = [2,7,11,15], target = 9\nOutput: [0,1]\nExplanation: Because nums[0] + nums[1] == 9, we return [0,1].",
      starterCode: `function twoSum(nums, target) {
  // Your code here
  // Return indices of two numbers that add up to target
}`,
      testCases: [
        { input: [[2, 7, 11, 15], 9], output: [0, 1] },
        { input: [[3, 2, 4], 6], output: [1, 2] },
        { input: [[3, 3], 6], output: [0, 1] },
      ],
    }),
    []
  );

  useEffect(() => {
    setMounted(true);
    setSelectedChallenge(dailyProblem);
    setUserCode(dailyProblem.starterCode);
    setOutput("");
    setLanguage("javascript");
  }, [dailyProblem]);

  const handleRunCode = useCallback(() => {
    if (!selectedChallenge) return;
    setIsRunning(true);
    setOutput("Running your code...\n\n");

    // Simulate execution (replace with real interpreter later)
    setTimeout(() => {
      const results = selectedChallenge.testCases
        .map(
          (testCase, index) => `Test Case ${index + 1}: ✓ Passed
  Input: ${JSON.stringify(testCase.input)}
  Expected: ${JSON.stringify(testCase.output)}
  Received: ${JSON.stringify(testCase.output)}`
        )
        .join("\n\n");

      setOutput(
        `✓ All test cases passed!\n\n${results}\n\nExecution time: 2ms\nMemory used: 36.8MB`
      );
      setIsRunning(false);
    }, 2000);
  }, [selectedChallenge]);

  const handleSubmitSolution = useCallback(() => {
    if (!selectedChallenge) return;
    setIsRunning(true);
    setOutput("Submitting your solution...\n\n");

    setTimeout(() => {
      setOutput(
        `🎉 Solution Accepted!\n\n+${selectedChallenge.points} points awarded\n\n✅ All test cases passed\n⏱️  Runtime: Beats 85% of submissions\n💾 Memory: Beats 92% of submissions\n\nGreat job! Your solution is optimal.`
      );
      setIsRunning(false);
    }, 1500);
  }, [selectedChallenge]);

  const handleResetCode = useCallback(() => {
    if (selectedChallenge) {
      setUserCode(selectedChallenge.starterCode);
      setOutput("");
    }
  }, [selectedChallenge]);

  const handleClearOutput = useCallback(() => {
    setOutput("");
  }, []);

  if (!selectedChallenge) return null;

  // Theme tokens (consistent with other pages)
  const bg = darkMode ? "bg-gray-900 text-white" : "bg-white text-gray-800";
  const cardBg = darkMode ? "bg-gray-800/80 border-gray-700" : "bg-white border-gray-200";
  const mutedText = darkMode ? "text-gray-400" : "text-gray-500";
  const headingText = darkMode ? "text-white" : "text-gray-900";
  const divider = darkMode ? "border-gray-700/60" : "border-gray-100";
  const accentGradient = "from-violet-500 via-fuchsia-500 to-cyan-400";

  return (
    <div className={`min-h-screen ${bg} transition-colors duration-300 font-sans`}>
      {/* Sticky Header */}
      <div
        className={`sticky top-0 z-40 border-b ${divider} ${
          darkMode ? "bg-gray-900/90" : "bg-white/90"
        } backdrop-blur-md`}
      >
        <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between gap-4">
          <Link href="/code-decode">
            <button
              className={`flex items-center gap-2 text-sm font-medium transition-all hover:scale-105 ${
                darkMode ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              <ArrowLeft className="w-4 h-4" /> Back to Challenges
            </button>
          </Link>
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border ${getDifficultyColor(
                selectedChallenge.difficulty,
                darkMode
              )}`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  selectedChallenge.difficulty === "Easy"
                    ? "bg-green-400"
                    : selectedChallenge.difficulty === "Medium"
                    ? "bg-yellow-400"
                    : "bg-red-400"
                } ${selectedChallenge.difficulty === "Easy" ? "animate-pulse" : ""}`}
              />
              {selectedChallenge.difficulty}
            </span>
            <span
              className={`text-xs font-medium px-3 py-1.5 rounded-full border ${
                darkMode
                  ? "bg-yellow-900/50 text-yellow-300 border-yellow-700"
                  : "bg-yellow-100 text-yellow-700 border-yellow-200"
              }`}
            >
              ⭐ {selectedChallenge.points} pts
            </span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden border-b border-gray-700/30">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `linear-gradient(${darkMode ? "#fff" : "#000"} 1px, transparent 1px), linear-gradient(90deg, ${darkMode ? "#fff" : "#000"} 1px, transparent 1px)`, backgroundSize: "50px 50px" }} />
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/3 w-64 h-64 bg-fuchsia-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 py-10">
          <div
            className="flex flex-col md:flex-row md:items-center md:justify-between gap-6"
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? "none" : "translateY(20px)",
              transition: "opacity 0.6s ease, transform 0.6s ease",
            }}
          >
            <div>
              <div
                className={`inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full border text-xs font-medium ${
                  darkMode
                    ? "bg-violet-500/10 border-violet-500/30 text-violet-300"
                    : "bg-violet-50 border-violet-200 text-violet-600"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                Daily coding challenge
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
                {selectedChallenge.title}
              </h1>
              <p className={`text-sm mt-2 ${mutedText}`}>
                Solve the problem, test your code, and earn points.
              </p>
            </div>

            {/* Quick info pills */}
            <div className="flex gap-3 shrink-0">
              <div
                className={`text-center px-4 py-3 rounded-xl border min-w-[80px] ${cardBg}`}
                style={{
                  opacity: mounted ? 1 : 0,
                  transform: mounted ? "none" : "translateY(16px)",
                  transition: `opacity 0.5s ease 0.1s, transform 0.5s ease 0.1s`,
                }}
              >
                <div
                  className={`text-2xl font-extrabold tracking-tight bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent`}
                >
                  {selectedChallenge.testCases.length}
                </div>
                <div className={`text-[11px] mt-0.5 ${mutedText}`}>Test cases</div>
              </div>
              <div
                className={`text-center px-4 py-3 rounded-xl border min-w-[80px] ${cardBg}`}
                style={{
                  opacity: mounted ? 1 : 0,
                  transform: mounted ? "none" : "translateY(16px)",
                  transition: `opacity 0.5s ease 0.2s, transform 0.5s ease 0.2s`,
                }}
              >
                <div
                  className={`text-2xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent`}
                >
                  2s
                </div>
                <div className={`text-[11px] mt-0.5 ${mutedText}`}>Time limit</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content: Problem + Editor */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Problem Description */}
          <div
            className={`group relative rounded-2xl border shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl ${cardBg}`}
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? "none" : "translateY(20px)",
              transition: "opacity 0.6s ease 0.1s, transform 0.6s ease 0.1s",
            }}
          >
            <div
              className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${accentGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
            />
            <div className="p-6 space-y-6">
              {/* Description */}
              <div>
                <h3
                  className={`text-lg font-bold mb-3 flex items-center gap-2 ${headingText}`}
                >
                  <Layers className="w-5 h-5 text-violet-400" />
                  Problem Description
                </h3>
                <p className={`text-sm leading-relaxed ${mutedText}`}>
                  {selectedChallenge.question}
                </p>
              </div>

              {/* Example */}
              <div>
                <h3
                  className={`text-lg font-bold mb-3 flex items-center gap-2 ${headingText}`}
                >
                  <Code2 className="w-5 h-5 text-cyan-400" />
                  Example
                </h3>
                <div
                  className={`p-4 rounded-xl font-mono text-sm ${
                    darkMode ? "bg-gray-800/50 border border-gray-700" : "bg-gray-50 border border-gray-200"
                  }`}
                >
                  <pre className="whitespace-pre-wrap">{selectedChallenge.example}</pre>
                </div>
              </div>

              {/* Constraints */}
              <div>
                <h3
                  className={`text-lg font-bold mb-3 flex items-center gap-2 ${headingText}`}
                >
                  <Zap className="w-5 h-5 text-amber-400" />
                  Constraints
                </h3>
                <ul
                  className={`list-disc list-inside space-y-1 text-sm ${mutedText}`}
                >
                  <li>2 ≤ nums.length ≤ 10⁴</li>
                  <li>-10⁹ ≤ nums[i] ≤ 10⁹</li>
                  <li>-10⁹ ≤ target ≤ 10⁹</li>
                  <li>Only one valid answer exists</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Right: Code Editor + Output */}
          <div
            className={`group relative rounded-2xl border shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl flex flex-col ${cardBg}`}
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? "none" : "translateY(20px)",
              transition: "opacity 0.6s ease 0.2s, transform 0.6s ease 0.2s",
            }}
          >
            <div
              className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${accentGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
            />

            {/* Editor Header */}
            <div
              className={`p-4 flex justify-between items-center border-b ${divider}`}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className={`px-3 py-1.5 pr-8 rounded-xl border text-sm outline-none transition-all focus:ring-2 focus:ring-violet-500/30 ${
                      darkMode
                        ? "bg-gray-800 border-gray-700 text-white"
                        : "bg-white border-gray-200 text-gray-900"
                    }`}
                  >
                    <option value="javascript">JavaScript</option>
                    <option value="python">Python</option>
                    <option value="java">Java</option>
                    <option value="cpp">C++</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>

                <button
                  onClick={handleResetCode}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all hover:scale-105 ${
                    darkMode
                      ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                  }`}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset
                </button>
              </div>

              <span className={`text-xs ${mutedText}`}>
                Auto‑save enabled
              </span>
            </div>

            {/* Code Editor */}
            <div className="flex-1 min-h-[400px] border-b border-gray-700/30">
              <CodeEditor
                code={userCode}
                onChange={(value) => setUserCode(value || "")} 
                darkMode={darkMode}
                language={language}
              />
            </div>

            {/* Output Section */}
            <div className="flex flex-col">
              <div
                className={`flex justify-between items-center px-4 py-2 border-b ${divider}`}
              >
                <span className={`text-sm font-medium flex items-center gap-1.5 ${headingText}`}>
                  <Terminal className="w-4 h-4" /> Output
                </span>
                <button
                  onClick={handleClearOutput}
                  className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-all hover:scale-105 ${
                    darkMode
                      ? "hover:bg-gray-700 text-gray-400"
                      : "hover:bg-gray-100 text-gray-500"
                  }`}
                >
                  <Trash2 className="w-3 h-3" />
                  Clear
                </button>
              </div>

              <div
                className={`h-40 overflow-auto font-mono text-sm px-4 py-3 ${
                  darkMode ? "bg-gray-950 text-green-400" : "bg-gray-100 text-green-700"
                }`}
              >
                {isRunning ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                    <span>{output}</span>
                  </div>
                ) : (
                  output || 'Click "Run Code" to test your solution...'
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div
              className={`p-4 flex gap-3 border-t ${divider} ${
                darkMode ? "bg-gray-800/30" : "bg-gray-50"
              }`}
            >
              <button
                onClick={handleRunCode}
                disabled={isRunning}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] ${
                  isRunning
                    ? "bg-gray-400 cursor-not-allowed"
                    : `bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40`
                }`}
              >
                <Play className="w-4 h-4" /> Run Code
              </button>

              <button
                onClick={handleSubmitSolution}
                disabled={isRunning}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] ${
                  isRunning
                    ? "bg-gray-400 cursor-not-allowed"
                    : `bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/20 hover:shadow-green-500/40`
                }`}
              >
                <CheckCircle className="w-4 h-4" /> Submit Solution
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}