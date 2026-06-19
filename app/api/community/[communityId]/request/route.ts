import { auth } from "@/auth";
import connectDb from "@/lib/db";
import Community from "@/models/community-model";
import User from "@/models/user-model";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ communityId: string }> }
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

    const user = await User.findOne({
      email: session.user.email,
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    const { communityId } = await params;

    if (!mongoose.Types.ObjectId.isValid(communityId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid community id",
        },
        { status: 400 }
      );
    }

    const community = await Community.findById(communityId);

    if (!community) {
      return NextResponse.json(
        {
          success: false,
          message: "Community not found",
        },
        { status: 404 }
      );
    }

    const userId = user._id.toString();

    const isMember = community.joinedMembers?.some(
      (member: any) => member.toString() === userId
    );

    if (isMember) {
      return NextResponse.json(
        {
          success: false,
          message: "You are already a member of this community",
        },
        { status: 400 }
      );
    }

    const alreadyRequested = community.pendingRequests?.some(
      (requester: any) => requester.toString() === userId
    );

    if (alreadyRequested) {
      return NextResponse.json(
        {
          success: false,
          message: "You have already requested to join this community",
        },
        { status: 400 }
      );
    }

    community.pendingRequests.push(user._id);

    await community.save();

    return NextResponse.json(
      {
        success: true,
        message: "Join request sent successfully",
        community,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("JOIN COMMUNITY ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      { status: 500 }
    );
  }
}