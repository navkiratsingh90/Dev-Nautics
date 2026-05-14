import User from "@/models/user-model";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
// import { connectDB } from "@/lib/db"; // make sure you have this

export async function POST(req: NextRequest) {
  try {
    // await connectDB();

    const { username, email, password } = await req.json();

    // ✅ Proper validation
    if (!username || !email || !password) {
      return NextResponse.json(
        { success: false, message: "All fields are required" },
        { status: 400 }
      );
    }

    // ✅ Check existing user
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "Email already registered" },
        { status: 409 }
      );
    }

    // ✅ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Create user
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    // ✅ Remove password before sending response
    const userWithoutPassword = {
      _id: newUser._id,
      username: newUser.username,
      email: newUser.email,
    };

    return NextResponse.json(
      {
        success: true,
        message: "User registered successfully",
        data: userWithoutPassword,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
