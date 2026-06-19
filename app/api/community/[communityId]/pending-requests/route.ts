import { auth } from "@/auth";
import connectDb from "@/lib/db";
import Community from "@/models/community-model";
import User from "@/models/user-model";
import { NextResponse } from "next/server";

function flattenSkills(skills: any): string[] {
  if (!skills) return [];
  return Object.values(skills).flat().map(String).filter(Boolean);
}

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

    const currentUser = await User.findOne({
      email: session.user.email,
    }).select("_id");

    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    const communities = await Community.find({
      $or: [
        { createdBy: currentUser._id },
        { admins: currentUser._id },
      ],
    })
      .populate(
        "pendingRequests",
        "username about skills portfolio position createdAt email"
      )
      .sort({ updatedAt: -1 })
      .lean();

    const requests = communities.flatMap((community: any) => {
      const communityIcon =
        community.file ||
        community.communityName?.slice(0, 2).toUpperCase() ||
        "CM";

      return (community.pendingRequests || []).map((pending: any) => ({
        userId: pending._id?.toString(),
        username: pending.username || "User",
        about: pending.about || "",
        skills: flattenSkills(pending.skills),
        communityId: community._id.toString(),
        communityName: community.communityName,
        communityIcon,
        members: community.totalMembers || 0,
        sentAt: community.updatedAt || pending.createdAt || new Date().toISOString(),
      }));
    });

    requests.sort(
      (a: any, b: any) =>
        new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()
    );

    return NextResponse.json(
      {
        success: true,
        requests,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET COMMUNITY REQUESTS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      { status: 500 }
    );
  }
}