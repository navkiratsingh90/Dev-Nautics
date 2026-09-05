"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import {
  LayoutDashboard, Users, FolderOpen, MessageSquare,
  FileText, Settings, HelpCircle, LogOut,
  ChevronRight, Plus, Search, Edit, Trash2,
  BookOpen, Code, Briefcase, Globe, Mail, Award,
} from "lucide-react";
import QuestionsPanel from "@/components/Admin-Question-Panel";
import UsersPanel from "@/components/Admin-User-Panel";
import WorkspacesPanel from "@/components/Admin-Workspace-Panel";
import CollaborationsPanel from "@/components/Admin-Collaboration-Panel";
import CommunitiesPanel from "@/components/Admin-Communities-Panel";
import SubmissionsPanel from "@/components/Admin-Submission-Panel";

// ─── Chart.js imports ────────────────────────────────────────────────────
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// ─── Type definitions ────────────────────────────────────────────────────
interface DashboardStats {
  totalUsers: number;
  totalQuestions: number;
  totalWorkspaces: number;
  totalCollaborations: number;
  totalCommunities: number;
  totalSubmissions: number;
  recentSubmissions: any[];
  recentUsers: any[];
}

// ─── Sidebar navigation items ───────────────────────────────────────────
const navItems = [
  { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
  { id: "questions", label: "Questions", icon: <BookOpen className="w-4 h-4" /> },
  { id: "users", label: "Users", icon: <Users className="w-4 h-4" /> },
  { id: "workspaces", label: "Workspaces", icon: <FolderOpen className="w-4 h-4" /> },
  { id: "collaborations", label: "Collaborations", icon: <Briefcase className="w-4 h-4" /> },
  { id: "communities", label: "Communities", icon: <Globe className="w-4 h-4" /> },
  { id: "submissions", label: "Submissions", icon: <FileText className="w-4 h-4" /> },
];

// ─── Admin Dashboard Page ──────────────────────────────────────────────
export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalQuestions: 0,
    totalWorkspaces: 0,
    totalCollaborations: 0,
    totalCommunities: 0,
    totalSubmissions: 0,
    recentSubmissions: [],
    recentUsers: [],
  });
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // ── Fetch dashboard stats ─────────────────────────────────────────────
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await axios.get("/api/admin/stats");
        if (data.success) {
          setStats(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  // ── Render content based on active tab ──────────────────────────────
  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardContent stats={stats} loading={loading} />;
      case "questions":
        return <QuestionsPanel />;
      case "users":
        return <UsersPanel />;
      case "workspaces":
        return <WorkspacesPanel />;
      case "collaborations":
        return <CollaborationsPanel />;
      case "communities":
        return <CommunitiesPanel />;
      case "submissions":
        return <SubmissionsPanel />;
      default:
        return <DashboardContent stats={stats} loading={loading} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFB] font-['Inter',-apple-system,sans-serif] flex">
      {/* Sidebar (unchanged) */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-0"
        } lg:w-64 bg-white border-r border-[#E8EDF2] h-screen sticky top-0 flex flex-col transition-all duration-200 overflow-hidden`}
      >
        <div className="flex items-center gap-2 px-6 py-5 border-b border-[#E8EDF2]">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0EA472] to-[#059669] flex items-center justify-center text-white font-bold text-sm">
            A
          </div>
          <span className="text-base font-bold text-[#0D1B2A] tracking-[-0.3px]">
            Admin<span className="text-[#0EA472]">Panel</span>
          </span>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                activeTab === item.id
                  ? "bg-[#EDF7F3] text-[#0EA472]"
                  : "text-[#64748B] hover:bg-[#F8FAFB] hover:text-[#0D1B2A]"
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
              {activeTab === item.id && <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-50" />}
            </button>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-[#E8EDF2]">
          <button className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-[#64748B] hover:bg-[#F8FAFB] hover:text-red-500 transition">
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-h-screen overflow-y-auto">
        <div className="sticky top-0 z-10 bg-white border-b border-[#E8EDF2] px-6 py-3 flex items-center gap-4 lg:hidden">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1 text-[#64748B] hover:text-[#0D1B2A]">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-lg font-bold text-[#0D1B2A]">Admin Panel</h1>
        </div>

        <div className="p-6">{renderContent()}</div>
      </main>
    </div>
  );
}

// ─── Dashboard Content ──────────────────────────────────────────────────
function DashboardContent({ stats, loading }: { stats: DashboardStats; loading: boolean }) {
  const [dailyData, setDailyData] = useState<{ date: string; count: number }[]>([]);
  const [chartLoading, setChartLoading] = useState(true);

  // ── Fetch real daily submissions ────────────────────────────────────
  useEffect(() => {
    const fetchDailySubmissions = async () => {
      try {
        const { data } = await axios.get("/api/admin/stats/submission-daily");
        
        if (data.success) {
          setDailyData(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch daily submissions:", error);
      } finally {
        setChartLoading(false);
      }
    };
    fetchDailySubmissions();
  }, []);

  // ── Line chart data (real) ──────────────────────────────────────────
  const lineChartData = {
    labels: dailyData.map((d) => d.date),
    datasets: [
      {
        label: "Submissions",
        data: dailyData.map((d) => d.count),
        borderColor: "#0EA472",
        backgroundColor: "rgba(14, 164, 114, 0.1)",
        fill: true,
        tension: 0.3,
        pointBackgroundColor: "#0EA472",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
      },
    ],
  };

  // ── Bar chart data (from stats) ─────────────────────────────────────
  const barChartData = {
    labels: ["Users", "Questions", "Workspaces", "Collaborations", "Communities", "Submissions"],
    datasets: [
      {
        label: "Total Count",
        data: [
          stats.totalUsers,
          stats.totalQuestions,
          stats.totalWorkspaces,
          stats.totalCollaborations,
          stats.totalCommunities,
          stats.totalSubmissions,
        ],
        backgroundColor: [
          "rgba(59, 130, 246, 0.7)",
          "rgba(139, 92, 246, 0.7)",
          "rgba(245, 158, 11, 0.7)",
          "rgba(6, 182, 212, 0.7)",
          "rgba(16, 185, 129, 0.7)",
          "rgba(236, 72, 153, 0.7)",
        ],
        borderColor: [
          "#3B82F6",
          "#8B5CF6",
          "#F59E0B",
          "#06B6D4",
          "#10B981",
          "#EC4899",
        ],
        borderWidth: 2,
        borderRadius: 4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        labels: {
          color: "#0D1B2A",
          font: { family: "Inter", size: 12 },
        },
      },
    },
    scales: {
      x: {
        grid: { color: "rgba(0,0,0,0.05)" },
        ticks: { color: "#64748B", font: { family: "Inter", size: 11 } },
      },
      y: {
        grid: { color: "rgba(0,0,0,0.05)" },
        ticks: { color: "#64748B", font: { family: "Inter", size: 11 } },
        beginAtZero: true,
      },
    },
  };

  const statCards = [
    { label: "Users", value: stats.totalUsers, icon: <Users className="w-5 h-5" />, color: "bg-blue-50 text-blue-600" },
    { label: "Questions", value: stats.totalQuestions, icon: <BookOpen className="w-5 h-5" />, color: "bg-violet-50 text-violet-600" },
    { label: "Workspaces", value: stats.totalWorkspaces, icon: <FolderOpen className="w-5 h-5" />, color: "bg-amber-50 text-amber-600" },
    { label: "Collaborations", value: stats.totalCollaborations, icon: <Briefcase className="w-5 h-5" />, color: "bg-cyan-50 text-cyan-600" },
    { label: "Communities", value: stats.totalCommunities, icon: <Globe className="w-5 h-5" />, color: "bg-green-50 text-green-600" },
    { label: "Submissions", value: stats.totalSubmissions, icon: <FileText className="w-5 h-5" />, color: "bg-fuchsia-50 text-fuchsia-600" },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-[#0D1B2A] mb-2">Dashboard</h2>
      <p className="text-sm text-[#64748B] mb-6">Overview of your platform activity.</p>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white border border-[#E8EDF2] rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className={`w-10 h-10 rounded-xl ${card.color} flex items-center justify-center`}>
                {card.icon}
              </div>
              {loading ? (
                <div className="w-12 h-6 bg-gray-200 animate-pulse rounded" />
              ) : (
                <span className="text-2xl font-bold text-[#0D1B2A]">{card.value.toLocaleString()}</span>
              )}
            </div>
            <div className="text-sm text-[#64748B] mt-1">{card.label}</div>
          </div>
        ))}
      </div>

      {/* ── Charts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Line Chart: Submissions per day (REAL DATA) */}
        <div className="bg-white border border-[#E8EDF2] rounded-2xl p-5 shadow-sm">
          <h3 className="font-semibold text-[#0D1B2A] mb-4">Submissions (Last 7 Days)</h3>
          <div className="h-64">
            {chartLoading ? (
              <div className="h-full flex items-center justify-center text-[#64748B]">Loading chart...</div>
            ) : (
              <Line data={lineChartData} options={chartOptions} />
            )}
          </div>
        </div>

        {/* Bar Chart: Platform Activity */}
        <div className="bg-white border border-[#E8EDF2] rounded-2xl p-5 shadow-sm">
          <h3 className="font-semibold text-[#0D1B2A] mb-4">Platform Activity</h3>
          <div className="h-64">
            {loading ? (
              <div className="h-full flex items-center justify-center text-[#64748B]">Loading chart...</div>
            ) : (
              <Bar data={barChartData} options={chartOptions} />
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity (unchanged) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Submissions */}
        <div className="bg-white border border-[#E8EDF2] rounded-2xl p-5 shadow-sm">
          <h3 className="font-semibold text-[#0D1B2A] mb-4">Recent Submissions</h3>
          {stats.recentSubmissions.length === 0 ? (
            <p className="text-sm text-[#64748B]">No recent submissions.</p>
          ) : (
            <div className="space-y-3">
              {stats.recentSubmissions.slice(0, 5).map((sub) => (
                <div key={sub._id} className="flex items-center justify-between border-b border-[#E8EDF2] pb-2 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-[#0D1B2A]">{sub.user?.username || "Unknown"}</p>
                    <p className="text-xs text-[#64748B]">{sub.question?.title || "Question"}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs font-medium ${sub.isCorrect ? "text-green-600" : "text-red-600"}`}>
                      {sub.isCorrect ? "✅ Correct" : "❌ Incorrect"}
                    </span>
                    <p className="text-xs text-[#64748B]">+{sub.pointsEarned} pts</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Users */}
        <div className="bg-white border border-[#E8EDF2] rounded-2xl p-5 shadow-sm">
          <h3 className="font-semibold text-[#0D1B2A] mb-4">Recent Users</h3>
          {stats.recentUsers.length === 0 ? (
            <p className="text-sm text-[#64748B]">No recent users.</p>
          ) : (
            <div className="space-y-3">
              {stats.recentUsers.slice(0, 5).map((user) => (
                <div key={user._id} className="flex items-center justify-between border-b border-[#E8EDF2] pb-2 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-[#0D1B2A]">{user.username}</p>
                    <p className="text-xs text-[#64748B]">{user.email}</p>
                  </div>
                  <span className="text-xs text-[#64748B]">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}