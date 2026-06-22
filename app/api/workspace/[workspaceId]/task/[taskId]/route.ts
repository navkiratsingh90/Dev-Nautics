import { auth } from "@/auth";
import connectDb from "@/lib/db";
import Workspace from "@/models/workspace-model";
import User from "@/models/user-model";
import { NextRequest, NextResponse } from "next/server";

// ─── PUT: Mark task as completed (task owner only) ──────────────────
export async function PUT(
  req: NextRequest,
  { params }: { params: { workspaceId: string; taskId: string } }
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
    const {workspaceId, taskId} = await params
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

    const task = workspace.tasks.id(taskId);
    if (!task) {
      return NextResponse.json(
        { success: false, message: "Task not found" },
        { status: 404 }
      );
    }

    // Only the assigned user or leader can complete the task
    const isLeader = workspace.leader.toString() === currentUser._id.toString();
    const isOwner = task.assignedTo?.toString() === currentUser._id.toString();

    if (!isLeader && !isOwner) {
      return NextResponse.json(
        { success: false, message: "You cannot complete this task" },
        { status: 403 }
      );
    }

    task.status = "Completed";

    // Increment member's completed tasks count
    const member = workspace.members.find(
      (m: any) => m.user.toString() === task.assignedTo?.toString()
    );
    if (member) {
      member.totalTasksCompleted = (member.totalTasksCompleted || 0) + 1;
    }

    await workspace.save();

    return NextResponse.json({
      success: true,
      message: "Task marked as completed",
      data: task,
    });
  } catch (error: any) {
    console.error("COMPLETE TASK ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// ─── DELETE: Delete a task (leader or task owner) ──────────────────
export async function DELETE(
  req: NextRequest,
  { params }: { params: { workspaceId: string; taskId: string } }
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
    const {workspaceId, taskId} = await params
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

    const task = workspace.tasks.id(taskId);
    if (!task) {
      return NextResponse.json(
        { success: false, message: "Task not found" },
        { status: 404 }
      );
    }

    const isLeader = workspace.leader.toString() === currentUser._id.toString();
    const isOwner = task.assignedTo?.toString() === currentUser._id.toString();

    if (!isLeader && !isOwner) {
      return NextResponse.json(
        { success: false, message: "You cannot delete this task" },
        { status: 403 }
      );
    }

    workspace.tasks = workspace.tasks.filter(
      (t: any) => t._id.toString() !== params.taskId
    );

    await workspace.save();

    return NextResponse.json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error: any) {
    console.error("DELETE TASK ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}