// app/api/projects/route.ts
import Workspace from '@/models/workspace-model';
import { NextRequest, NextResponse } from 'next/server';
// import dbConnect from '@/lib/dbConnect';     // Your DB connection utility


export async function POST(req: NextRequest) {
  try {
    // 1. Parse request body
    const body = await req.json();
    const {
      title,
      description,
      timeline,
      leader,
      members,
      githubLink,
      status,
    } = body;

    // 2. Validate required fields
    if (!title || !description || !timeline || !leader || !status || !githubLink) {
      return NextResponse.json(
        { msg: 'Missing required fields. Please provide all necessary details.' },
        { status: 400 }
      );
    }

    // 3. Ensure database connection (if using Mongoose)
    // await dbConnect();

    // 4. Create new project in DB
    const newProject = await Workspace.create({
      title,
      description,
      timeline,
      leader,
      members: members || [], // Provide default if optional
      githubLink,
      status,
    });

    // 5. Return success response
    return NextResponse.json(
      { msg: 'Project created successfully!', project: newProject },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      {
        msg: 'Internal Server Error. Could not create project.',
        error: error.message,
      },
      { status: 500 }
    );
  }
}