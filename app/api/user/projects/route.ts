import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { getUserIdFromRequest } from '@/lib/auth';
import User from '@/models/user-model';
import cloudinary, { getDataUri } from '@/lib/cloudinary';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const userId = await getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ msg: 'Unauthorized' }, { status: 401 });

    const formData = await req.formData();
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const techStack = JSON.parse(formData.get('techStack') as string || '[]');
    const role = formData.get('role') as string;
    const duration = formData.get('duration') as string;
    const githubLink = formData.get('githubLink') as string;
    const liveLink = formData.get('liveLink') as string;
    const file = formData.get('file') as File | null;

    if (!title) {
      return NextResponse.json({ success: false, message: 'Project title is required' }, { status: 400 });
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    let uploadedFileUrl = '';
    if (file) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const fileUri = getDataUri(buffer, file.name);
      const uploadRes = await cloudinary.uploader.upload(fileUri.content);
      uploadedFileUrl = uploadRes.secure_url;
    }

    user.projects.push({
      title,
      description,
      file: uploadedFileUrl,
      techStack,
      role,
      duration,
      githubLink,
      liveLink,
    });

    await user.save();

    return NextResponse.json({
      success: true,
      message: 'Project added successfully 🚀',
      projects: user.projects,
    });
  } catch (error) {
    console.error('addProject:', error);
    return NextResponse.json({ success: false, message: 'Failed to add project' }, { status: 500 });
  }
}