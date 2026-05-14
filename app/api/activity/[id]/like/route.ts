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

//     // 2. Authenticate user (get userId from session, not from request body)
//     const session = await getServerSession();
//     if (!session?.user?.id) {
//       return errorResponse("Unauthorized", 401);
//     }
//     const userId = session.user.id;

//     // 3. Connect to database
//     await dbConnect();

//     // 4. Use atomic update to toggle like (prevents race conditions)
//     const activity = await Activity.findById(params.id);
//     if (!activity) {
//       return errorResponse("Activity not found", 404);
//     }

//     const isLiked = activity.likes?.includes(userId);
//     let updatedActivity;

//     if (isLiked) {
//       // Unlike: remove userId from likes array
//       updatedActivity = await Activity.findByIdAndUpdate(
//         params.id,
//         { $pull: { likes: userId } },
//         { new: true }
//       );
//     } else {
//       // Like: add userId if not already present (atomic)
//       updatedActivity = await Activity.findByIdAndUpdate(
//         params.id,
//         { $addToSet: { likes: userId } },
//         { new: true }
//       );
//     }

//     // Optionally populate user info for response
//     const populatedActivity = await Activity.findById(params.id)
//       .populate("likes", "name username avatar")
//       .lean();

//     return NextResponse.json({
//       success: true,
//       data: {
//         liked: !isLiked, // new state
//         likesCount: populatedActivity?.likes?.length || 0,
//         activity: populatedActivity,
//       },
//     });
//   } catch (error: any) {
//     console.error("Error toggling like on activity:", error);
//     return errorResponse("Internal server error", 500);
//   }
// };