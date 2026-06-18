import { auth } from "@/auth";
import connectDb from "@/lib/db";
import User from "@/models/user-model";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const currentUser = await User.findOne({
      email: session.user.email,
    });

    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    const { id: targetUserId } = await params;

    if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
      return NextResponse.json(
        { success: false, message: "Invalid user id" },
        { status: 400 }
      );
    }

    if (currentUser._id.toString() === targetUserId) {
      return NextResponse.json(
        { success: false, message: "You cannot connect with yourself" },
        { status: 400 }
      );
    }

    const targetUser = await User.findById(targetUserId);

    if (!targetUser) {
      return NextResponse.json(
        { success: false, message: "Target user not found" },
        { status: 404 }
      );
    }

    const alreadyConnected = targetUser.connectedUsers?.some(
      (id: any) => id.toString() === currentUser._id.toString()
    );

    if (alreadyConnected) {
      return NextResponse.json(
        { success: false, message: "Already connected" },
        { status: 400 }
      );
    }

    const alreadyRequested = targetUser.totalPendingRequests?.some(
      (id: any) => id.toString() === currentUser._id.toString()
    );

    if (alreadyRequested) {
      return NextResponse.json(
        { success: false, message: "Request already sent" },
        { status: 400 }
      );
    }

    targetUser.totalPendingRequests.push(currentUser._id);
    await targetUser.save();

    return NextResponse.json(
      {
        success: true,
        message: "Connection request sent",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("SEND CONNECTION REQUEST ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}