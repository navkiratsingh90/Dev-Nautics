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

    const requester = await User.findOne({
      email: session.user.email,
    });

    if (!requester) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    const { id } = await params;
    const { userIdToMakeAdmin } = await req.json();

    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(userIdToMakeAdmin)) {
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

    const isAllowed =
      community.createdBy.toString() === requester._id.toString() ||
      community.admins?.some((a: any) => a.toString() === requester._id.toString());

    if (!isAllowed) {
      return NextResponse.json(
        {
          success: false,
          message: "Only admins can manage admin roles",
        },
        { status: 403 }
      );
    }

    const isMember = community.joinedMembers?.some(
      (m: any) => m.toString() === userIdToMakeAdmin
    );

    if (!isMember) {
      return NextResponse.json(
        {
          success: false,
          message: "User must be a community member first",
        },
        { status: 400 }
      );
    }

    if (community.createdBy.toString() === userIdToMakeAdmin) {
      return NextResponse.json(
        {
          success: false,
          message: "Creator is already the primary admin",
        },
        { status: 400 }
      );
    }

    const alreadyAdmin = community.admins?.some(
      (a: any) => a.toString() === userIdToMakeAdmin
    );

    if (alreadyAdmin) {
      community.admins = community.admins.filter(
        (a: any) => a.toString() !== userIdToMakeAdmin
      );

      await community.save();

      return NextResponse.json(
        {
          success: true,
          message: "Admin role removed",
          community,
        },
        { status: 200 }
      );
    }

    community.admins.push(userIdToMakeAdmin);

    await community.save();

    return NextResponse.json(
      {
        success: true,
        message: "Admin role assigned successfully",
        community,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("ADMIN ROLE ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      { status: 500 }
    );
  }
}