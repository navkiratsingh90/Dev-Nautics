import { NextRequest, NextResponse } from "next/server";
import connectDb from "@/lib/db";
import Collaboration from "@/models/collaboration-model";
import User from "@/models/user-model";
import { auth } from "@/auth";

async function isAdmin() {
  const session = await auth();
  if (!session?.user?.email) return false;
  const user = await User.findOne({ email: session.user.email });
  return user?.role === "admin";
}

// ─── DELETE: Delete a collaboration ──────────────────────────────────
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

    const collaboration = await Collaboration.findById(params.id);
    if (!collaboration) {
      return NextResponse.json(
        { success: false, message: "Collaboration not found." },
        { status: 404 }
      );
    }

    await collaboration.deleteOne();

    return NextResponse.json({
      success: true,
      message: "Collaboration deleted successfully.",
    });
  } catch (error: any) {
    console.error("DELETE COLLABORATION ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}