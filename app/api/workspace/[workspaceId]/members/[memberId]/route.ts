import { auth } from "@/auth";
import connectDb from "@/lib/db";
import Workspace from "@/models/workspace-model";
import User from "@/models/user-model";
import { NextRequest, NextResponse } from "next/server";

// ─── DELETE: Remove a member from workspace (leader only) ──────────
export async function DELETE(
  req: NextRequest,
  { params }: { params: { workspaceId: string; memberId: string } }
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
	const {workspaceId, memberId }  =await  params
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
        { success: false, message: "Only the leader can remove members" },
        { status: 403 }
      );
    }

    const memberIndex = workspace.members.findIndex(
      (m: any) => m.user.toString() === memberId
    );
    if (memberIndex === -1) {
      return NextResponse.json(
        { success: false, message: "Member not found in workspace" },
        { status: 404 }
      );
    }

    // Remove member
    workspace.members.splice(memberIndex, 1);

    // Remove tasks assigned to this member
    workspace.tasks = workspace.tasks.filter(
      (task: any) => task.assignedTo?.toString() !== params.memberId
    );

    await workspace.save();

    return NextResponse.json({
      success: true,
      message: "Member removed successfully",
    });
  } catch (error: any) {
    console.error("REMOVE MEMBER ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}