import { auth } from "@/auth";
import connectDb from "@/lib/db";
import Message from "@/models/message-model";
import Community from "@/models/community-model";
import User from "@/models/user-model";
import { NextRequest, NextResponse } from "next/server";
import uploadToCloudinary from "@/lib/cloudinary";

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

    const formData = await req.formData();

    const communityId = formData.get("communityId") as string;
    const text = formData.get("text") as string;
    const file = formData.get("file") as File | null;

    if (!communityId) {
      return NextResponse.json(
        {
          success: false,
          message: "Community ID required",
        },
        { status: 400 }
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

    const isMember = community.joinedMembers.some(
      (id: any) => id.toString() === user._id.toString()
    );

    if (!isMember) {
      return NextResponse.json(
        {
          success: false,
          message: "Join community first",
        },
        { status: 403 }
      );
    }

    let fileUrl = null;

    if (file) {
      fileUrl = await uploadToCloudinary(file)
    }

    const message = await Message.create({
      communityId,
      senderId: user._id,
      text: text || "",
      file: fileUrl,
      type: file ? "file" : "text",
      isDelivered: true,
    });

    const populatedMessage = await Message.findById(message._id)
      .populate("senderId", "username email");

    return NextResponse.json(
      {
        success: true,
        message: populatedMessage,
      },
      { status: 201 }
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


export async function DELETE(req: NextRequest) {
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

    const { messageId } = await req.json();

    const user = await User.findOne({
      email: session.user.email,
    });

    const message = await Message.findById(messageId);

    if (!message) {
      return NextResponse.json(
        {
          success: false,
          message: "Message not found",
        },
        { status: 404 }
      );
    }

    if (
      message.senderId.toString() !== user._id.toString()
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Not authorized",
        },
        { status: 403 }
      );
    }

    await Message.findByIdAndDelete(messageId);

    return NextResponse.json(
      {
        success: true,
        message: "Message deleted",
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Server Error",
      },
      { status: 500 }
    );
  }
}