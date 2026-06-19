import { auth } from "@/auth";
import connectDb from "@/lib/db";
import uploadToCloudinary from "@/lib/cloudinary";
import Community from "@/models/community-model";
import User from "@/models/user-model";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

const toSlug = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ communityId: string }> }
) {
  try {
    await connectDb();

    const { communityId } = await params;
	
    if (!mongoose.Types.ObjectId.isValid(communityId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid community id",
        },
        { status: 400 }
      );
    }

    const community = await Community.findById(communityId)
      .populate("createdBy", "username email position portfolio")
      .populate("admins", "username email")
      .populate("joinedMembers", "username email")
      .populate("pendingRequests", "username email");

    if (!community) {
      return NextResponse.json(
        {
          success: false,
          message: "Community not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        community,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET COMMUNITY ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ communityId: string }> }
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

    const { communityId } = await params;

    if (!mongoose.Types.ObjectId.isValid(communityId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid community id",
        },
        { status: 400 }
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

    const isCreator = community.createdBy.toString() === user._id.toString();
    const isAdmin = community.admins?.some(
      (admin: any) => admin.toString() === user._id.toString()
    );

    if (!isCreator && !isAdmin) {
      return NextResponse.json(
        {
          success: false,
          message: "You are not allowed to edit this community",
        },
        { status: 403 }
      );
    }

    const formData = await req.formData();

    const communityName = String(formData.get("communityName") || "").trim();
    const about = String(formData.get("about") || "").trim();
    const topicsRaw = String(formData.get("topics") || "").trim();
    const file = formData.get("file") as File | null;

    if (communityName) {
      const newSlug = toSlug(communityName);

      const duplicate = await Community.findOne({
        slug: newSlug,
        _id: { $ne: community._id },
      });

      if (duplicate) {
        return NextResponse.json(
          {
            success: false,
            message: "Another community with this name already exists",
          },
          { status: 400 }
        );
      }

      community.communityName = communityName;
      community.slug = newSlug;
    }

    if (about) {
      community.about = about;
    }

    if (topicsRaw) {
      community.topics = topicsRaw
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
    }

    if (file && file.size > 0) {
      const fileUrl = await uploadToCloudinary(file);
      community.file = fileUrl;
    }

    await community.save();

    return NextResponse.json(
      {
        success: true,
        message: "Community updated successfully",
        community,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("UPDATE COMMUNITY ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ communityId: string }> }
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

    const { communityId } = await params;

    if (!mongoose.Types.ObjectId.isValid(communityId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid community id",
        },
        { status: 400 }
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

    if (community.createdBy.toString() !== user._id.toString()) {
      return NextResponse.json(
        {
          success: false,
          message: "Only the creator can delete this community",
        },
        { status: 403 }
      );
    }

    await Community.findByIdAndDelete(communityId);

    return NextResponse.json(
      {
        success: true,
        message: "Community deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE COMMUNITY ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      { status: 500 }
    );
  }
}