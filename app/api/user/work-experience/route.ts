import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { getUserIdFromRequest } from '@/lib/auth';
import User from '@/models/user-model';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const userId = await getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ msg: 'Unauthorized' }, { status: 401 });

    const { companyName, duration, role, description, location } = await req.json();
    const user = await User.findById(userId);
    if (!user) return NextResponse.json({ msg: 'User not found' }, { status: 404 });

    user.workExperience.push({ companyName, duration, role, description, location });
    await user.save();

    return NextResponse.json({ msg: 'Work experience added' });
  } catch (error) {
    console.error('addWorkExperience:', error);
    return NextResponse.json({ msg: 'Failed to add work experience' }, { status: 500 });
  }
}