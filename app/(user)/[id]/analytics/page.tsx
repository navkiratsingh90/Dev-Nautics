"use client";

import React, { useState, useEffect } from "react";
import { useAppSelector } from "@/redux/hooks";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area,
} from "recharts";
import {
  Activity, Award, Briefcase, Clock, Code, GitBranch,
  Heart, MessageCircle, Share2, Star, Target, TrendingUp,
  Users, Zap, GitCommit, Eye, ArrowUp, Flame,
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

// ─── Types ──────────────────────────────────────────────────────
interface Stats {
  totalActivities: number;
  totalChallenges: number;
  totalPoints: number;
  activeWorkspaces: number;
  totalConnections: number;
  activityTimeline: { day: string; activities: number; prev: number }[];
  challengeByType: { type: string; count: number }[];
  workspaceTasks: { name: string; value: number; color: string }[];
  engagementData: { name: string; value: number; change: number; icon: React.ElementType }[];
  skillsProgress: { skill: string; value: number; color: string }[];
  recentAchievements: { id: string; title: string; date: string; icon: React.ElementType; color: string }[];
  projectContributions: { project: string; commits: number; lines: number; pct: number }[];
  topCollaborators: { name: string; username: string; contributions: number; avatar: string; gradient: string }[];
  weeklyProgress: number;
  monthlyPoints: { month: string; points: number }[];
}

// ─── Helper for chart tooltip ─────────────────────────────────
const tooltipStyle = {
  backgroundColor: "#fff",
  border: "1px solid #e5e7eb",
  borderRadius: "8px",
  padding: "8px 12px",
  fontSize: "12px",
};

// ─── Main Component ────────────────────────────────────────────
export default function AnalyticsPage() {
  // ─── Get user from Redux ──────────────────────────────────────
  const user = useAppSelector((state: any) => state.User.userData);
  const userId = user?._id || "";

  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ─── Fetch analytics when userId is available ────────────────
  useEffect(() => {
    // If no user ID, show a message but don't fetch
    if (!userId) {
      setLoading(false);
      setError("Please log in to view analytics");
      return;
    }

    const fetchAnalytics = async () => {
      try {
        const { data } = await axios.get(`/api/user/${userId}/analytics`);
        console.log("✅ Analytics API response:", data);

        if (!data.success) {
          setError(data.message || "Failed to load analytics");
          setStats(getPlaceholderStats());
          return;
        }

        const api = data.analytics || data.data || {};

        // ─── Helper: last 7 days ──────────────────────────────────
        const getLast7Days = () => {
          const dates = [];
          for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            dates.push(d.toISOString().split("T")[0]);
          }
          return dates;
        };

        // ─── Activity map ──────────────────────────────────────────
        const activityMap: Record<string, number> = {};
        (api.activities?.timeline || []).forEach((item: any) => {
          activityMap[item._id] = item.count;
        });

        // ─── Activity timeline ──────────────────────────────────────
        const activityTimeline = getLast7Days().map((date) => ({
          day: new Date(date).toLocaleDateString("en-US", { weekday: "short" }),
          activities: activityMap[date] || 0,
          prev: 0,
        }));

        // ─── Monthly points ──────────────────────────────────────
        const monthMap: Record<string, number> = {};
        (api.challenges?.timeline || []).forEach((item: any) => {
          const month = item._id.slice(0, 7);
          monthMap[month] = (monthMap[month] || 0) + (item.totalScore || 0);
        });
        const monthlyPoints = Object.keys(monthMap)
          .sort()
          .map((month) => {
            const [year, mon] = month.split("-");
            const date = new Date(parseInt(year), parseInt(mon) - 1);
            return { month: date.toLocaleDateString("en-US", { month: "short" }), points: monthMap[month] };
          });

        // ─── Workspace tasks ──────────────────────────────────────
        const tasksAssigned = api.projects?.tasksAssigned || 0;
        const tasksCompleted = api.projects?.tasksCompleted || 0;

        // ─── Final stats ──────────────────────────────────────
        setStats({
          totalActivities: api.activities?.total || 0,
          totalChallenges: api.challenges?.totalParticipated || 0,
          totalPoints: data.userInfo?.totalPoints || 0,
          activeWorkspaces: api.projects?.total || 0,
          totalConnections: data.userInfo?.connections || 0,
          activityTimeline,
          challengeByType: [
            { type: "Participated", count: api.challenges?.totalParticipated || 0 },
            { type: "Solved", count: api.challenges?.solved || 0 },
          ],
          workspaceTasks: [
            { name: "Completed", value: tasksCompleted, color: "#34d399" },
            { name: "In Progress", value: 0, color: "#a78bfa" },
            { name: "Pending", value: Math.max(0, tasksAssigned - tasksCompleted), color: "#f87171" },
          ],
          engagementData: [
            { name: "Likes", value: api.activities?.likes || 0, change: 0, icon: Heart },
            { name: "Comments", value: api.activities?.comments || 0, change: 0, icon: MessageCircle },
            { name: "Shares", value: 0, change: 0, icon: Share2 },
            { name: "Views", value: 0, change: 0, icon: Eye },
          ],
          skillsProgress: [
            { skill: "React", value: 0, color: "#818cf8" },
            { skill: "JavaScript", value: 0, color: "#38bdf8" },
            { skill: "Node.js", value: 0, color: "#34d399" },
            { skill: "Python", value: 0, color: "#fbbf24" },
            { skill: "CSS", value: 0, color: "#e879f9" },
            { skill: "MongoDB", value: 0, color: "#f87171" },
          ],
          recentAchievements: [],
          projectContributions: [],
          topCollaborators: [],
          weeklyProgress: 0,
          monthlyPoints,
        });

        setError(null);
        toast.success("Analytics loaded");
      } catch (err: any) {
        console.error("❌ Analytics error:", err);
        setError(err.response?.data?.message || "Failed to fetch analytics");
        toast.error("Could not load analytics data");
        setStats(getPlaceholderStats());
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [userId]);

  // ─── Placeholder stats ──────────────────────────────────────────
  const getPlaceholderStats = (): Stats => ({
    totalActivities: 42,
    totalChallenges: 18,
    totalPoints: 1250,
    activeWorkspaces: 3,
    totalConnections: 86,
    activityTimeline: [
      { day: "Mon", activities: 2, prev: 1 },
      { day: "Tue", activities: 4, prev: 3 },
      { day: "Wed", activities: 3, prev: 5 },
      { day: "Thu", activities: 5, prev: 2 },
      { day: "Fri", activities: 7, prev: 4 },
      { day: "Sat", activities: 4, prev: 6 },
      { day: "Sun", activities: 6, prev: 2 },
    ],
    challengeByType: [
      { type: "Coding", count: 8 },
      { type: "MCQ", count: 5 },
      { type: "Aptitude", count: 3 },
      { type: "Puzzle", count: 2 },
    ],
    workspaceTasks: [
      { name: "Completed", value: 12, color: "#34d399" },
      { name: "In Progress", value: 8, color: "#a78bfa" },
      { name: "Pending", value: 5, color: "#f87171" },
    ],
    engagementData: [
      { name: "Likes", value: 142, change: 12, icon: Heart },
      { name: "Comments", value: 37, change: 8, icon: MessageCircle },
      { name: "Shares", value: 28, change: 5, icon: Share2 },
      { name: "Views", value: 890, change: 23, icon: Eye },
    ],
    skillsProgress: [
      { skill: "React", value: 90, color: "#818cf8" },
      { skill: "JavaScript", value: 85, color: "#38bdf8" },
      { skill: "Node.js", value: 75, color: "#34d399" },
      { skill: "Python", value: 60, color: "#fbbf24" },
      { skill: "CSS", value: 80, color: "#e879f9" },
      { skill: "MongoDB", value: 70, color: "#f87171" },
    ],
    recentAchievements: [
      { id: "a1", title: "Completed 5 Coding Challenges", date: "2 days ago", icon: Code, color: "#8b5cf6" },
      { id: "a2", title: "Earned 'Problem Solver' Badge", date: "5 days ago", icon: Award, color: "#f59e0b" },
      { id: "a3", title: "Joined AI Project Workspace", date: "1 week ago", icon: Briefcase, color: "#06b6d4" },
      { id: "a4", title: "Reached 1,000 Points Milestone", date: "1 week ago", icon: Star, color: "#ec4899" },
    ],
    projectContributions: [
      { project: "E-Commerce Platform", commits: 24, lines: 1200, pct: 80 },
      { project: "Portfolio Website", commits: 12, lines: 800, pct: 55 },
      { project: "Open Source Lib", commits: 8, lines: 450, pct: 35 },
    ],
    topCollaborators: [
      { name: "Sarah Chen", username: "@sarahc", contributions: 15, avatar: "SC", gradient: "from-purple-500 to-pink-500" },
      { name: "Mike Johnson", username: "@mikej", contributions: 12, avatar: "MJ", gradient: "from-cyan-500 to-blue-500" },
      { name: "Priya Patel", username: "@priyap", contributions: 10, avatar: "PP", gradient: "from-fuchsia-500 to-pink-500" },
    ],
    weeklyProgress: 68,
    monthlyPoints: [
      { month: "Oct", points: 320 },
      { month: "Nov", points: 480 },
      { month: "Dec", points: 390 },
      { month: "Jan", points: 610 },
      { month: "Feb", points: 720 },
      { month: "Mar", points: 850 },
      { month: "Apr", points: 1250 },
    ],
  });

  // ─── Loading, error, and render ──────────────────────────────────────
  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading analytics...</div>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  const finalStats = stats || getPlaceholderStats();

  // ─── Render using stats (unchanged) ──────────────────────────────
  const overviewStats = [
    { label: "Activities", value: finalStats.totalActivities, icon: Activity },
    { label: "Challenges", value: finalStats.totalChallenges, icon: Target },
    { label: "Total Points", value: finalStats.totalPoints, icon: Award },
    { label: "Workspaces", value: finalStats.activeWorkspaces, icon: Briefcase },
    { label: "Connections", value: finalStats.totalConnections, icon: Users },
  ];

  const Card = ({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) => (
    <div className="bg-white border border-gray-200 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600">
          <Icon className="w-4 h-4" />
        </div>
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      </div>
      {children}
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen font-sans py-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-3 py-1 text-xs text-green-700 mb-3">
            <Activity className="w-3 h-3" /> Performance insights
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Track your performance, engagement, and growth.</p>
          {error && <p className="text-xs text-amber-600 mt-1">⚠️ {error} – showing placeholder data</p>}
        </div>

        {/* Top stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {overviewStats.map((s) => (
            <div key={s.label} className="bg-white border border-gray-200 rounded-2xl p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">{s.value.toLocaleString()}</div>
              <div className="text-xs text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Activity Timeline */}
        <Card title="Activity Timeline — Last 7 Days" icon={Activity}>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={finalStats.activityTimeline}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="day" stroke="#9ca3af" fontSize={12} />
              <YAxis stroke="#9ca3af" fontSize={12} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Area type="monotone" dataKey="activities" name="This week" stroke="#8b5cf6" strokeWidth={2} fill="#c4b5fd" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Monthly Points + Challenges */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="Points Growth" icon={TrendingUp}>
            {finalStats.monthlyPoints.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-gray-500">No points data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={finalStats.monthlyPoints}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
                  <YAxis stroke="#9ca3af" fontSize={12} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Line type="monotone" dataKey="points" name="Points" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </Card>

          <Card title="Challenges Activity" icon={Target}>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={finalStats.challengeByType}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="type" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="count" name="Count" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Workspace Tasks + Skills */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="Workspace Task Status" icon={Briefcase}>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={finalStats.workspaceTasks} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value">
                    {finalStats.workspaceTasks.map((e, i) => (
                      <Cell key={i} fill={e.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-3 w-full">
                {finalStats.workspaceTasks.map((t) => (
                  <div key={t.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ background: t.color }} />
                      <span className="text-sm text-gray-700">{t.name}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{t.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <Card title="Skills Proficiency" icon={Code}>
            <div className="space-y-4">
              {finalStats.skillsProgress.every(s => s.value === 0) ? (
                <div className="text-center text-gray-500 py-6">No skills data available</div>
              ) : (
                finalStats.skillsProgress.map((s) => (
                  <div key={s.skill}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700">{s.skill}</span>
                      <span className="text-gray-600">{s.value}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${s.value}%`, backgroundColor: s.color }} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Engagement, Contributions, Collaborators */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card title="Engagement Received" icon={Heart}>
            <div className="space-y-3">
              {finalStats.engagementData.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700">{item.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">{item.value.toLocaleString()}</div>
                      {item.change > 0 && <div className="text-xs text-green-600">+{item.change}%</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card title="Project Contributions" icon={GitBranch}>
            {finalStats.projectContributions.length === 0 ? (
              <div className="text-center text-gray-500 py-6">No project contributions yet</div>
            ) : (
              <div className="space-y-4">
                {finalStats.projectContributions.map((p) => (
                  <div key={p.project} className="p-3 bg-gray-50 rounded-xl">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-800">{p.project}</span>
                      <span className="text-xs text-gray-500">{p.commits} commits</span>
                    </div>
                    <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden mb-1">
                      <div className="h-full rounded-full bg-purple-500" style={{ width: `${p.pct}%` }} />
                    </div>
                    <div className="text-xs text-gray-500">{p.lines.toLocaleString()} lines changed</div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card title="Top Collaborators" icon={Users}>
            {finalStats.topCollaborators.length === 0 ? (
              <div className="text-center text-gray-500 py-6">No collaborator data yet</div>
            ) : (
              <div className="space-y-3">
                {finalStats.topCollaborators.map((u, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="w-9 h-9 rounded-xl bg-gray-200 flex items-center justify-center text-gray-700 font-bold">
                      {u.avatar}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{u.name}</p>
                      <p className="text-xs text-gray-500">{u.username}</p>
                    </div>
                    <div className="text-sm font-semibold text-purple-600">{u.contributions}</div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Weekly Progress + Achievements */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card title="Weekly Goal Progress" icon={Clock}>
            <div className="flex justify-between items-end mb-3">
              <div className="text-4xl font-bold text-gray-900">{finalStats.weeklyProgress}%</div>
              <div className="px-3 py-1 rounded-full bg-orange-50 text-orange-600 text-xs font-medium">5-day streak 🔥</div>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-1">
              <div className="h-full rounded-full bg-green-500" style={{ width: `${finalStats.weeklyProgress}%` }} />
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>0%</span>
              <span>{finalStats.weeklyProgress}% done</span>
              <span>100%</span>
            </div>
            <div className="grid grid-cols-3 gap-3 mt-5 pt-4 border-t border-gray-200">
              <div className="text-center">
                <div className="text-lg font-bold text-purple-600">{finalStats.totalChallenges}</div>
                <div className="text-xs text-gray-500">Challenges</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-cyan-600">{finalStats.totalActivities}</div>
                <div className="text-xs text-gray-500">Activities</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-pink-600">{finalStats.totalPoints}</div>
                <div className="text-xs text-gray-500">Points</div>
              </div>
            </div>
          </Card>

          <Card title="Recent Achievements" icon={Award}>
            {finalStats.recentAchievements.length === 0 ? (
              <div className="text-center text-gray-500 py-6">No achievements yet. Keep going!</div>
            ) : (
              <div className="space-y-3">
                {finalStats.recentAchievements.map((ach) => {
                  const Icon = ach.icon;
                  return (
                    <div key={ach.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${ach.color}20` }}>
                        <Icon className="w-4 h-4" style={{ color: ach.color }} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">{ach.title}</p>
                        <p className="text-xs text-gray-500">{ach.date}</p>
                      </div>
                      <Zap className="w-4 h-4 text-green-500" />
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-400 pt-4">
          Last updated: just now · Data refreshes every hour
          {error && <span className="block text-amber-500 mt-1">⚠️ Using placeholder data – API error: {error}</span>}
        </div>
      </div>
    </div>
  );
}