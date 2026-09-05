import { NextRequest, NextResponse } from "next/server";
import connectDb from "@/lib/db";
import Submission from "@/models/submission-model";
import User from "@/models/user-model";
import { auth } from "@/auth";

async function isAdmin() {
  const session = await auth();
  if (!session?.user?.email) return false;
  const user = await User.findOne({ email: session.user.email });
  return user?.role === "admin";
}

// ─── DELETE: Delete a submission ──────────────────────────────────────
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

    const submission = await Submission.findById(params.id);
    if (!submission) {
      return NextResponse.json(
        { success: false, message: "Submission not found." },
        { status: 404 }
      );
    }

    await submission.deleteOne();

    return NextResponse.json({
      success: true,
      message: "Submission deleted successfully.",
    });
  } catch (error: any) {
    console.error("DELETE SUBMISSION ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}