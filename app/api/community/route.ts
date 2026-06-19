import { auth } from "@/auth";
import connectDb from "@/lib/db";
import uploadToCloudinary from "@/lib/cloudinary";
import Community from "@/models/community-model";
import User from "@/models/user-model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await connectDb();

    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await User.findOne({
      email: session.user.email,
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    const formData = await req.formData();

    const communityName = formData.get("communityName") as string;
    const about = formData.get("about") as string;
    const topics = formData.get("topics") as string;
    const file = formData.get("file") as File | null;

    if (!communityName) {
      return NextResponse.json(
        { success: false, message: "Community name required" },
        { status: 400 }
      );
    }

    const slug = communityName
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-");

    const exists = await Community.findOne({ slug });

    if (exists) {
      return NextResponse.json(
        { success: false, message: "Community already exists" },
        { status: 400 }
      );
    }

    let imageUrl = null;

    if (file && file.size > 0) {
      imageUrl = await uploadToCloudinary(file);
    }

    const community = await Community.create({
      communityName,
      slug,
      about,
      file: imageUrl,
      topics: topics
        ? topics.split(",").map((t) => t.trim())
        : [],
      createdBy: user._id,
      joinedMembers: [user._id],
      admins: [user._id],
      totalMembers: 1,
    });

    return NextResponse.json({
      success: true,
      community,
    });
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
export async function GET() {
	try {
	  await connectDb();
  
	  const communities = await Community.find()
		.populate("createdBy", "username email")
		.sort({ createdAt: -1 });
  
	  return NextResponse.json({
		success: true,
		communities,
	  });
	} catch {
	  return NextResponse.json(
		{ success: false },
		{ status: 500 }
	  );
	}
  }