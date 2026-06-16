import { auth } from "@/auth";
import connectDb from "@/lib/db";
import Feed from "@/models/feed-model";
import User from "@/models/user-model";
import { NextRequest, NextResponse } from "next/server";

interface Params {
  params: Promise<{
    id: string;
    commentId: string;
  }>;
}

export async function DELETE(
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

    const { id, commentId } = await params;

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

    const comment = activity.comments.id(id);

    if (!comment) {
      return NextResponse.json(
        {
          success: false,
          message: "Comment not found",
        },
        { status: 404 }
      );
    }

    // Only comment owner can delete
    if (comment.createdBy.toString() !== user._id.toString()) {
      return NextResponse.json(
        {
          success: false,
          message: "You can only delete your own comments",
        },
        { status: 403 }
      );
    }

    activity.comments.pull(commentId);

    await activity.save();

    return NextResponse.json(
      {
        success: true,
        message: "Comment deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE COMMENT ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      { status: 500 }
    );
  }
}