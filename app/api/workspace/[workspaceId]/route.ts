import { auth } from "@/auth";
import connectDb from "@/lib/db";
import Workspace from "@/models/workspace-model";
import User from "@/models/user-model";
import { NextRequest, NextResponse } from "next/server";

// ─── GET: Fetch a single workspace ──────────────────────────────────
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
      .populate("leader", "username email")
      .populate("members.user", "username email")
      .populate("tasks.assignedTo", "username email");

    if (!workspace) {
      return NextResponse.json(
        { success: false, message: "Workspace not found" },
        { status: 404 }
      );
    }

    // Check if user is a member or leader
    const isMember = workspace.members.some(
      (m: any) => m.user._id.toString() === currentUser._id.toString()
    );
    const isLeader = workspace.leader._id.toString() === currentUser._id.toString();

    if (!isMember && !isLeader) {
      return NextResponse.json(
        { success: false, message: "Access denied" },
        { status: 403 }
      );
    }

    // Calculate progress (timeline completed)
    const totalTimelines = workspace.timeline?.length || 0;
    const completedTimelines = workspace.timeline?.filter((t: any) => t.completed).length || 0;
    const progress = totalTimelines > 0 ? Math.round((completedTimelines / totalTimelines) * 100) : 0;

    // Get user's tasks
    const userTasks = workspace.tasks.filter(
      (task: any) => task.assignedTo?._id?.toString() === currentUser._id.toString()
    );

    return NextResponse.json({
      success: true,
      data: {
        ...workspace.toObject(),
        progress,
        userTasks,
      },
    });
  } catch (error: any) {
    console.error("GET WORKSPACE ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// ─── PUT: Update workspace (leader only) ─────────────────────────────
export async function PUT(
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

    const { workspaceId } = await params;
    const currentUser = await User.findOne({ email: session.user.email });
    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return NextResponse.json(
        { success: false, message: "Workspace not found" },
        { status: 404 }
      );
    }

    if (workspace.leader.toString() !== currentUser._id.toString()) {
      return NextResponse.json(
        { success: false, message: "Only the leader can update this workspace" },
        { status: 403 }
      );
    }

    const body = await req.json();

    // ✅ Update all fields that the frontend may send
    if (body.githubLink !== undefined) workspace.githubLink = body.githubLink;
    if (body.timeline !== undefined) workspace.timeline = body.timeline;
    if (body.status !== undefined) workspace.status = body.status;
    if (body.commits !== undefined) workspace.commits = body.commits;
    if (body.calendarEvents !== undefined) workspace.calendarEvents = body.calendarEvents;
    if (body.description !== undefined) workspace.description = body.description;
    if (body.tags !== undefined) workspace.tags = body.tags;
    // Add any other fields your frontend might update

    await workspace.save();

    // Populate before sending back
    await workspace.populate("leader", "username email");
    await workspace.populate("members.user", "username email");

    return NextResponse.json({
      success: true,
      message: "Workspace updated successfully",
      data: workspace,
    });
  } catch (error: any) {
    console.error("UPDATE WORKSPACE ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// ─── DELETE: Delete workspace (leader only) ─────────────────────────
export async function DELETE(
  req: NextRequest,
  { params }: { params: { workspaceId : string } }
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

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return NextResponse.json(
        { success: false, message: "Workspace not found" },
        { status: 404 }
      );
    }

    if (workspace.leader.toString() !== currentUser._id.toString()) {
      return NextResponse.json(
        { success: false, message: "Only the leader can delete this workspace" },
        { status: 403 }
      );
    }

    await Workspace.findByIdAndDelete(workspaceId);

    return NextResponse.json({
      success: true,
      message: "Workspace deleted successfully",
    });
  } catch (error: any) {
    console.error("DELETE WORKSPACE ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}