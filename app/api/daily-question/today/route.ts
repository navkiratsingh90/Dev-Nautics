// app/api/daily-question/today/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDb from "@/lib/db";
import Question from "@/models/question-model";
import UserProgress from "@/models/userProgress-model";
import { getStreakMultiplier } from "@/lib/points-helper";
import { auth } from "@/auth";
import User from "@/models/user-model";

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

    const user = await User.findOne({
      email: session.user.email,
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    const today = new Date().toISOString().split("T")[0];

    const question = await Question.findOne({
      scheduledDate: today,
      isActive: true,
    });

    if (!question) {
      return NextResponse.json(
        { error: "No question scheduled for today" },
        { status: 404 }
      );
    }

    const progress = await UserProgress.findOne({ user: user._id });
    const alreadyAnswered = progress?.attempts.some((a) => a.date === today) || false;

    return NextResponse.json({
      question: {
        _id: question._id,
        title: question.title,
        description: question.description,
        type: question.type,
        difficulty: question.difficulty,
        basePoints: question.basePoints,
        penaltyPoints: question.penaltyPoints,
        options: question.options,       // null for coding/puzzle
        starterCode: question.starterCode,
        supportedLangs: question.supportedLangs,
        tags: question.tags,
      },
      alreadyAnswered,
      userStreak: progress?.currentStreak || 0,
      multiplier: getStreakMultiplier(progress?.currentStreak || 0),
      totalPoints: progress?.totalPoints || 0,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}