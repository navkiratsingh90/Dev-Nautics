import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { ProjectTracker } from '@/models/ProjectTracker';
import { getUserIdFromRequest } from '@/lib/auth';

/**
 * PATCH /api/projects/:projectId/members
 * 
 * Request body can be:
 * 1. { memberId: string, role?: string } -> toggles that single member
 *    (adds with given role, or removes if already exists)
 * 2. { add: Array<{ user: string, role?: string }>, remove: string[] } -> bulk add & remove
 * 
 * Only the project leader can modify members.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const userId = await getUserIdFromRequest(req);
    const body = await req.json();

    if (!projectId) {
      return NextResponse.json(
        { msg: 'Project ID is required.' },
        { status: 400 }
      );
    }

    await dbConnect();

    const project = await ProjectTracker.findById(projectId);
    if (!project) {
      return NextResponse.json(
        { msg: 'Project not found.' },
        { status: 404 }
      );
    }

    // Authorization: only leader can modify members
    if (project.leader.toString() !== userId.toString()) {
      return NextResponse.json(
        { msg: 'Only the project leader can modify members.' },
        { status: 403 }
      );
    }

    // --- Case 1: Toggle a single member ---
    if (body.memberId) {
      const memberId = body.memberId.toString();
      const role = body.role || 'member'; // default role
      const existingIndex = project.members.findIndex(
        (m: any) => m.user.toString() === memberId
      );

      if (existingIndex === -1) {
        // Add member with specified role
        project.members.push({
          user: memberId,
          role: role,
          totalTasksCompleted: 0,
        });
        await project.save();
        return NextResponse.json(
          { msg: 'Member added successfully.', project },
          { status: 200 }
        );
      } else {
        // Remove member
        project.members.splice(existingIndex, 1);
        // Also remove their assigned tasks
        project.tasks = project.tasks.filter(
          (task: any) => task.assignedTo.toString() !== memberId
        );
        await project.save();
        return NextResponse.json(
          { msg: 'Member removed successfully.', project },
          { status: 200 }
        );
      }
    }

    // --- Case 2: Bulk add & remove ---
    const { add = [], remove = [] } = body;

    if (add.length === 0 && remove.length === 0) {
      return NextResponse.json(
        { msg: 'Please provide members to add or remove.' },
        { status: 400 }
      );
    }

    if (!Array.isArray(add) || !Array.isArray(remove)) {
      return NextResponse.json(
        { msg: 'Invalid request format. "add" and "remove" must be arrays.' },
        { status: 400 }
      );
    }

    // Check duplicates in add list
    const addUserIds = add.map((m: any) => m.user?.toString()).filter(Boolean);
    if (new Set(addUserIds).size !== addUserIds.length) {
      return NextResponse.json(
        { msg: 'Duplicate users found in add list.' },
        { status: 400 }
      );
    }

    // Check if any to-add already exists
    for (const memberToAdd of add) {
      const alreadyExists = project.members.some(
        (m: any) => m.user.toString() === memberToAdd.user.toString()
      );
      if (alreadyExists) {
        return NextResponse.json(
          { msg: `User ${memberToAdd.user} already exists in this team.` },
          { status: 400 }
        );
      }
    }

    // Check if any to-remove actually exists
    for (const memberIdToRemove of remove) {
      const exists = project.members.some(
        (m: any) => m.user.toString() === memberIdToRemove.toString()
      );
      if (!exists) {
        return NextResponse.json(
          { msg: `Member ${memberIdToRemove} not found in this project.` },
          { status: 400 }
        );
      }
    }

    // Perform bulk add
    for (const member of add) {
      project.members.push({
        user: member.user,
        role: member.role || 'member',
        totalTasksCompleted: 0,
      });
    }

    // Perform bulk remove
    project.members = project.members.filter(
      (m: any) => !remove.includes(m.user.toString())
    );

    // Remove tasks assigned to removed members
    project.tasks = project.tasks.filter(
      (task: any) => !remove.includes(task.assignedTo.toString())
    );

    await project.save();

    return NextResponse.json(
      { msg: 'Members updated successfully.', project },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error modifying members:', error);
    return NextResponse.json(
      {
        msg: 'Internal Server Error. Could not modify members.',
        error: error.message,
      },
      { status: 500 }
    );
  }
}