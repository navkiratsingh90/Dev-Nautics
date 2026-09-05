import { NextResponse } from "next/server";
import connectDb from "@/lib/db";
import User from "@/models/user-model";
import Question from "@/models/question-model";
import Workspace from "@/models/workspace-model";
import Collaboration from "@/models/collaboration-model";
import Community from "@/models/community-model";
import Submission from "@/models/submission-model";
import { auth } from "@/auth";

export async function GET() {
  try {
    await connectDb();

    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const user = await User.findOne({ email: session.user.email });
    // if (user?.role !== "admin") {
    //   return NextResponse.json({ success: false, message: "Admin access required" }, { status: 403 });
    // }

    const [
      totalUsers,
      totalQuestions,
      totalWorkspaces,
      totalCollaborations,
      totalCommunities,
      totalSubmissions,
    ] = await Promise.all([
      User.countDocuments(),
      Question.countDocuments({ isActive: true }),
      Workspace.countDocuments(),
      Collaboration.countDocuments(),
      Community.countDocuments(),
      Submission.countDocuments(),
    ]);

    const recentUsers = await User.find()
      .select("username email createdAt")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const recentSubmissions = await Submission.find()
      .populate("user", "username")
      .populate("question", "title")
      .sort({ submittedAt: -1 })
      .limit(5)
      .lean();

    return NextResponse.json({
      success: true,
      data: {
        totalUsers,
        totalQuestions,
        totalWorkspaces,
        totalCollaborations,
        totalCommunities,
        totalSubmissions,
        recentUsers,
        recentSubmissions,
      },
    });
  } catch (error) {
    console.error("STATS ERROR:", error);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}