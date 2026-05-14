import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { getUserIdFromRequest } from '@/lib/auth';
import User from '@/models/user-model';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const userId = await getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ msg: 'Unauthorized' }, { status: 401 });

    const { requesterId } = await req.json();
    const [user, requester] = await Promise.all([
      User.findById(userId),
      User.findById(requesterId)
    ]);

    if (!user || !requester) {
      return NextResponse.json({ msg: 'User not found' }, { status: 404 });
    }

    user.totalPendingRequests = user.totalPendingRequests.filter(
      (id: any) => id.toString() !== requesterId
    );

    if (!user.connectedUsers.includes(requesterId)) {
      user.connectedUsers.push(requesterId);
    }
    if (!requester.connectedUsers.includes(userId)) {
      requester.connectedUsers.push(userId);
    }

    await Promise.all([user.save(), requester.save()]);
    return NextResponse.json({ msg: 'Connection approved' });
  } catch (error) {
    console.error('approveConnectionRequest:', error);
    return NextResponse.json({ msg: 'Failed to approve request' }, { status: 500 });
  }
}