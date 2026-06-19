import connectDb from "@/lib/db";
import Message from "@/models/message-model";
import Community from "@/models/community-model";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ communityId: string }> }
) {
  try {
    await connectDb();

    const { communityId } = await params;

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

    const messages = await Message.find({
      communityId,
    })
      .populate("senderId", "username email")
      .sort({ createdAt: 1 });

    return NextResponse.json(
      {
        success: true,
        messages,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      {
        success: false,
        message: "Server Error",
      },
      { status: 500 }
    );
  }
}