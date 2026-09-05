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

export async function GET(req: NextRequest) {
  try {
    await connectDb();

    // // if (!(await isAdm/in())) {
    //   return NextResponse.json(
    //     { success: false, message: "Unauthorized. Admin access required." },
    //     { status: 403 }
    //   );
    // }
	
    // ── Last 7 days (UTC) ──────────────────────────────────────────
    const endDate = new Date();
    endDate.setUTCHours(23, 59, 59, 999);
    const startDate = new Date();
    startDate.setUTCDate(startDate.getUTCDate() - 6);
    startDate.setUTCHours(0, 0, 0, 0);

    // ── Detect which date field exists ────────────────────────────
    const sample = await Submission.findOne().lean();
    const dateField = sample?.submittedAt ? "submittedAt" : "createdAt";

    // ── Aggregate submissions per day ──────────────────────────────
    const dailySubmissions = await Submission.aggregate([
      {
        $match: {
          [dateField]: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: `$${dateField}`, timezone: "UTC" } },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.date": 1 },
      },
    ]);

    // ── Build date → count map ──────────────────────────────────────
    const dateMap: Record<string, number> = {};
    dailySubmissions.forEach((item) => {
      dateMap[item._id.date] = item.count;
    });

    // ── Fill last 7 days ────────────────────────────────────────────
    const result = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startDate);
      d.setUTCDate(startDate.getUTCDate() + i);
      const key = d.toISOString().split("T")[0];
      result.push({
        date: d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" }),
        count: dateMap[key] || 0,
      });
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error("DAILY SUBMISSIONS ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}