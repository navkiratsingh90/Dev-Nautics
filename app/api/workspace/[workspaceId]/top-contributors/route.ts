import { auth } from "@/auth";
import connectDb from "@/lib/db";
import Workspace from "@/models/workspace-model";
import User from "@/models/user-model";
import { NextRequest, NextResponse } from "next/server";

// ─── GET: Get top 5 contributors for a workspace ──────────────────
export async function GET(
  req: NextRequest,
  { params }: { params: { workspaceId: string } }
) {
  try {
    await connectDb();

    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }
    const {workspaceId} = await params
    const currentUser = await User.findOne({ email: session.user.email });
    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    const workspace = await Workspace.findById(workspaceId)
      .populate("members.user", "username email");

    if (!workspace) {
      return NextResponse.json(
        { success: false, message: "Workspace not found" },
        { status: 404 }
      );
    }

    // Sort members by totalTasksCompleted (descending) and take top 5
    const sorted = [...workspace.members].sort(
      (a: any, b: any) => (b.totalTasksCompleted || 0) - (a.totalTasksCompleted || 0)
    );

    const topContributors = sorted.slice(0, 5);

    return NextResponse.json({
      success: true,
      data: topContributors,
    });
  } catch (error: any) {
    console.error("GET CONTRIBUTORS ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}