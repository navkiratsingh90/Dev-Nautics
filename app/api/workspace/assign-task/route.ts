import { NextRequest, NextResponse } from 'next/server';
// import dbConnect from '@/lib/dbConnect';
import Workspace from '@/models/workspace-model';
// import { getUserIdFromRequest } from '@/lib/auth';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    // const userId = await getUserIdFromRequest(req);
		const userId = 1
    const { description, priority, assignedTo } = await req.json();

    // Validate required fields
    if (!description || !priority || !assignedTo) {
      return NextResponse.json(
        { msg: 'All fields are required.' },
        { status: 400 }
      );
    }

    // Validate priority value
    const validPriorities = ['Low', 'Medium', 'High'];
    if (!validPriorities.includes(priority)) {
      return NextResponse.json(
        { msg: 'Invalid priority value.' },
        { status: 400 }
      );
    }

    // await dbConnect();

    const currProject = await Workspace.findById(projectId);
    if (!currProject) {
      return NextResponse.json(
        { msg: 'Project not found.' },
        { status: 404 }
      );
    }

    // Check if requester is leader
    if (currProject.leader.toString() !== userId.toString()) {
      return NextResponse.json(
        { msg: 'Only the leader can assign tasks.' },
        { status: 403 }
      );
    }

    // Check if assigned user is a project member
    const isMember = currProject.members.some(
      (ele: any) => ele.user.toString() === assignedTo.toString()
    );
    if (!isMember) {
      return NextResponse.json(
        { msg: 'Assigned user is not a member of this project.' },
        { status: 400 }
      );
    }

    // Create and push new task
    const task = { description, priority, assignedTo };
    currProject.tasks.push(task);
    await currProject.save();

    const latestTask = currProject.tasks[currProject.tasks.length - 1];

    return NextResponse.json(
      {
        msg: 'Task assigned successfully.',
        task: latestTask,
        totalTasks: currProject.tasks.length,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error assigning task:', error);
    return NextResponse.json(
      {
        msg: 'Internal Server Error. Could not assign task.',
        error: error.message,
      },
      { status: 500 }
    );
  }
}