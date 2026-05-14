import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { getUserIdFromRequest } from '@/lib/auth';
import User from '@/models/user-model';

const validCategories = [
  'frontend', 'backend', 'tools', 'frameworks', 'libraries', 'languages'
];

export async function PUT(req: NextRequest) {
  try {
    await dbConnect();
    const userId = await getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ msg: 'Unauthorized' }, { status: 401 });

    const { category, skill, action } = await req.json();

    if (!validCategories.includes(category)) {
      return NextResponse.json({ success: false, message: 'Invalid skill category' }, { status: 400 });
    }

    if (!skill || !action) {
      return NextResponse.json({ success: false, message: 'Skill and action are required' }, { status: 400 });
    }

    let updateQuery;
    if (action === 'add') {
      updateQuery = { $addToSet: { [`skills.${category}`]: skill } };
    } else if (action === 'remove') {
      updateQuery = { $pull: { [`skills.${category}`]: skill } };
    } else {
      return NextResponse.json({ success: false, message: "Action must be 'add' or 'remove'" }, { status: 400 });
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateQuery, { new: true });
    if (!updatedUser) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Skill ${action}ed successfully`,
      skills: updatedUser.skills,
    });
  } catch (error) {
    console.error('Update Skills Error:', error);
    return NextResponse.json({ success: false, message: 'Server error while updating skills' }, { status: 500 });
  }
}