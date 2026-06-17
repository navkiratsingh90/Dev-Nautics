import { auth } from "@/auth";
import connectDb from "@/lib/db";
import User from "@/models/user-model";
import { NextRequest, NextResponse } from "next/server";

interface Params {
  params: Promise<{
    certificationId: string;
  }>;
}

export async function DELETE(
  req: NextRequest,
  { params }: Params
) {
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

    const { certificationId } = await params;

    user.certifications = user.certifications.filter(
      (cert: any) =>
        cert._id.toString() !== certificationId
    );

    await user.save();

    return NextResponse.json(
      {
        success: true,
        message: "Certification deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE CERTIFICATION ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      { status: 500 }
    );
  }
}