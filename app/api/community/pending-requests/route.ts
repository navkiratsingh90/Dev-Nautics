import { auth } from "@/auth";
import connectDb from "@/lib/db";
import Community from "@/models/community-model";
import User from "@/models/user-model";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDb();

    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await User.findOne({
      email: session.user.email,
    }).select("_id");

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    const communities = await Community.find({
      $or: [
        { createdBy: user._id },
        { admins: user._id },
      ],
    }).populate(
      "pendingRequests",
      "username about skills position createdAt"
    );

    const requests = [];

    for (const community of communities) {
      for (const pendingUser of community.pendingRequests) {
        requests.push({
          userId: pendingUser._id,
          username: pendingUser.username,
          about: pendingUser.about,
          position: pendingUser.position,
          skills: pendingUser.skills
            ? Object.values(pendingUser.skills).flat()
            : [],
          communityId: community._id,
          communityName: community.communityName,
          communityIcon:
            community.file ||
            community.communityName?.slice(0, 2).toUpperCase(),
          members: community.totalMembers,
          sentAt: pendingUser.createdAt,
        });
      }
    }

    return NextResponse.json(
      {
        success: true,
        requests,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      { status: 500 }
    );
  }
}