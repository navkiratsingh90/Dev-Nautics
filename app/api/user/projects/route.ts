import { auth } from "@/auth";
import connectDb from "@/lib/db";
import uploadToCloudinary from "@/lib/cloudinary";
import User from "@/models/user-model";
import { NextRequest, NextResponse } from "next/server";

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

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const githubLink = formData.get("githubLink") as string;
    const liveLink = formData.get("liveLink") as string;
    const role = formData.get("role") as string;
    const duration = formData.get("duration") as string;
    const techStack = formData.get("techStack") as string;
    const file = formData.get("file") as File | null;

    if (!title) {
      return NextResponse.json(
        {
          success: false,
          message: "Project title is required",
        },
        { status: 400 }
      );
    }

    let imageUrl = null;

    if (file && file.size > 0) {
      imageUrl = await uploadToCloudinary(file);
    }

    user.projects.push({
      title,
      description,
      githubLink,
      liveLink,
      role,
      duration,
      file: imageUrl,
      techStack: techStack
        ? techStack.split(",").map((item) => item.trim())
        : [],
    });

    await user.save();

    return NextResponse.json(
      {
        success: true,
        message: "Project created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.log("CREATE PROJECT ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      { status: 500 }
    );
  }
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDb();

    const { id } = await params;

    const user = await User.findById(id).select("projects");

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      projects: user.projects,
    });
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