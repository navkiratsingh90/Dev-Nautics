import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { getUserIdFromRequest } from '@/lib/auth';
import User from '@/models/user-model';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const userId = await getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ msg: 'Unauthorized' }, { status: 401 });

    const { targetUserId } = await req.json();
    const [user, target] = await Promise.all([
      User.findById(userId),
      User.findById(targetUserId)
    ]);

    if (!user || !target) {
      return NextResponse.json({ msg: 'User not found' }, { status: 404 });
    }

    user.connectedUsers = user.connectedUsers.filter(
      (id: any) => id.toString() !== targetUserId
    );
    target.connectedUsers = target.connectedUsers.filter(
      (id: any) => id.toString() !== userId
    );

    await Promise.all([user.save(), target.save()]);
    return NextResponse.json({ msg: 'Connection removed' });
  } catch (error) {
    console.error('removeConnection:', error);
    return NextResponse.json({ msg: 'Failed to remove connection' }, { status: 500 });
  }
}