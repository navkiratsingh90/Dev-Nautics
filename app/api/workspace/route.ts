import { auth } from "@/auth";
import connectDb from "@/lib/db";
import Workspace from "@/models/workspace-model";
import User from "@/models/user-model";
import { NextRequest, NextResponse } from "next/server";

// ─── GET: List all workspaces (filter by status via query) ──────────
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

    const currentUser = await User.findOne({ email: session.user.email });
    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    const url = new URL(req.url);
    const status = url.searchParams.get("status") || "";

    let query: any = {
      $or: [
        { leader: currentUser._id },
        { "members.user": currentUser._id },
      ],
    };

    if (status && ["Active", "On Hold", "Completed", "Not Started"].includes(status)) {
      query.status = status;
    }

    const workspaces = await Workspace.find(query)
      .populate("leader", "username email")
      .populate("members.user", "username email");

    return NextResponse.json({
      success: true,
      data: workspaces,
    });
  } catch (error: any) {
    console.error("GET WORKSPACES ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// ─── POST: Create a new workspace ────────────────────────────────────
export async function POST(req: NextRequest) {
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

    const body = await req.json();

    const {
      title,
      description,
      timeline,
      members,
      githubLink,
      status,
    } = body;

    // Validation
    if (!title || !description || !timeline || !status || !githubLink) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Prepare members array with default role if not provided
    const memberObjects = members?.map((m: any) => ({
      user: m.user,
      role: m.role || "Member",
      totalTasksCompleted: 0,
    })) || [];

    // The leader is automatically added as a member with role "Leader"
    const leaderExists = memberObjects.some(
      (m: any) => m.user.toString() === currentUser._id.toString()
    );
    if (!leaderExists) {
      memberObjects.push({
        user: currentUser._id,
        role: "Leader",
        totalTasksCompleted: 0,
      });
    }

    // Create the workspace
    const newWorkspace = await Workspace.create({
      title,
      description,
      timeline,
      leader: currentUser._id,
      members: memberObjects,
      githubLink,
      status,
    });

    // Populate leader and members
    await newWorkspace.populate("leader", "username email");
    await newWorkspace.populate("members.user", "username email");

    return NextResponse.json(
      {
        success: true,
        message: "Workspace created successfully",
        data: newWorkspace,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("CREATE WORKSPACE ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}