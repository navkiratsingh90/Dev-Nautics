import { auth } from "@/auth";
import connectDb from "@/lib/db";
import Community from "@/models/community-model";
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
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const admin = await User.findOne({
      email: session.user.email,
    });

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    const { id } = await params;
    const { userId } = await req.json();

    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid id",
        },
        { status: 400 }
      );
    }

    const community = await Community.findById(id);

    if (!community) {
      return NextResponse.json(
        {
          success: false,
          message: "Community not found",
        },
        { status: 404 }
      );
    }

    const isAdmin =
      community.createdBy.toString() === admin._id.toString() ||
      community.admins?.some((a: any) => a.toString() === admin._id.toString());

    if (!isAdmin) {
      return NextResponse.json(
        {
          success: false,
          message: "Only admins can reject requests",
        },
        { status: 403 }
      );
    }

    const requestExists = community.pendingRequests?.some(
      (r: any) => r.toString() === userId
    );

    if (!requestExists) {
      return NextResponse.json(
        {
          success: false,
          message: "No pending request from this user",
        },
        { status: 400 }
      );
    }

    community.pendingRequests = community.pendingRequests.filter(
      (r: any) => r.toString() !== userId
    );

    await community.save();

    return NextResponse.json(
      {
        success: true,
        message: "Join request rejected",
        community,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("REJECT COMMUNITY REQUEST ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      { status: 500 }
    );
  }
}