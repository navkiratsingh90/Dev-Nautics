// import { NextRequest, NextResponse } from "next/server";
// import Activity from "@/models/activity";
// import dbConnect from "@/lib/db";
// import { getServerSession } from "next-auth"; // adjust to your auth setup
// import mongoose from "mongoose";

// // Helper for error responses
// const errorResponse = (message: string, status: number) =>
//   NextResponse.json({ success: false, message }, { status });

// export const POST = async (
//   req: NextRequest,
//   { params }: { params: { id: string } }
// ) => {
//   try {
//     // 1. Validate activity ID
//     if (!params.id || !mongoose.Types.ObjectId.isValid(params.id)) {
//       return errorResponse("Invalid activity ID", 400);
//     }

//     // 2. Parse and validate request body
//     const body = await req.json();
//     const { content } = body;

//     if (!content || typeof content !== "string" || content.trim().length === 0) {
//       return errorResponse("Comment content is required and must be non-empty", 400);
//     }

//     // Optional: limit comment length (e.g., 1000 chars)
//     if (content.length > 1000) {
//       return errorResponse("Comment too long (max 1000 characters)", 400);
//     }

//     // 3. Authenticate user (adjust to your auth method)
//     const session = await getServerSession();
//     if (!session?.user?.id) {
//       return errorResponse("Unauthorized", 401);
//     }
//     const userId = session.user.id;

//     // 4. Connect to database
//     await dbConnect();

//     // 5. Find the activity
//     const activity = await Activity.findById(params.id);
//     if (!activity) {
//       return errorResponse("Activity not found", 404);
//     }

//     // 6. Add the comment
//     activity.comments.push({
//       content: content.trim(),
//       createdBy: userId,
//       createdAt: new Date(),
//     });

//     await activity.save();

//     // 7. Return the updated activity with populated comment author info
//     const updatedActivity = await Activity.findById(params.id)
//       .populate("comments.createdBy", "name username avatar")
//       .lean();

//     return NextResponse.json({
//       success: true,
//       data: updatedActivity,
//       message: "Comment added successfully",
//     });
//   } catch (error: any) {
//     console.error("Error adding comment to activity:", error);
//     return errorResponse("Internal server error", 500);
//   }
// };