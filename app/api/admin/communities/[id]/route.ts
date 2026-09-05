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

// ─── DELETE: Delete a community ──────────────────────────────────────
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDb();

    if (!(await isAdmin())) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

    const community = await Community.findById(params.id);
    if (!community) {
      return NextResponse.json(
        { success: false, message: "Community not found." },
        { status: 404 }
      );
    }

    await community.deleteOne();

    return NextResponse.json({
      success: true,
      message: "Community deleted successfully.",
    });
  } catch (error: any) {
    console.error("DELETE COMMUNITY ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}