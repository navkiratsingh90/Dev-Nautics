import { NextRequest, NextResponse } from "next/server";
import connectDb from "@/lib/db";
import UserProgress from "@/models/userProgress-model";
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

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    const progress = await UserProgress.findOne({ user: user._id })
      .populate("attempts.question", "title type difficulty");

    if (!progress) {
      return NextResponse.json({
        success: true,
        totalPoints: 0,
        currentStreak: 0,
        longestStreak: 0,
        totalAnswered: 0,
        totalCorrect: 0,
        totalWrong: 0,
        stats: {
          coding: { answered: 0, correct: 0 },
          mcq: { answered: 0, correct: 0 },
          cs_fundamental: { answered: 0, correct: 0 },
          puzzle: { answered: 0, correct: 0 },
        },
        attempts: [],
      });
    }

    return NextResponse.json({
      success: true,
      data: progress,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}