// import { NextRequest, NextResponse } from "next/server";
// import dbConnect from "@/lib/db";
// import Activity from "@/models/Activity";
// import mongoose from "mongoose";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/lib/auth";

// const errorResponse = (message: string, status: number) =>
//   NextResponse.json({ success: false, message }, { status });

// /* ================= GET ================= */
// export async function GET(
//   req: NextRequest,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     if (!mongoose.Types.ObjectId.isValid(params.id)) {
//       return errorResponse("Invalid ID", 400);
//     }

//     await dbConnect();

//     const session = await getServerSession(authOptions);
//     if (!session?.user) return errorResponse("Unauthorized", 401);

//     const activity = await Activity.findById(params.id)
//       .populate("createdBy", "username email")
//       .lean();

//     if (!activity) return errorResponse("Not found", 404);

//     return NextResponse.json({ success: true, data: activity });
//   } catch (error) {
//     console.error(error);
//     return errorResponse("Server error", 500);
//   }
// }

// /* ================= DELETE ================= */
// export async function DELETE(
//   req: NextRequest,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     if (!mongoose.Types.ObjectId.isValid(params.id)) {
//       return errorResponse("Invalid ID", 400);
//     }

//     await dbConnect();

//     const session = await getServerSession(authOptions);
//     if (!session?.user) return errorResponse("Unauthorized", 401);

//     const activity = await Activity.findById(params.id);
//     if (!activity) return errorResponse("Not found", 404);

//     const isCreator =
//       activity.createdBy.toString() === session.user.id;
//     const isAdmin = session.user.role === "admin";

//     if (!isCreator && !isAdmin) {
//       return errorResponse("Forbidden", 403);
//     }

//     await Activity.findByIdAndDelete(params.id);

//     return NextResponse.json({
//       success: true,
//       message: "Deleted successfully",
//     });
//   } catch (error) {
//     console.error(error);
//     return errorResponse("Server error", 500);
//   }
// }

// /* ================= PUT ================= */
// export async function PUT(
//   req: NextRequest,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     if (!mongoose.Types.ObjectId.isValid(params.id)) {
//       return errorResponse("Invalid ID", 400);
//     }

//     await dbConnect();

//     const session = await getServerSession(authOptions);
//     if (!session?.user) return errorResponse("Unauthorized", 401);

//     const body = await req.json();

//     const activity = await Activity.findById(params.id);
//     if (!activity) return errorResponse("Not found", 404);

//     if (activity.createdBy.toString() !== session.user.id) {
//       return errorResponse("Forbidden", 403);
//     }

//     const updateData: any = {};
//     if (body.title !== undefined) updateData.title = body.title;
//     if (body.description !== undefined) updateData.description = body.description;
//     if (body.type !== undefined) updateData.type = body.type;
//     if (body.metadata !== undefined) updateData.metadata = body.metadata;

//     const updated = await Activity.findByIdAndUpdate(
//       params.id,
//       updateData,
//       { new: true, runValidators: true }
//     ).populate("createdBy", "username email");

//     return NextResponse.json({ success: true, data: updated });
//   } catch (error) {
//     console.error(error);
//     return errorResponse("Server error", 500);
//   }
// }