import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { ProjectTracker } from '@/models/ProjectTracker';
import { getUserIdFromRequest } from '@/lib/auth';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string; taskId: string }> }
) {
  try {
    const { projectId, taskId } = await params;
    const userId = await getUserIdFromRequest(req);

    await dbConnect();

    const project = await ProjectTracker.findById(projectId);
    if (!project) {
      return NextResponse.json(
        { msg: 'Project not found' },
        { status: 404 }
      );
    }

    const task = project.tasks.id(taskId);
    if (!task) {
      return NextResponse.json(
        { msg: 'Task not found' },
        { status: 404 }
      );
    }

    if (task.assignedTo.toString() !== userId.toString()) {
      return NextResponse.json(
        { msg: 'You cannot modify others\' tasks' },
        { status: 403 }
      );
    }

    task.status = 'Completed';

    // Increment member’s completed tasks count
    const member = project.members.find(
      (m: any) => m.user.toString() === userId.toString()
    );
    if (member) {
      member.totalTasksCompleted = parseInt(member.totalTasksCompleted, 10) + 1;
    }

    await project.save();

    return NextResponse.json(
      { msg: 'Task marked as completed', task },
      { status: 200 }
    );
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { msg: 'Internal server error' },
      { status: 500 }
    );
  }
}