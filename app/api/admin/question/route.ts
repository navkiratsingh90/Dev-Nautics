import { NextRequest, NextResponse } from "next/server";
import connectDb from "@/lib/db";
import Question from "@/models/question-model";
import User from "@/models/user-model";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
  try {
    await connectDb();

    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const user = await User.findOne({
      email: session.user.email,
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    if (!user.isAdmin) {
      return NextResponse.json(
        {
          success: false,
          message: "Forbidden: Admin access required",
        },
        { status: 403 }
      );
    }

    const {
      category,
      question,
      image,
      options,
      correctOption,
      explanation,
      difficulty,
      tags,
      isActive,
      scheduledDate,
    } = await req.json();

    // Validate required fields
    if (!category || !question || !options || !correctOption) {
      return NextResponse.json(
        {
          success: false,
          message: "Category, question, options and correctOption are required",
        },
        { status: 400 }
      );
    }

    // Validate category
    const validCategories = [
      "aptitude",
      "cs_fundamental",
      "puzzle",
      "dsa",
      "pseudo",
    ];

    if (!validCategories.includes(category)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid category",
        },
        { status: 400 }
      );
    }

    // Validate options
    if (!Array.isArray(options) || options.length !== 4) {
      return NextResponse.json(
        {
          success: false,
          message: "Options must contain exactly 4 items",
        },
        { status: 400 }
      );
    }

    // Validate correct option
    if (!["A", "B", "C", "D"].includes(correctOption)) {
      return NextResponse.json(
        {
          success: false,
          message: "correctOption must be A, B, C or D",
        },
        { status: 400 }
      );
    }

    // Validate difficulty
    if (
      difficulty &&
      !["easy", "medium", "hard"].includes(difficulty)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid difficulty",
        },
        { status: 400 }
      );
    }

    const newQuestion = await Question.create({
      category,
      question,
      image: image || undefined,
      options,
      correctOption,
      explanation: explanation || undefined,
      difficulty: difficulty || "medium",
      tags: tags || [],
      isActive: isActive !== undefined ? isActive : true,
      scheduledDate: scheduledDate || undefined,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Question created successfully",
        data: newQuestion,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Create question error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to create question",
      },
      { status: 500 }
    );
  }
}