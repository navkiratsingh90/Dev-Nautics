import connectDb from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import User from "@/models/user-model";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendMail } from "@/lib/send-mail";

export async function POST(req: NextRequest) {
  try {
    const { username, email, password } = await req.json();

    if (!username || !email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "All fields are required",
        },
        { status: 400 }
      );
    }

    await connectDb();

    const existingUser = await User.findOne({ email });

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    const hashedPassword = await bcrypt.hash(password, 10);

    // User already verified
    if (existingUser?.isVerified) {
      return NextResponse.json(
        {
          success: false,
          message: "User already exists",
        },
        { status: 400 }
      );
    }

    // User exists but not verified
    if (existingUser && !existingUser.isVerified) {
      existingUser.username = username;
      existingUser.password = hashedPassword;
      existingUser.verificationCode = otp;
      existingUser.verificationExpiry = otpExpiry;

      await existingUser.save();
    } else {
      await User.create({
        username,
        email,
        password: hashedPassword,

        verificationCode: otp,
        verificationExpiry: otpExpiry,

        isVerified: false,
      });
    }

    await sendMail(
      email,
      `Your verification OTP is ${otp}. It will expire in 10 minutes.`
    );

    return NextResponse.json(
      {
        success: true,
        message: "OTP sent successfully",
        email,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      { status: 500 }
    );
  }
}

function generateOTP(length = 6) {
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;

  return crypto.randomInt(min, max + 1).toString();
}