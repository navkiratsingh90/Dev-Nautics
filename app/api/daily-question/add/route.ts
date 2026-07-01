import { NextRequest, NextResponse } from "next/server";
import connectDb from "@/lib/db";
import Question from "@/models/question-model";
import { auth } from "@/auth";
import User from "@/models/user-model";

// ─── GET: Fetch questions (public) ─────────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    await connectDb();

    const url = new URL(req.url);
    const category = url.searchParams.get("category") || "";
    const limit = parseInt(url.searchParams.get("limit") || "50");

    const filter: any = { isActive: true };
    if (category && category !== "all") {
      filter.category = category;
    }

    const questions = await Question.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return NextResponse.json({
      success: true,
      data: questions,
    });
  } catch (error: any) {
    console.error("GET QUESTIONS ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// ─── POST: Create a new question (admin only) ──────────────────────
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
    if (!currentUser || currentUser.username !== "navkirat1") {
      return NextResponse.json(
        { success: false, message: "Admin access required" },
        { status: 403 }
      );
    }

    const body = await req.json();

    const {
      category,
      question,
      image,
      options,
      correctOption,
      explanation,
      difficulty,
      tags,
      scheduledDate,
    } = body;
	console.log(body);
	
    // Validation	
    if (!category || !question || !options || options.length !== 4 || !correctOption) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    const newQuestion = await Question.create({
      category,
      question,
      image,
      options,
      correctOption,
      explanation,
      difficulty: difficulty || "medium",
      tags: tags || [],
      isActive: true,
      scheduledDate,
    });

    return NextResponse.json({
      success: true,
      message: "Question created successfully",
      data: newQuestion,
    }, { status: 201 });
  } catch (error: any) {
    console.error("CREATE QUESTION ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}