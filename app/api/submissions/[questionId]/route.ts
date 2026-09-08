import { NextRequest, NextResponse } from "next/server";
import connectDb from "@/lib/db";
import Submission from "@/models/submission-model";
import User from "@/models/user-model";
import { auth } from "@/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ questionId: string }> }
) {
  try {
    await connectDb();
    const {questionId} = await params
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const currentUser = await User.findOne({ email: session.user.email });
    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    const submission = await Submission.findOne({
      user: currentUser._id,
      question: questionId,
    });

    return NextResponse.json({
      success: true,
      submitted: !!submission,
      data: submission,
    });
  } catch (error: any) {
    console.error("CHECK SUBMISSION ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}