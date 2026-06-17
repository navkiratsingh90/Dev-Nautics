import connectDb from "@/lib/db";
import User from "@/models/user-model";
import Feed from "@/models/feed-model";
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDb();

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid user id",
        },
        { status: 400 }
      );
    }

    const user = await User.findById(id).select("_id username email");

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    const activities = await Feed.find({
      createdBy: id,
    })
      .populate("createdBy", "username email")
      .populate("comments.createdBy", "username")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(
      {
        success: true,
        activities,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET USER FEED ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      { status: 500 }
    );
  }
}