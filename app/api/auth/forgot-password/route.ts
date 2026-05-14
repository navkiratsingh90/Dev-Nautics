import { NextRequest, NextResponse } from "next/server";
import User from "@/models/user-model";
// import { connectDB } from "@/lib/db";
// import { transporter } from "@/lib/mailer";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    // await connectDB();

    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email is required" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email });

    // ✅ Do NOT reveal if user exists
    if (!user) {
      return NextResponse.json(
        { success: true, message: "If email exists, OTP sent" },
        { status: 200 }
      );
    }

    // ✅ Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // ✅ Hash OTP (important security)
    const hashedOtp = crypto
      .createHash("sha256")
      .update(otp)
      .digest("hex");

    user.verificationCode = hashedOtp;
    user.verificationExpiry = Date.now() + 10 * 60 * 1000;

    await user.save();

    // ✅ Send email
    // await transporter.sendMail({
    //   to: email,
    //   subject: "Password Reset OTP",
    //   text: `Your OTP is ${otp}`,
    // });

    return NextResponse.json(
      { success: true, message: "OTP sent to email" },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}