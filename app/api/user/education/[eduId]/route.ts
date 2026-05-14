import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { getUserIdFromRequest } from '@/lib/auth';
import User from '@/models/user-model';

export async function DELETE(
  req: NextRequest,
  { params }: { params: { eduId: string } }
) {
  try {
    await dbConnect();
    const userId = await getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ msg: 'Unauthorized' }, { status: 401 });

    const user = await User.findById(userId);
    if (!user) return NextResponse.json({ msg: 'User not found' }, { status: 404 });

    user.education = user.education.filter(
      (edu: any) => edu._id.toString() !== params.eduId
    );
    await user.save();

    return NextResponse.json({ msg: 'Education removed' });
  } catch (error) {
    console.error('deleteEducation:', error);
    return NextResponse.json({ msg: 'Failed to delete education' }, { status: 500 });
  }
}