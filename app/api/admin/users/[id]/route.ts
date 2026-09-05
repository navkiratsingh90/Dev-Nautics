import { NextRequest, NextResponse } from "next/server";
import connectDb from "@/lib/db";
import User from "@/models/user-model";
import { auth } from "@/auth";

async function isAdmin() {
  const session = await auth();
  if (!session?.user?.email) return false;
  const user = await User.findOne({ email: session.user.email });
  return user?.role === "admin";
}

// ─── GET: Fetch a single user (admin only) ──────────────────────────
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDb();
    if (!(await isAdmin())) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    const user = await User.findById(params.id)
      .select("-password -verificationCode -verificationExpiry")
      .lean();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: user });
  } catch (error: any) {
    console.error("GET USER ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// ─── PUT: Update a user (admin only) ────────────────────────────────
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDb();
    // if (!(await isAdmin())) {
    //   return NextResponse.json(
    //     { success: false, message: "Unauthorized" },
    //     { status: 403 }
    //   );
    // }

    const body = await req.json();
    const { username, email, position, portfolio, about, isVerified, role } = body;

    const user = await User.findById(params.id);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Update allowed fields
    if (username !== undefined) user.username = username;
    if (email !== undefined) user.email = email;
    if (position !== undefined) user.position = position;
    if (portfolio !== undefined) user.portfolio = portfolio;
    if (about !== undefined) user.about = about;
    if (isVerified !== undefined) user.isVerified = isVerified;
    if (role !== undefined && ["user", "admin"].includes(role)) user.role = role;

    await user.save();

    const updated = user.toObject();
    delete updated.password;
    delete updated.verificationCode;
    delete updated.verificationExpiry;

    return NextResponse.json({
      success: true,
      message: "User updated successfully.",
      data: updated,
    });
  } catch (error: any) {
    console.error("UPDATE USER ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// ─── DELETE: Delete a user (admin only) ──────────────────────────────
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDb();
    if (!(await isAdmin())) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    const user = await User.findById(params.id);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Prevent deleting the last admin (optional)
    // if (user.role === "admin") {
    //   const adminCount = await User.countDocuments({ role: "admin" });
    //   if (adminCount <= 1) {
    //     return NextResponse.json(
    //       { success: false, message: "Cannot delete the only admin." },
    //       { status: 400 }
    //     );
    //   }
    // }

    await user.deleteOne();

    return NextResponse.json({
      success: true,
      message: "User deleted successfully.",
    });
  } catch (error: any) {
    console.error("DELETE USER ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}