import { auth } from "@/auth";
import connectDb from "@/lib/db";
import User from "@/models/user-model";
import { NextRequest, NextResponse } from "next/server";

const ALLOWED_CATEGORIES = [
  "frontend",
  "backend",
  "tools",
  "frameworks",
  "libraries",
  "languages",
] as const;

type SkillCategory = (typeof ALLOWED_CATEGORIES)[number];

export async function POST(req: NextRequest) {
  try {
    await connectDb();

    const session = await auth();
    console.log(session);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }
    	console.log("here");
      
    const { category, skill } = await req.json();
    // console.log(category , skill);
    
    if (!category || !skill?.trim()) {
      return NextResponse.json(
        { success: false, message: "Category and skill are required" },
        { status: 400 }
      );
    }

    if (!ALLOWED_CATEGORIES.includes(category)) {
      return NextResponse.json(
        { success: false, message: "Invalid skill category" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    const normalizedSkill = skill.trim();

    const skillsArray = user.skills?.[category] || [];

    if (skillsArray.includes(normalizedSkill)) {
      return NextResponse.json(
        { success: false, message: "Skill already exists" },
        { status: 400 }
      );
    }

    user.skills[category] = [...skillsArray, normalizedSkill];

    await user.save();

    return NextResponse.json(
      {
        success: true,
        message: "Skill added successfully",
        skills: user.skills,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("ADD SKILL ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
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

    const { category, skill } = await req.json();

    if (!category || !skill) {
      return NextResponse.json(
        {
          success: false,
          message: "Category and skill are required",
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

    if (!user.skills?.[category]) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid category",
        },
        { status: 400 }
      );
    }

    user.skills[category] = user.skills[category].filter(
      (item: string) => item !== skill
    );

    await user.save();

    return NextResponse.json(
      {
        success: true,
        message: "Skill removed successfully",
        skills: user.skills,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("REMOVE SKILL ERROR:", error);

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

    const user = await User.findById(id).select("skills");

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
      skills: user.skills,
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