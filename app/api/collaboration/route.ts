import { auth } from "@/auth";
import connectDb from "@/lib/db";
import Collaboration from "@/models/collaboration-model";
import User from "@/models/user-model";
import uploadToCloudinary from "@/lib/cloudinary";
import { NextRequest, NextResponse } from "next/server";

const ALLOWED_STATUS = ["Open", "In Progress", "On Hold", "Completed", "Closed"];

function parseList(value: FormDataEntryValue | string | null | undefined): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.map(String).map((v) => v.trim()).filter(Boolean);

  const str = String(value).trim();
  if (!str) return [];

  try {
    const parsed = JSON.parse(str);
    if (Array.isArray(parsed)) return parsed.map(String).map((v) => v.trim()).filter(Boolean);
  } catch {}

  return str.split(",").map((v) => v.trim()).filter(Boolean);
}

export async function GET(req: NextRequest) {
  try {
    await connectDb();

    const url = new URL(req.url);
    const search = url.searchParams.get("search") || "";
    const category = url.searchParams.get("category") || "";
    const status = url.searchParams.get("status") || "";
    const role = url.searchParams.get("role") || "";
    const sort = url.searchParams.get("sort") || "createdAt";
    const order = url.searchParams.get("order") || "desc";
    const page = Math.max(1, Number(url.searchParams.get("page") || 1));
    const limit = Math.max(1, Number(url.searchParams.get("limit") || 10));
    const skip = (page - 1) * limit;

    const query: any = {};

    if (category && category !== "All") query.category = category;
    if (status && status !== "All") query.status = status;

    if (role && role !== "All Roles") {
      query.rolesLookingFor = { $in: [role] };
    }

    if (search.trim()) {
      const rx = new RegExp(search.trim(), "i");
      query.$or = [
        { title: rx },
        { description: rx },
        { problemStatement: rx },
        { futureScope: rx },
        { category: rx },
        { tags: rx },
        { techStackUsed: rx },
        { rolesLookingFor: rx },
      ];
    }

    const sortOrder = order === "asc" ? 1 : -1;
    const collaborations = await Collaboration.find(query)
      .sort({ [sort]: sortOrder })
      .skip(skip)
      .limit(limit)
      .populate("createdBy", "username email")
      .populate("currentTeamMembers.user", "username email");

    const total = await Collaboration.countDocuments(query);

    return NextResponse.json(
      {
        success: true,
        data: collaborations,
        pagination: {
          total,
          totalPages: Math.ceil(total / limit),
          currentPage: page,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("GET COLLABORATIONS ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

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

    const currentUser = await User.findOne({ email: session.user.email }).select("_id username");
    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    const formData = await req.formData();

    const title = String(formData.get("title") || "").trim();
    const description = String(formData.get("description") || "").trim();
    const category = String(formData.get("category") || "").trim();
    const problemStatement = String(formData.get("problemStatement") || "").trim();
    const futureScope = String(formData.get("futureScope") || "").trim();
    const status = String(formData.get("status") || "Open").trim();
    const totalTeamSize = Number(formData.get("totalTeamSize") || 0);
    const deadlineRaw = String(formData.get("deadline") || "").trim();
    const file = formData.get("file") as File | null;

    const rolesLookingFor = parseList(formData.get("rolesLookingFor"));
    const techStackUsed = parseList(formData.get("techStackUsed"));
    const tags = parseList(formData.get("tags"));

    if (!title || !description || !category || !rolesLookingFor.length || !techStackUsed.length || !totalTeamSize) {
      return NextResponse.json(
        {
          success: false,
          message:
            "title, description, category, rolesLookingFor, techStackUsed, and totalTeamSize are required",
        },
        { status: 400 }
      );
    }

    if (!ALLOWED_STATUS.includes(status)) {
      return NextResponse.json(
        { success: false, message: "Invalid status" },
        { status: 400 }
      );
    }

    if (!file || file.size === 0) {
      return NextResponse.json(
        { success: false, message: "Cover image is required" },
        { status: 400 }
      );
    }

    const fileUrl = await uploadToCloudinary(file);

    const created = await Collaboration.create({
      title,
      file: fileUrl,
      description,
      status,
      problemStatement,
      category,
      futureScope,
      rolesLookingFor,
      techStackUsed,
      totalTeamSize,
      currentTeamMembers: [
        {
          user: currentUser._id,
          roleAssigned: "Project Owner",
        },
      ],
      createdBy: currentUser._id,
      pendingRequests: [],
      tags,
      deadline: deadlineRaw ? new Date(deadlineRaw) : undefined,
    });

    const populated = await Collaboration.findById(created._id)
      .populate("createdBy", "username email")
      .populate("currentTeamMembers.user", "username email");

    return NextResponse.json(
      {
        success: true,
        message: "Collaboration created successfully",
        project: populated,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("CREATE COLLABORATION ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}