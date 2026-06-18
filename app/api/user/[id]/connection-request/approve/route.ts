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

    const approver = await User.findOne({
      email: session.user.email,
    });

    if (!approver) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    const { id: approverId } = await params;
    const { requesterId } = await req.json();

    if (!mongoose.Types.ObjectId.isValid(requesterId)) {
      return NextResponse.json(
        { success: false, message: "Invalid requester id" },
        { status: 400 }
      );
    }

    if (approver._id.toString() !== approverId) {
      return NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 }
      );
    }

    const requester = await User.findById(requesterId);

    if (!requester) {
      return NextResponse.json(
        { success: false, message: "Requester not found" },
        { status: 404 }
      );
    }

    const requestExists = approver.totalPendingRequests?.some(
      (id: any) => id.toString() === requesterId
    );

    if (!requestExists) {
      return NextResponse.json(
        { success: false, message: "Connection request not found" },
        { status: 404 }
      );
    }

    approver.totalPendingRequests = approver.totalPendingRequests.filter(
      (id: any) => id.toString() !== requesterId
    );

    if (!approver.connectedUsers?.some((id: any) => id.toString() === requesterId)) {
      approver.connectedUsers.push(requester._id);
    }

    if (!requester.connectedUsers?.some((id: any) => id.toString() === approver._id.toString())) {
      requester.connectedUsers.push(approver._id);
    }

    await Promise.all([approver.save(), requester.save()]);

    return NextResponse.json(
      {
        success: true,
        message: "Connection approved",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("APPROVE CONNECTION ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}