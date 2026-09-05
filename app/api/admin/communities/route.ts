import { NextRequest, NextResponse } from "next/server";
import connectDb from "@/lib/db";
import Community from "@/models/community-model";
import User from "@/models/user-model";
import { auth } from "@/auth";

async function isAdmin() {
  const session = await auth();
  if (!session?.user?.email) return false;
  const user = await User.findOne({ email: session.user.email });
  return user?.role === "admin";
}

// ─── GET: List all communities ─────────────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    await connectDb();

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
        { communityName: regex },
        { topics: regex },
        { about: regex },
      ];
      // Also search by creator username (populated later)
    }

    const [communities, total] = await Promise.all([
      Community.find(filter)
        .populate("createdBy", "username email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Community.countDocuments(filter),
    ]);

    return NextResponse.json({
      success: true,
      data: communities,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("GET ADMIN COMMUNITIES ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}