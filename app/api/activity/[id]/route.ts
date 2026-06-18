import { auth } from "@/auth";
import connectDb from "@/lib/db";
import Feed from "@/models/feed-model";
import User from "@/models/user-model";
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
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const { id } = await params;

    const user = await User.findOne({
      email: session.user.email,
    }).select("_id");

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    const activity = await Feed.findById(id);

    if (!activity) {
      return NextResponse.json(
        {
          success: false,
          message: "Activity not found",
        },
        { status: 404 }
      );
    }

    if (activity.createdBy.toString() !== user._id.toString()) {
      return NextResponse.json(
        {
          success: false,
          message: "You can only delete your own activities",
        },
        { status: 403 }
      );
    }

    await Feed.findByIdAndDelete(id);

    return NextResponse.json(
      {
        success: true,
        message: "Activity deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE ACTIVITY ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      { status: 500 }
    );
  }
}