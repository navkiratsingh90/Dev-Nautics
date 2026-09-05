import { NextRequest, NextResponse } from "next/server";
import connectDb from "@/lib/db";
import Submission from "@/models/submission-model";
import User from "@/models/user-model";
import { auth } from "@/auth";

async function isAdmin() {
  const session = await auth();
  if (!session?.user?.email) return false;
  const user = await User.findOne({ email: session.user.email });
  return user?.role === "admin";
}

// ─── GET: List all submissions ─────────────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    await connectDb();

    // if (!(await isAdmin())) {
    //   return NextResponse.json(
    //     { success: false, message: "Unauthorized. Admin access required." },
    //     { status: 403 }
    //   );
    // }

    const url = new URL(req.url);
    const search = url.searchParams.get("search") || "";
    const resultFilter = url.searchParams.get("result") || "all"; // all, correct, incorrect
    const page = Math.max(1, Number(url.searchParams.get("page") || 1));
    const limit = Math.min(50, Number(url.searchParams.get("limit") || 20));
    const skip = (page - 1) * limit;

    // Build filter
    const filter: any = {};

    if (resultFilter === "correct") filter.isCorrect = true;
    else if (resultFilter === "incorrect") filter.isCorrect = false;

    // For search, we need to join with User and Question collections
    // We'll fetch all submissions then filter in memory (simpler for search across populated fields)
    // For better performance, you could use aggregation with $lookup, but for simplicity we'll do two-step.

    const allSubmissions = await Submission.find(filter)
      .populate("user", "username email")
      .populate("question", "title")
      .sort({ submittedAt: -1 })
      .lean();

    // Apply search filter (by username or question title)
    let filtered = allSubmissions;
    if (search) {
      const regex = new RegExp(search, "i");
      filtered = allSubmissions.filter((s) => {
        const username = (s.user as any)?.username || "";
        const questionTitle = (s.question as any)?.title || "";
        return regex.test(username) || regex.test(questionTitle);
      });
    }

    // Paginate
    const total = filtered.length;
    const paginated = filtered.slice(skip, skip + limit);

    return NextResponse.json({
      success: true,
      data: paginated,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("GET ADMIN SUBMISSIONS ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}