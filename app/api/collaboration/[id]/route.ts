import { auth } from "@/auth";
import connectDb from "@/lib/db";
import Collaboration from "@/models/collaboration-model";
import User from "@/models/user-model";
import uploadToCloudinary from "@/lib/cloudinary";
import { NextRequest, NextResponse } from "next/server";

function parseList(value: FormDataEntryValue | string | null | undefined): string[] {
  if (!value) return [];
  const str = String(value).trim();
  if (!str) return [];
  try {
    const parsed = JSON.parse(str);
    if (Array.isArray(parsed)) return parsed.map(String).map((v) => v.trim()).filter(Boolean);
  } catch {}
  return str.split(",").map((v) => v.trim()).filter(Boolean);
}

async function getCurrentUser() {
  const session = await auth();
  if (!session?.user?.email) return null;
  return await User.findOne({ email: session.user.email }).select("_id username");
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDb();
    // console.log(id);
    const {id} = await params
    const project = await Collaboration.findById(id)
      .populate("createdBy", "username email")
      .populate("currentTeamMembers.user", "username email")
      .populate("pendingRequests", "username email");

    if (!project) {
      return NextResponse.json(
        { success: false, message: "Project not found" },
        { status: 404 }
      );
    }

    const spotsLeft = project.totalTeamSize - project.currentTeamMembers.length;

    return NextResponse.json(
      {
        success: true,
        data: project,
        spotsLeft,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("GET COLLABORATION ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDb();

    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }
    const {id} = await params
    const project = await Collaboration.findById(id);
    if (!project) {
      return NextResponse.json(
        { success: false, message: "Project not found" },
        { status: 404 }
      );
    }

    if (project.createdBy.toString() !== currentUser._id.toString()) {
      return NextResponse.json(
        { success: false, message: "Only the owner can update this project" },
        { status: 403 }
      );
    }

    const contentType = req.headers.get("content-type") || "";
    let body: any = {};

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      body = {
        title: formData.get("title"),
        description: formData.get("description"),
        status: formData.get("status"),
        problemStatement: formData.get("problemStatement"),
        category: formData.get("category"),
        futureScope: formData.get("futureScope"),
        rolesLookingFor: formData.get("rolesLookingFor"),
        techStackUsed: formData.get("techStackUsed"),
        totalTeamSize: formData.get("totalTeamSize"),
        tags: formData.get("tags"),
        deadline: formData.get("deadline"),
        file: formData.get("file"),
      };
    } else {
      body = await req.json();
    }

    if (body.title !== undefined) project.title = String(body.title).trim() || project.title;
    if (body.description !== undefined) project.description = String(body.description).trim();
    if (body.status !== undefined) project.status = String(body.status);
    if (body.problemStatement !== undefined) project.problemStatement = String(body.problemStatement).trim();
    if (body.category !== undefined) project.category = String(body.category).trim();
    if (body.futureScope !== undefined) project.futureScope = String(body.futureScope).trim();
    if (body.rolesLookingFor !== undefined) project.rolesLookingFor = parseList(body.rolesLookingFor);
    if (body.techStackUsed !== undefined) project.techStackUsed = parseList(body.techStackUsed);
    if (body.tags !== undefined) project.tags = parseList(body.tags);
    if (body.totalTeamSize !== undefined) project.totalTeamSize = Number(body.totalTeamSize);
    if (body.deadline !== undefined && String(body.deadline).trim()) project.deadline = new Date(String(body.deadline));

    if (body.file && body.file instanceof File && body.file.size > 0) {
      project.file = await uploadToCloudinary(body.file);
    }

    const updated = await project.save();

    return NextResponse.json(
      {
        success: true,
        message: "Project updated successfully",
        project: updated,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("UPDATE COLLABORATION ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDb();

    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }
    const {id} = await params
    const project = await Collaboration.findById(id);
    if (!project) {
      return NextResponse.json(
        { success: false, message: "Project not found" },
        { status: 404 }
      );
    }

    if (project.createdBy.toString() !== currentUser._id.toString()) {
      return NextResponse.json(
        { success: false, message: "Only the owner can delete this project" },
        { status: 403 }
      );
    }

    await Collaboration.findByIdAndDelete(id);

    return NextResponse.json(
      {
        success: true,
        message: "Project deleted successfully",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("DELETE COLLABORATION ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}