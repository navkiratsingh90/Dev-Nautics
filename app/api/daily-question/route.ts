// app/api/daily-question/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDb from "@/lib/db";
import Question from "@/models/question-model"; // use @ alias (recommended)
// OR if @ alias is not set, use relative: import Question from "../../../models/Question";

export async function GET(req: NextRequest) {
  try {
    await connectDb();

    const url = new URL(req.url);
    const category = url.searchParams.get("category") || "";
    const scheduled = url.searchParams.get("scheduled") === "true";
    const limit = parseInt(url.searchParams.get("limit") || "50");

    const filter: any = { isActive: true };

    if (scheduled) {
      const today = new Date().toISOString().split("T")[0];
      filter.scheduledDate = today;
    }

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