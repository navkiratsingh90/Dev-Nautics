import { auth } from "@/auth";
import connectDb from "@/lib/db";
import Community from "@/models/community-model";
import User from "@/models/user-model";
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

    const currentUser = await User.findOne({
      email: session.user.email,
    }).select("_id");

    if (!currentUser) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    const { communityId } = await params;
    const { userIdToMakeAdmin } = await req.json();
    
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

    const isAdmin =
      community.createdBy.toString() === currentUser._id.toString() ||
      community.admins.some(
        (id: any) => id.toString() === currentUser._id.toString()
      );

    if (!isAdmin) {
      return NextResponse.json(
        {
          success: false,
          message: "Only admins can manage roles",
        },
        { status: 403 }
      );
    }
    
    const isMember = community.joinedMembers.some(
      (id: any) => id.toString() == userIdToMakeAdmin
    );

    if (!isMember) {
      return NextResponse.json(
        {
          success: false,
          message: "User must be a member first",
        },
        { status: 400 }
      );
    }

    if (community.createdBy.toString() === userIdToMakeAdmin) {
      return NextResponse.json(
        {
          success: false,
          message: "Community creator cannot be modified",
        },
        { status: 400 }
      );
    }

    const alreadyAdmin = community.admins.some(
      (id: any) => id.toString() === userIdToMakeAdmin
    );

    let message = "";

    if (alreadyAdmin) {
      community.admins = community.admins.filter(
        (id: any) => id.toString() !== userIdToMakeAdmin
      );

      message = "Admin removed successfully";
    } else {
      community.admins.push(userIdToMakeAdmin);
      message = "Admin assigned successfully";
    }

    await community.save();

    return NextResponse.json(
      {
        success: true,
        isAdmin: !alreadyAdmin,
        message,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("TOGGLE ADMIN ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      { status: 500 }
    );
  }
}