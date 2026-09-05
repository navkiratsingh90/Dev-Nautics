import { NextRequest, NextResponse } from "next/server";
import connectDb from "@/lib/db";
import Workspace from "@/models/workspace-model";
import User from "@/models/user-model";
import { auth } from "@/auth";

async function isAdmin() {
  const session = await auth();
  if (!session?.user?.email) return false;
  const user = await User.findOne({ email: session.user.email });
  return user?.role === "admin";
}

// ─── DELETE: Delete a workspace ──────────────────────────────────────
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

    const workspace = await Workspace.findById(params.id);
    if (!workspace) {
      return NextResponse.json(
        { success: false, message: "Workspace not found." },
        { status: 404 }
      );
    }

    // Optional: cascade delete related tasks, members, etc. if needed
    // For now, just delete the workspace

    await workspace.deleteOne();

    return NextResponse.json({
      success: true,
      message: "Workspace deleted successfully.",
    });
  } catch (error: any) {
    console.error("DELETE WORKSPACE ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}