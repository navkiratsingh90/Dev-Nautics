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
      schoolName,
      degree,
      duration,
      description,
    } = await req.json();

    if (!schoolName || !degree || !duration) {
      return NextResponse.json(
        {
          success: false,
          message: "All required fields must be provided",
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

    user.education.push({
      schoolName,
      degree,
      duration,
      description,
    });

    await user.save();

    return NextResponse.json(
      {
        success: true,
        message: "Education added successfully",
        education: user.education,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("ADD EDUCATION ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      { status: 500 }
    );
  }
}