import connectDb from "@/lib/db";
import User from "@/models/user-model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await connectDb();

    const { email, otp } = await req.json();
    console.log("EMAIL:", email);
    console.log("OTP:", otp);

    if (!email || !otp) {
      return NextResponse.json(
        {
          success: false,
          message: "Email and OTP are required",
        },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    if (user.isVerified) {
      return NextResponse.json(
        {
          success: true,
          message: "Email already verified",
        },
        { status: 200 }
      );
    }

    if (
      !user.verificationExpiry ||
      new Date(user.verificationExpiry) < new Date()
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "OTP has expired",
        },
        { status: 400 }
      );
    }

    if (user.verificationCode !== otp) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid OTP",
        },
        { status: 400 }
      );
    }

    user.isVerified = true;
    user.verificationCode = undefined;
    user.verificationExpiry = undefined;

    await user.save();

    return NextResponse.json(
      {
        success: true,
        message: "Email verified successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("VERIFY EMAIL ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      { status: 500 }
    );
  }
}