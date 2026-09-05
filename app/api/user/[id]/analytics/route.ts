import { NextRequest, NextResponse } from "next/server";
import connectDb from "@/lib/db";
import { auth } from "@/auth";
import User from "@/models/user-model";
import Activity from "@/models/feed-model";
import Challenge from "@/models/question-model";
import Community from "@/models/community-model";
import Workspace from "@/models/workspace-model";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDb();

    // ─── Authenticate ──────────────────────────────────────────────────────
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // ─── Get the target user ID from params ─────────────────────────────
    const { id: userId } = await params;

    // ─── Get the current user from the database ──────────────────────────
    const currentUser = await User.findOne({ email: session.user.email });
    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // ─── Authorization: Only allow users to view their own analytics ────
    
    if (currentUser._id.toString() !== userId) {
      console.warn(`User ${currentUser._id} attempted to view analytics of ${userId}`);
      return NextResponse.json(
        { success: false, message: "Access denied. You can only view your own analytics." },
        { status: 403 }
      );
    }
    
    // ─── Activities ──────────────────────────────────────────────────────
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
    const totalParticipated = await Challenge.countDocuments({
      "leaderboard.userId": userId,
    });

    const solved = await Challenge.countDocuments({
      successfulSubmissions: userId,
    });

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

    // ─── User Info ───────────────────────────────────────────────────────
    const userInfo = {
      username: currentUser.username,
      email: currentUser.email,
      totalPoints: currentUser.totalPoints || 0,
      connections: currentUser.connectedUsers?.length || 0,
    };
    // ─── Response ────────────────────────────────────────────────────────
    return NextResponse.json({
      success: true,
      userInfo,
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
          totalPointsScored: currentUser.totalPoints || 0,
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