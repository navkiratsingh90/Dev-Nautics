import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { getUserIdFromRequest } from '@/lib/auth';
import User from '@/models/user-model';
import Activity from '@/models/activity-model';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const userId = params.id; // For viewing another user's profile
    const user = await User.findById(userId).populate('connectedUsers', 'username email');
    const activities = await Activity.countDocuments({ createdBy: userId });

    if (!user) {
      return NextResponse.json({ msg: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user, totalActivities: activities });
  } catch (error) {
    console.error('getUserProfile:', error);
    return NextResponse.json({ msg: 'Failed to fetch profile' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await dbConnect();
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ msg: 'Unauthorized' }, { status: 401 });
    }

    const { about } = await req.json();
    const user = await User.findByIdAndUpdate(userId, { about }, { new: true });

    if (!user) {
      return NextResponse.json({ msg: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ msg: 'Profile updated', user });
  } catch (error) {
    console.error('updateUserProfile:', error);
    return NextResponse.json({ msg: 'Failed to update profile' }, { status: 500 });
  }
}