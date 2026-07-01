import { NextRequest, NextResponse } from "next/server";
import connectDb from "@/lib/db";
import Question from "@/models/question-model";
import Submission from "@/models/submission-model";
import User from "@/models/user-model";
import { auth } from "@/auth";

// ─── POST: Submit an answer ─────────────────────────────────────────────
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

    const currentUser = await User.findOne({ email: session.user.email });
    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    const { questionId, selectedOption } = await req.json();
	console.log(questionId , selectedOption);
	
    if (!questionId || !selectedOption) {
      return NextResponse.json(
        { success: false, message: "Missing questionId or selectedOption" },
        { status: 400 }
      );
    }

    // Fetch the question
    const question = await Question.findById(questionId);
    if (!question) {
      return NextResponse.json(
        { success: false, message: "Question not found" },
        { status: 404 }
      );
    }

    // Check if already submitted
    const existing = await Submission.findOne({
      user: currentUser._id,
      question: questionId,
    });

    if (existing) {
      return NextResponse.json(
        { success: false, message: "Already submitted for this question" },
        { status: 400 }
      );
    }

    // Evaluate
    const isCorrect = question.correctOption === selectedOption;
    // const pointsEarned = isCorrect ? question.basePoints : 0; // penalty not applied for now, but you can add logic

    // Create submission
    const submission = await Submission.create({
      user: currentUser._id,
      question: questionId,
      selectedOption,
      isCorrect,
    //   pointsEarned,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Submission recorded",
        data: {
          isCorrect,
        //   pointsEarned,
          explanation: question.explanation,
          correctOption: question.correctOption,
          submission,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("SUBMISSION ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// ─── GET: Fetch user submissions (with optional filters) ───────────────
export async function GET(req: NextRequest) {
  try {
    await connectDb();

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

    const url = new URL(req.url);
    const category = url.searchParams.get("category") || "";
    const limit = parseInt(url.searchParams.get("limit") || "50");

    // Build filter
    const filter: any = { user: currentUser._id };
    if (category && category !== "all") {
      // We need to populate question and filter by category
      // We'll do it after population
    }

    let submissions = await Submission.find(filter)
      .populate("question")
      .sort({ submittedAt: -1 })
      .limit(limit)
      .lean();

    // If category filter is applied, filter after populate
    if (category && category !== "all") {
      submissions = submissions.filter((s: any) => s.question?.category === category);
    }

    // Calculate stats
    const total = submissions.length;
    const correct = submissions.filter((s: any) => s.isCorrect).length;
    const totalPoints = submissions.reduce((acc: number, s: any) => acc + (s.pointsEarned || 0), 0);

    return NextResponse.json({
      success: true,
      data: submissions,
      stats: {
        total,
        correct,
        incorrect: total - correct,
        accuracy: total > 0 ? Math.round((correct / total) * 100) : 0,
        totalPoints,
      },
    });
  } catch (error: any) {
    console.error("GET SUBMISSIONS ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}