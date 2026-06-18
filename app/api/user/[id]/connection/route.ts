import { auth } from "@/auth";
import connectDb from "@/lib/db";
import User from "@/models/user-model";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
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

    const { id: currentUserId } = await params;
    const { otherUserId } = await req.json();

    if (!mongoose.Types.ObjectId.isValid(otherUserId)) {
      return NextResponse.json(
        { success: false, message: "Invalid user id" },
        { status: 400 }
      );
    }

    if (currentUser._id.toString() !== currentUserId) {
      return NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 }
      );
    }

    const otherUser = await User.findById(otherUserId);

    if (!otherUser) {
      return NextResponse.json(
        { success: false, message: "Other user not found" },
        { status: 404 }
      );
    }

    currentUser.totalPendingRequests = currentUser.totalPendingRequests.filter(
      (id: any) => id.toString() !== otherUserId
    );
    otherUser.totalPendingRequests = otherUser.totalPendingRequests.filter(
      (id: any) => id.toString() !== currentUserId
    );

    currentUser.connectedUsers = currentUser.connectedUsers.filter(
      (id: any) => id.toString() !== otherUserId
    );
    otherUser.connectedUsers = otherUser.connectedUsers.filter(
      (id: any) => id.toString() !== currentUserId
    );

    await Promise.all([currentUser.save(), otherUser.save()]);

    return NextResponse.json(
      {
        success: true,
        message: "Connection removed",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE CONNECTION ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}