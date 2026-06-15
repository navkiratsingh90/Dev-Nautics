import { auth } from "@/auth";
import connectDb from "@/lib/db";
import User from "@/models/user-model";
import Feed from "@/models/feed-model";
import { NextRequest, NextResponse } from "next/server";
import uploadToCloudinary from "@/lib/cloudinary";

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

    const user = await User.findOne({ email: session.user.email }).select("_id username email");

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    const activities = await Feed.find({ createdBy: user._id })
      .populate("createdBy", "username")
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
    console.error("GET /api/feed:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
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

    const formData = await req.formData();

    const description = formData.get("description") as string;
    const file = formData.get("file") as File | null;
    const tags = formData.get("tags") as string;
	console.log(description , file , tags);
	
	const tagsArray = tags
	? tags.split(",").map(tag => tag.trim())
	: [];
    if (!description) {
      return NextResponse.json(
        {
          success: false,
          message: "Description is required",
        },
        { status: 400 }
      );
    }

    let fileUrl = null;

    if (file && file.size > 0) {
      fileUrl = await uploadToCloudinary(file);
    }

    const activity = await Feed.create({
      description,
      file: fileUrl,
      tags: tagsArray,
      createdBy: user._id,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Activity posted successfully",
        activity,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("CREATE ACTIVITY ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong",
      },
      { status: 500 }
    );
  }
}