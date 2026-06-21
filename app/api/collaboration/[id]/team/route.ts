import { auth } from "@/auth";
import connectDb from "@/lib/db";
import Collaboration from "@/models/collaboration-model";
import User from "@/models/user-model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDb();
    const {id} = await params
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const currentUser = await User.findOne({ email: session.user.email }).select("_id");
    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    const { userId, username, roleAssigned } = await req.json();

    if (!roleAssigned || (!userId && !username)) {
      return NextResponse.json(
        { success: false, message: "userId/username and roleAssigned are required" },
        { status: 400 }
      );
    }

    const project = await Collaboration.findById(id);
    if (!project) {
      return NextResponse.json(
        { success: false, message: "Project not found" },
        { status: 404 }
      );
    }

    if (project.createdBy.toString() !== currentUser._id.toString()) {
      return NextResponse.json(
        { success: false, message: "Only the owner can add teammates" },
        { status: 403 }
      );
    }

    let userDoc = null;

    if (userId) {
      userDoc = await User.findById(userId).select("_id username");
    } else if (username) {
      userDoc = await User.findOne({ username }).select("_id username");
    }

    if (!userDoc) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    const alreadyMember = project.currentTeamMembers.some(
      (m: any) => m.user.toString() === userDoc._id.toString()
    );
    if (alreadyMember) {
      return NextResponse.json(
        { success: false, message: "User already in team" },
        { status: 400 }
      );
    }

    if (project.currentTeamMembers.length >= project.totalTeamSize) {
      return NextResponse.json(
        { success: false, message: "Team is already full" },
        { status: 400 }
      );
    }

    project.currentTeamMembers.push({
      user: userDoc._id,
      roleAssigned: String(roleAssigned).trim(),
    });

    await project.save();

    return NextResponse.json(
      {
        success: true,
        message: "Teammate added successfully",
        project,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("ADD TEAMMATE ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}