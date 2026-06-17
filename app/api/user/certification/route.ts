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

    const {
      title,
      issuer,
      issueDate,
      credentialId,
      credentialUrl,
    } = await req.json();

    if (!title || !issuer) {
      return NextResponse.json(
        {
          success: false,
          message: "Title and issuer are required",
        },
        { status: 400 }
      );
    }

    user.certifications.push({
      title,
      issuer,
      issueDate,
      credentialId,
      credentialUrl,
    });

    await user.save();

    return NextResponse.json(
      {
        success: true,
        message: "Certification added successfully",
        certifications: user.certifications,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("ADD CERTIFICATION ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      { status: 500 }
    );
  }
}