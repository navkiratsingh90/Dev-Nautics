import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { getUserIdFromRequest } from '@/lib/auth';
import User from '@/models/user-model';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const userId = await getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ msg: 'Unauthorized' }, { status: 401 });

    const user = await User.findById(userId).populate('totalPendingRequests');
    if (!user) return NextResponse.json({ msg: 'User not found' }, { status: 404 });

    return NextResponse.json({ pendingRequests: user.totalPendingRequests });
  } catch (error) {
    console.error('getPendingRequests:', error);
    return NextResponse.json({ msg: 'Failed to fetch pending requests' }, { status: 500 });
  }
}