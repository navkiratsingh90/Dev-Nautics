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

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid community id",
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

    const userId = user._id.toString();

    if (community.createdBy.toString() === userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Creator cannot leave the community",
        },
        { status: 400 }
      );
    }

    const isMember = community.joinedMembers?.some(
      (m: any) => m.toString() === userId
    );

    if (!isMember) {
      return NextResponse.json(
        {
          success: false,
          message: "You are not a member of this community",
        },
        { status: 400 }
      );
    }

    community.joinedMembers = community.joinedMembers.filter(
      (m: any) => m.toString() !== userId
    );

    community.admins = community.admins.filter(
      (a: any) => a.toString() !== userId
    );

    community.totalMembers = community.joinedMembers.length;

    await community.save();

    return NextResponse.json(
      {
        success: true,
        message: "You have left the community",
        community,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("LEAVE COMMUNITY ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      { status: 500 }
    );
  }
}