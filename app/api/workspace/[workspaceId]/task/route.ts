import { auth } from "@/auth";
import connectDb from "@/lib/db";
import Workspace from "@/models/workspace-model";
import User from "@/models/user-model";
import { NextRequest, NextResponse } from "next/server";

// ─── GET: Get tasks assigned to the authenticated user ─────────────
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

    const currentUser = await User.findOne({ email: session.user.email });
    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }
	const {workspaceId} = await params
    const workspace = await Workspace.findById(workspaceId)
      .populate("tasks.assignedTo", "username email");

    if (!workspace) {
      return NextResponse.json(
        { success: false, message: "Workspace not found" },
        { status: 404 }
      );
    }

    const userTasks = workspace.tasks.filter(
      (task: any) => task.assignedTo?._id?.toString() === currentUser._id.toString()
    );

    return NextResponse.json({
      success: true,
      data: userTasks,
    });
  } catch (error: any) {
    console.error("GET USER TASKS ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// ─── POST: Assign a new task (leader only) ──────────────────────────
export async function POST(
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

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return NextResponse.json(
        { success: false, message: "Workspace not found" },
        { status: 404 }
      );
    }

    if (workspace.leader.toString() !== currentUser._id.toString()) {
      return NextResponse.json(
        { success: false, message: "Only the leader can assign tasks" },
        { status: 403 }
      );
    }

    const { description, priority, assignedTo, dueDate } = await req.json();

    if (!description || !priority || !assignedTo) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if assigned user is a member
    const isMember = workspace.members.some(
      (m: any) => m.user.toString() === assignedTo
    );
    if (!isMember) {
      return NextResponse.json(
        { success: false, message: "Assigned user is not a member" },
        { status: 400 }
      );
    }

    const newTask = {
      description,
      priority,
      assignedTo,
      status: "Pending",
      dueDate: dueDate ? new Date(dueDate) : undefined,
    };

    workspace.tasks.push(newTask);
    await workspace.save();

    const latestTask = workspace.tasks[workspace.tasks.length - 1];
    await workspace.populate("tasks.assignedTo", "username email");

    return NextResponse.json({
      success: true,
      message: "Task assigned successfully",
      data: latestTask,
    });
  } catch (error: any) {
    console.error("ASSIGN TASK ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}