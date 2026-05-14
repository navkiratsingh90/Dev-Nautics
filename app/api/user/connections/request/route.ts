import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { dbConnect } from '@/lib/dbConnect';
import { getUserIdFromRequest } from '@/lib/auth';
import User from '@/models/user-model';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const userId = await getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ msg: 'Unauthorized' }, { status: 401 });

    const { targetUserId } = await req.json();
    if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
      return NextResponse.json({ msg: 'Invalid user ID' }, { status: 400 });
    }
    if (userId === targetUserId) {
      return NextResponse.json({ msg: 'Cannot connect with yourself' }, { status: 400 });
    }

    const [requester, target] = await Promise.all([
      User.findById(userId),
      User.findById(targetUserId)
    ]);

    if (!requester || !target) {
      return NextResponse.json({ msg: 'User not found' }, { status: 404 });
    }
    if (requester.connectedUsers.includes(targetUserId)) {
      return NextResponse.json({ msg: 'Already connected' }, { status: 409 });
    }

    if (!target.totalPendingRequests.includes(userId)) {
      target.totalPendingRequests.push(userId);
      await target.save();
    } else {
      target.totalPendingRequests.pull(userId);
      await target.save();
    }

    return NextResponse.json({ msg: 'Connection request sent', target });
  } catch (error) {
    console.error('sendConnectionRequest:', error);
    return NextResponse.json({ msg: 'Failed to send request' }, { status: 500 });
  }
}