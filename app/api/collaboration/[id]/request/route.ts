import { auth } from "@/auth";
import connectDb from "@/lib/db";
import Collaboration from "@/models/collaboration-model";
import User from "@/models/user-model";
import { sendJoinRequestEmail } from "@/lib/send-mail";
import { NextRequest, NextResponse } from "next/server";

// ─── POST: Send join request email and store in DB ──────────────────
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDb();
    const { id } = await params;

    // 1. Authenticate
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

    // 2. Fetch project with creator info
    const project = await Collaboration.findById(id).populate(
      "createdBy",
      "email username"
    );
    if (!project) {
      return NextResponse.json(
        { success: false, message: "Project not found" },
        { status: 404 }
      );
    }

    // 3. Validate
    if (project.createdBy._id.toString() === currentUser._id.toString()) {
      return NextResponse.json(
        { success: false, message: "You are the owner of this project" },
        { status: 400 }
      );
    }

    const alreadyMember = project.currentTeamMembers.some(
      (m: any) => m.user.toString() === currentUser._id.toString()
    );
    if (alreadyMember) {
      return NextResponse.json(
        { success: false, message: "You are already a member" },
        { status: 400 }
      );
    }

    const alreadyRequested = project.pendingRequests.some(
      (id: any) => id.toString() === currentUser._id.toString()
    );
    if (alreadyRequested) {
      return NextResponse.json(
        { success: false, message: "Request already sent" },
        { status: 400 }
      );
    }

    // 4. Store request in DB
    project.pendingRequests.push(currentUser._id);
    await project.save();

    // 5. Send email notification
    await sendJoinRequestEmail(
      project.createdBy.email,
      project.createdBy.username,
      currentUser.username,
      currentUser.email,
      project.title,
      project.description,
      project._id
    );

    return NextResponse.json(
      { success: true, message: "Join request sent via email and stored" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("REQUEST JOIN ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// ─── DELETE: Cancel join request ──────────────────────────────────────
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDb();
    const { id } = await params;

    // 1. Authenticate
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

    // 2. Find project
    const project = await Collaboration.findById(id);
    if (!project) {
      return NextResponse.json(
        { success: false, message: "Project not found" },
        { status: 404 }
      );
    }

    // 3. Check if user has a pending request
    const requestIndex = project.pendingRequests.findIndex(
      (uid: any) => uid.toString() === currentUser._id.toString()
    );
    if (requestIndex === -1) {
      return NextResponse.json(
        { success: false, message: "No pending request to cancel" },
        { status: 400 }
      );
    }

    // 4. Remove the user from pendingRequests
    project.pendingRequests.splice(requestIndex, 1);
    await project.save();

    return NextResponse.json(
      { success: true, message: "Join request cancelled" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("CANCEL JOIN REQUEST ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}