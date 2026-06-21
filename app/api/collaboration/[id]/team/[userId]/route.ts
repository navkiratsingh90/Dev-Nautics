import { auth } from "@/auth";
import connectDb from "@/lib/db";
import Collaboration from "@/models/collaboration-model";
import User from "@/models/user-model";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; userId: string } }
) {
  try {
    await connectDb();
    const {id,userId} = await params
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

    const project = await Collaboration.findById(id);
    if (!project) {
      return NextResponse.json(
        { success: false, message: "Project not found" },
        { status: 404 }
      );
    }

    if (project.createdBy.toString() !== currentUser._id.toString()) {
      return NextResponse.json(
        { success: false, message: "Only the owner can remove teammates" },
        { status: 403 }
      );
    }

    if (project.createdBy.toString() === userId) {
      return NextResponse.json(
        { success: false, message: "Owner cannot be removed" },
        { status: 400 }
      );
    }

    const before = project.currentTeamMembers.length;
    project.currentTeamMembers = project.currentTeamMembers.filter(
      (m: any) => m.user.toString() !== userId
    );

    if (project.currentTeamMembers.length === before) {
      return NextResponse.json(
        { success: false, message: "Teammate not found" },
        { status: 404 }
      );
    }

    await project.save();

    return NextResponse.json(
      {
        success: true,
        message: "Teammate removed successfully",
        project,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("REMOVE TEAMMATE ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}