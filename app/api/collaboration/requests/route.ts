import { auth } from "@/auth";
import connectDb from "@/lib/db";
import Collaboration from "@/models/collaboration-model";
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

    const currentUser = await User.findOne({ email: session.user.email }).select("_id");
    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    const collaborations = await Collaboration.find({
      createdBy: currentUser._id,
      pendingRequests: { $exists: true, $ne: [] },
    })
      .populate("pendingRequests", "username about skills position createdAt")
      .sort({ updatedAt: -1 });

    const requests: any[] = [];

    for (const collab of collaborations as any[]) {
      for (const pending of collab.pendingRequests || []) {
        requests.push({
          userId: pending._id.toString(),
          username: pending.username || "User",
          about: pending.about || "",
          skills: pending.skills ? Object.values(pending.skills).flat().filter(Boolean) : [],
          collaborationId: collab._id.toString(),
          title: collab.title,
          file: collab.file,
          totalTeamSize: collab.totalTeamSize,
          sentAt: pending.createdAt || collab.updatedAt,
        });
      }
    }

    requests.sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());

    return NextResponse.json(
      {
        success: true,
        requests,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("GET COLLAB REQUESTS ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}