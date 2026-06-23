import { NextRequest, NextResponse } from "next/server";
import connectDb from "@/lib/db";
import Question from "@/models/question-model";
import UserProgress from "@/models/userProgress-model";
import Submission from "@/models/Submission"; // adjust path if needed
import submissionQueue from "@/queues/submissionQueue"; // adjust path
import { auth } from "@/auth";
import User from "@/models/user-model";

export async function POST(req: NextRequest) {
  try {
    await connectDb();

    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    const { questionId, sourceCode, language } = await req.json();
    if (!questionId || !sourceCode || !language) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    const today = new Date().toISOString().split("T")[0];

    const question = await Question.findById(questionId).select("+testCases");
    if (!question || question.type !== "coding") {
      return NextResponse.json(
        { success: false, message: "Invalid coding question" },
        { status: 400 }
      );
    }

    if (question.scheduledDate !== today) {
      return NextResponse.json(
        { success: false, message: "This is not today's question" },
        { status: 400 }
      );
    }

    let progress = await UserProgress.findOne({ user: user._id });
    if (!progress) {
      progress = await UserProgress.create({ user: user._id });
    }

    const alreadyAnswered = progress.attempts.some((a) => a.date === today);
    if (alreadyAnswered) {
      return NextResponse.json(
        { success: false, message: "You already submitted today's question" },
        { status: 400 }
      );
    }

    // Create submission record
    const submission = await Submission.create({
      user: user._id,
      challenge: questionId,
      sourceCode,
      language,
      status: "pending",
    });

    // Enqueue for processing
    await submissionQueue.add("daily-coding", {
      submissionId: submission._id.toString(),
      sourceCode,
      language,
      questionId,
      userId: user._id.toString(),
      streak: progress.currentStreak,
    });

    return NextResponse.json({
      success: true,
      message: "Code submitted and queued",
      submissionId: submission._id,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}