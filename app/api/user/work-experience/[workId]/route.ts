import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { getUserIdFromRequest } from '@/lib/auth';
import User from '@/models/user-model';

export async function DELETE(
  req: NextRequest,
  { params }: { params: { workId: string } }
) {
  try {
    await dbConnect();
    const userId = await getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ msg: 'Unauthorized' }, { status: 401 });

    const user = await User.findById(userId);
    if (!user) return NextResponse.json({ msg: 'User not found' }, { status: 404 });

    user.workExperience = user.workExperience.filter(
      (work: any) => work._id.toString() !== params.workId
    );
    await user.save();

    return NextResponse.json({ msg: 'Work experience removed' });
  } catch (error) {
    console.error('deleteWorkExperience:', error);
    return NextResponse.json({ msg: 'Failed to delete work experience' }, { status: 500 });
  }
}