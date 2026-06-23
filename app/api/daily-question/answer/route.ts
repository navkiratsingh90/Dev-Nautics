import { NextRequest, NextResponse } from "next/server";
import connectDb from "@/lib/db";
import Question from "@/models/question-model";
import UserProgress from "@/models/userProgress-model";
import { calculatePoints, updateStreak } from "@/lib/points-helper";
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

    const { questionId, answer } = await req.json();
    if (!questionId || answer === undefined) {
      return NextResponse.json(
        { success: false, message: "Missing questionId or answer" },
        { status: 400 }
      );
    }

    const today = new Date().toISOString().split("T")[0];

    const question = await Question.findById(questionId)
      .select("+correctOption +correctAnswer +explanation");

    if (!question) {
      return NextResponse.json(
        { success: false, message: "Question not found" },
        { status: 404 }
      );
    }

    if (question.type === "coding") {
      return NextResponse.json(
        { success: false, message: "Use /submit-code for coding questions" },
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
        { success: false, message: "You already answered today's question" },
        { status: 400 }
      );
    }

    // Check correctness
    let correct = false;
    if (question.type === "mcq") {
      correct = answer.trim().toUpperCase() === question.correctOption?.trim().toUpperCase();
    } else {
      // cs_fundamental or puzzle – case-insensitive trim
      correct = answer.trim().toLowerCase() === question.correctAnswer?.trim().toLowerCase();
    }

    // Update streak
    updateStreak(progress, today);

    // Calculate points
    const { points, multiplier, breakdown } = calculatePoints({
      difficulty: question.difficulty,
      correct,
      currentStreak: progress.currentStreak,
    });

    // Update progress
    progress.totalPoints = Math.max(0, progress.totalPoints + points);
    progress.totalAnswered += 1;
    if (correct) {
      progress.totalCorrect += 1;
    } else {
      progress.totalWrong += 1;
    }

    progress.stats[question.type].answered += 1;
    if (correct) {
      progress.stats[question.type].correct += 1;
    }

    progress.attempts.push({
      question: question._id,
      date: today,
      type: question.type,
      correct,
      pointsEarned: points,
      streakOnDay: progress.currentStreak,
    });

    await progress.save();

    return NextResponse.json({
      success: true,
      correct,
      points,
      breakdown,
      explanation: question.explanation || null,
      correctAnswer: question.correctOption || question.correctAnswer,
      totalPoints: progress.totalPoints,
      currentStreak: progress.currentStreak,
      multiplier,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}