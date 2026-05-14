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

    if (!projectId) {
      return NextResponse.json(
        { msg: 'Project ID missing' },
        { status: 400 }
      );
    }

    await dbConnect();

    const currProject = await ProjectTracker.findById(projectId);
    if (!currProject) {
      return NextResponse.json(
        { msg: 'Project not found' },
        { status: 404 }
      );
    }

    const isMember = currProject.members.some(
      (ele: any) => ele.user.toString() === userId.toString()
    );
    if (!isMember) {
      return NextResponse.json(
        { msg: 'Access denied' },
        { status: 403 }
      );
    }

    // Filter user tasks
    const userTasks = currProject.tasks.filter(
      (task: any) => task.assignedTo.toString() === userId.toString()
    );

    let progressMeter = 0;
    let totalTimelinesCompleted = 0;

    for (const time of currProject.timeline) {
      if (time.completed) totalTimelinesCompleted++;
    }

    if (currProject.timeline.length > 0) {
      progressMeter = totalTimelinesCompleted / currProject.timeline.length;
    }

    return NextResponse.json(
      {
        message: 'Project fetched successfully',
        allTasks: userTasks,
        members: currProject.members,
        progressMeter,
        project: currProject,
      },
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

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const userId = await getUserIdFromRequest(req);

    if (!userId || !projectId) {
      return NextResponse.json(
        { msg: 'Invalid credentials' },
        { status: 400 }
      );
    }

    await dbConnect();

    const currProject = await ProjectTracker.findById(projectId);
    if (!currProject) {
      return NextResponse.json(
        { msg: 'Project not found' },
        { status: 404 }
      );
    }

    // Only leader can delete project
    if (currProject.leader.toString() !== userId.toString()) {
      return NextResponse.json(
        { msg: 'Only leader can delete project' },
        { status: 403 }
      );
    }

    await ProjectTracker.findByIdAndDelete(projectId);

    return NextResponse.json(
      { msg: 'Project deleted successfully', projectId },
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


export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const userId = await getUserIdFromRequest(req);
    const { githubLink, lastCommitMessage, timeline, status } = await req.json();

    await dbConnect();

    const project = await ProjectTracker.findById(projectId);
    if (!project) {
      return NextResponse.json(
        { msg: 'Project not found' },
        { status: 404 }
      );
    }

    if (project.leader.toString() !== userId.toString()) {
      return NextResponse.json(
        { msg: 'Only leader can update project' },
        { status: 403 }
      );
    }

    if (githubLink) project.githubLink = githubLink;
    if (lastCommitMessage) project.lastCommitMessage = lastCommitMessage;
    if (timeline) project.timeline = timeline;
    if (status) project.status = status;

    const updated = await project.save();

    return NextResponse.json(
      { msg: 'Project updated', project: updated },
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