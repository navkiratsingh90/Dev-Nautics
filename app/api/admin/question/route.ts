// app/api/admin/question/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDb from "@/lib/db";
import Question from "@/models/question-model";
import User from "@/models/user-model";
import { BASE_POINTS, PENALTY_POINTS } from "@/lib/points-helper";
import { auth } from "@/auth";

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

    // Check if user is admin – adjust based on your User model
    if (!user.isAdmin) {
      return NextResponse.json(
        { success: false, message: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    const {
      title,
      description,
      type,
      difficulty,
      scheduledDate,
      options,
      correctOption,
      testCases,
      starterCode,
      supportedLangs,
      correctAnswer,
      explanation,
      tags,
    } = await req.json();

    // Validate required fields
    if (!title || !description || !type || !difficulty || !scheduledDate) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate type-specific fields
    if (type === "mcq" && (!options || !correctOption)) {
      return NextResponse.json(
        { success: false, message: "MCQ requires options and correctOption" },
        { status: 400 }
      );
    }
    if (type === "coding" && !testCases) {
      return NextResponse.json(
        { success: false, message: "Coding questions require testCases" },
        { status: 400 }
      );
    }
    if ((type === "puzzle" || type === "cs_fundamental") && !correctAnswer) {
      return NextResponse.json(
        { success: false, message: "Puzzle/CS questions require correctAnswer" },
        { status: 400 }
      );
    }

    const question = await Question.create({
      title,
      description,
      type,
      difficulty,
      scheduledDate,
      basePoints: BASE_POINTS[difficulty],
      penaltyPoints: PENALTY_POINTS[difficulty],
      options: type === "mcq" ? options : undefined,
      correctOption: type === "mcq" ? correctOption : undefined,
      testCases: type === "coding" ? testCases : undefined,
      starterCode: type === "coding" ? starterCode : undefined,
      supportedLangs: type === "coding" ? (supportedLangs || ["python", "javascript", "cpp"]) : undefined,
      correctAnswer: (type === "puzzle" || type === "cs_fundamental") ? correctAnswer : undefined,
      explanation: (type === "puzzle" || type === "cs_fundamental") ? explanation : undefined,
      tags: tags || [],
    });

    return NextResponse.json({
      success: true,
      data: question,
    }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}