import { auth } from "@/auth";
import connectDb from "@/lib/db";
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

    const {
      companyName,
      duration,
      role,
      description,
      location,
    } = await req.json();

    if (!companyName || !duration) {
      return NextResponse.json(
        {
          success: false,
          message: "Company name and duration are required",
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

    user.workExperience.push({
      companyName,
      duration,
      role,
      description,
      location,
    });

    await user.save();

    return NextResponse.json(
      {
        success: true,
        message: "Work experience added successfully",
        workExperience: user.workExperience,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("ADD WORK EXPERIENCE ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      { status: 500 }
    );
  }
}