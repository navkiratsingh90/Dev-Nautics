import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { getUserIdFromRequest } from '@/lib/auth';
import User from '@/models/user-model';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const userId = await getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ msg: 'Unauthorized' }, { status: 401 });

    const { schoolName, degree, duration, description } = await req.json();
    const user = await User.findById(userId);
    if (!user) return NextResponse.json({ msg: 'User not found' }, { status: 404 });

    user.education.push({ schoolName, degree, duration, description });
    await user.save();

    return NextResponse.json({ msg: 'Education added', education: user.education });
  } catch (error) {
    console.error('addEducation:', error);
    return NextResponse.json({ msg: 'Failed to add education' }, { status: 500 });
  }
}