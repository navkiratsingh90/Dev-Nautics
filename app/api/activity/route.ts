// import { NextRequest, NextResponse } from "next/server";
// import dbConnect from "@/lib/db";
// import Activity from "@/models/activity";

// export const POST = async (req: NextRequest) => {
//   try {
//     // await dbConnect();

//     const body = await req.json();
//     const { description, tags, userId } = body;

//     if (!description) {
//       return NextResponse.json(
//         { success: false, message: "Description required" },
//         { status: 400 }
//       );
//     }

//     const activity = await Activity.create({
//       description,
//       tags,
//       createdBy: userId,
//     });

//     return NextResponse.json({ success: true, data: activity });
//   } catch (error: any) {
//     return NextResponse.json(
//       { success: false, message: error.message },
//       { status: 500 }
//     );
//   }
// };

// export const GET = async (req: NextRequest) => {
//   try {
//     await dbConnect();

//     const { searchParams } = new URL(req.url);

//     const page = Number(searchParams.get("page")) || 1;
//     const limit = Number(searchParams.get("limit")) || 10;

//     const skip = (page - 1) * limit;

//     const activities = await Activity.find()
//       .populate("createdBy", "name username")
//       .skip(skip)
//       .limit(limit);

//     return NextResponse.json({
//       success: true,
//       data: activities,
//     });
//   } catch (error: any) {
//     return NextResponse.json(
//       { success: false, message: error.message },
//       { status: 500 }
//     );
//   }
// };