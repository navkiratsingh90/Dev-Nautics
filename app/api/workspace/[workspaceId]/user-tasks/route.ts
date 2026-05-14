import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { ProjectTracker } from '@/models/ProjectTracker';
import { getUserIdFromRequest } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const userId = await getUserIdFromRequest(req);

    if (!userId) {
      return NextResponse.json(
        { msg: 'User ID missing.' },
        { status: 400 }
      );
    }

    await dbConnect();

    const currProject = await ProjectTracker.findById(projectId);
    if (!currProject) {
      return NextResponse.json(
        { msg: 'Project not found.' },
        { status: 404 }
      );
    }

    // Check if user is part of the project
    const isMember = currProject.members.some(
      (ele: any) => ele.user.toString() === userId.toString()
    );
    if (!isMember && currProject.leader.toString() !== userId.toString()) {
      return NextResponse.json(
        {
          msg: 'Access denied. You are not a member or leader of this project.',
        },
        { status: 403 }
      );
    }

    // Filter user's tasks
    const userTasks = currProject.tasks.filter(
      (task: any) => task.assignedTo.toString() === userId.toString()
    );

    return NextResponse.json(
      {
        msg: 'Tasks fetched successfully.',
        totalTasks: userTasks.length,
        tasks: userTasks,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error fetching user tasks:', error);
    return NextResponse.json(
      {
        msg: 'Internal Server Error. Could not fetch tasks.',
        error: error.message,
      },
      { status: 500 }
    );
  }
}