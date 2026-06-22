import { auth } from "@/auth";
import connectDb from "@/lib/db";
import Workspace from "@/models/workspace-model";
import User from "@/models/user-model";
import { NextRequest, NextResponse } from "next/server";

// ─── POST: Add members to workspace (leader only) ──────────────────
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

    const currentUser = await User.findOne({ email: session.user.email });
    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }
	const {workspaceId} = await params
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return NextResponse.json(
        { success: false, message: "Workspace not found" },
        { status: 404 }
      );
    }

    if (workspace.leader.toString() !== currentUser._id.toString()) {
      return NextResponse.json(
        { success: false, message: "Only the leader can add members" },
        { status: 403 }
      );
    }

    const { members } = await req.json(); // array of { user, role }
	console.log(members);
	
    if (!members || !Array.isArray(members) || members.length === 0) {
      return NextResponse.json(
        { success: false, message: "Invalid members data" },
        { status: 400 }
      );
    }

    // Validate each member
    const newMembers = [];

for (const member of members) {
  const userExists = await User.findOne({
    username: member.user,
  });

  if (!userExists) {
    return NextResponse.json(
      {
        success: false,
        message: `User ${member.user} not found`,
      },
      { status: 404 }
    );
  }

  const alreadyMember = workspace.members.some(
    (m: any) =>
      m.user.toString() === userExists._id.toString()
  );

  if (alreadyMember) {
    return NextResponse.json(
      {
        success: false,
        message: `User ${member.user} already in workspace`,
      },
      { status: 400 }
    );
  }

  newMembers.push({
    user: userExists._id,
    role: member.role || "Member",
    totalTasksCompleted: 0,
  });
}

    workspace.members.push(...newMembers);
    await workspace.save();

    await workspace.populate("members.user", "username email");

    return NextResponse.json({
      success: true,
      message: "Members added successfully",
      data: workspace,
    });
  } catch (error: any) {
    console.error("ADD MEMBERS ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}