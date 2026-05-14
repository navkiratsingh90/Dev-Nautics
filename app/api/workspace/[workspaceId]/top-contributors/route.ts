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

    await dbConnect();

    const project = await ProjectTracker.findById(projectId).populate(
      'members.user'
    );
    if (!project) {
      return NextResponse.json(
        { msg: 'Project not found' },
        { status: 404 }
      );
    }

    const sortedMembers = [...project.members].sort(
      (a: any, b: any) => b.totalTasksCompleted - a.totalTasksCompleted
    );

    return NextResponse.json(
      {
        msg: 'Top contributors fetched',
        contributors: sortedMembers.slice(0, 5), // top 5
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