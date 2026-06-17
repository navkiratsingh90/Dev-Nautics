import { auth } from "@/auth";
import connectDb from "@/lib/db";
import Feed from "@/models/feed-model";
import User from "@/models/user-model";
import { NextRequest, NextResponse } from "next/server";

interface Params {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(
  req: NextRequest,
  { params }: Params
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

    const alreadyBookmarked = activity.bookmarks.some(
      (bookmark: any) =>
        bookmark.toString() === user._id.toString()
    );

    if (alreadyBookmarked) {
      activity.bookmarks = activity.bookmarks.filter(
        (bookmark: any) =>
          bookmark.toString() !== user._id.toString()
      );

      await activity.save();

      return NextResponse.json({
        success: true,
        bookmarked: false,
        message: "Bookmark removed",
      });
    }

    activity.bookmarks.push(user._id);

    await activity.save();

    return NextResponse.json({
      success: true,
      bookmarked: true,
      message: "Bookmarked successfully",
    });
  } catch (error) {
    console.error("BOOKMARK ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      { status: 500 }
    );
  }
}