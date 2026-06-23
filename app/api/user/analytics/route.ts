// app/api/analytics/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDb from "@/lib/db";
import { auth } from "@/auth";
import User from "@/models/user-model";
import Activity from "@/models/feed-model";
import Challenge from "@/models/question-model";
import Community from "@/models/community-model";
import Workspace from "@/models/workspace-model";

export async function GET(req: NextRequest) {
  try {
    await connectDb();

    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    const userId = user._id;

    // ─── Activities ────────────────────────────────────────────────────────
    const totalActivities = await Activity.countDocuments({ createdBy: userId });

    const likesAgg = await Activity.aggregate([
      { $match: { createdBy: userId } },
      { $project: { likesCount: { $size: "$likes" } } },
      { $group: { _id: null, total: { $sum: "$likesCount" } } },
    ]);
    const totalLikes = likesAgg.length ? likesAgg[0].total : 0;

    const commentsAgg = await Activity.aggregate([
      { $match: { createdBy: userId } },
      { $project: { commentsCount: { $size: "$comments" } } },
      { $group: { _id: null, total: { $sum: "$commentsCount" } } },
    ]);
    const totalComments = commentsAgg.length ? commentsAgg[0].total : 0;

    const activityTimeline = await Activity.aggregate([
      { $match: { createdBy: userId } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // ─── Challenges ──────────────────────────────────────────────────────
    // Total participated: user appears in any leaderboard
    const totalParticipated = await Challenge.countDocuments({
      "leaderboard.userId": userId,
    });

    // Solved: user appears in successfulSubmissions array
    const solved = await Challenge.countDocuments({
      successfulSubmissions: userId,
    });

    // Challenge timeline: daily points from leaderboard
    const challengeTimeline = await Challenge.aggregate([
      { $match: { "leaderboard.userId": userId } },
      { $unwind: "$leaderboard" },
      { $match: { "leaderboard.userId": userId } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$leaderboard.submittedAt" } },
          totalScore: { $sum: "$leaderboard.score" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // ─── Projects (Workspaces) ──────────────────────────────────────────
    const activeProjects = await Workspace.find({ "members.user": userId });

    let tasksAssigned = 0;
    let tasksCompleted = 0;
    activeProjects.forEach((project) => {
      // project.tasks is an array of task subdocuments
      const assigned = project.tasks.filter(
        (t: any) => t.assignedTo?.toString() === userId.toString()
      );
      tasksAssigned += assigned.length;
      tasksCompleted += assigned.filter((t: any) => t.status === "Completed").length;
    });

    // ─── Discussions (Communities) ──────────────────────────────────────
    const joinedDiscussions = await Community.countDocuments({
      joinedMembers: userId,
    });
    const pendingRequests = await Community.countDocuments({
      pendingRequests: userId,
    });

    // ─── Response ────────────────────────────────────────────────────────
    return NextResponse.json({
      success: true,
      userInfo: {
        username: user.username,
        email: user.email,
        totalPoints: user.totalPoints || 0,
        connections: user.connectedUsers?.length || 0,
      },
      analytics: {
        activities: {
          total: totalActivities,
          likes: totalLikes,
          comments: totalComments,
          timeline: activityTimeline,
        },
        challenges: {
          totalParticipated,
          solved,
          timeline: challengeTimeline,
          totalPointsScored: user.totalPoints || 0,
        },
        projects: {
          total: activeProjects.length,
          tasksAssigned,
          tasksCompleted,
        },
        discussions: {
          joined: joinedDiscussions,
          pendingRequests,
        },
      },
      message: "User analytics fetched successfully",
    });
  } catch (error: any) {
    console.error("Analytics API error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}