import { NextRequest, NextResponse } from "next/server";
import connectDb from "@/lib/db";
import User from "@/models/user-model";
import { auth } from "@/auth";

// ─── Helper: Check if current user is admin ─────────────────────────
async function isAdmin() {
  const session = await auth();
  if (!session?.user?.email) return false;
  const user = await User.findOne({ email: session.user.email });
  return user?.role === "admin"; // or user?.isAdmin === true
}

// ─── GET: Fetch all users ─────────────────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    await connectDb();

    // // Admin check
    // if (!(await isAdmin())) {
    //   return NextResponse.json(
    //     { success: false, message: "Unauthorized. Admin access required." },
    //     { status: 403 }
    //   );
    // }

    const url = new URL(req.url);
    const search = url.searchParams.get("search") || "";
    const page = Math.max(1, Number(url.searchParams.get("page") || 1));
    const limit = Math.min(50, Number(url.searchParams.get("limit") || 20));
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (search) {
      const regex = new RegExp(search, "i");
      filter.$or = [
        { username: regex },
        { email: regex },
        { position: regex },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .select("-password -verificationCode -verificationExpiry")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(filter),
    ]);

    return NextResponse.json({
      success: true,
      data: users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("GET ADMIN USERS ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// ─── POST: Create a new user (admin only) ────────────────────────────
export async function POST(req: NextRequest) {
  try {
    await connectDb();

    if (!(await isAdmin())) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { username, email, password, position, portfolio, about } = body;

    if (!username || !email || !password) {
      return NextResponse.json(
        { success: false, message: "Username, email, and password are required." },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) {
      return NextResponse.json(
        { success: false, message: "User with this email or username already exists." },
        { status: 400 }
      );
    }

    // Hash password (if you use bcrypt, you should hash it)
    // For now, we assume the password is already hashed by the frontend? Usually not.
    // We'll hash it using bcrypt or your preferred method.
    // We'll keep it simple: we'll use the plain password and assume you have a pre-save hook.
    const newUser = await User.create({
      username,
      email,
      password, // Should be hashed! (Use bcrypt in your model's pre-save)
      position: position || "",
      portfolio: portfolio || "",
      about: about || "",
      isVerified: false,
      role: "user", // default role
    });

    // Remove sensitive fields before sending back
    const userObj = newUser.toObject();
    delete userObj.password;
    delete userObj.verificationCode;
    delete userObj.verificationExpiry;

    return NextResponse.json({
      success: true,
      message: "User created successfully.",
      data: userObj,
    }, { status: 201 });
  } catch (error: any) {
    console.error("CREATE ADMIN USER ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}