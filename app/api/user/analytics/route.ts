import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { getUserIdFromRequest } from '@/lib/auth';
import User from '@/models/user-model';
import Activity from '@/models/activity-model';
import Challenge from '@/models/challenge-model';
import Discussion from '@/models/discussion-model';
import ProjectFlow from '@/models/project-flow-model'; // Adjust model name

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const userId = await getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ msg: 'Unauthorized' }, { status: 401 });

    const user = await User.findById(userId)
      .populate('activityPosted')
      .populate('challengesAttended')
      .populate('activeProjects')
      .populate('connectedUsers')
      .lean();

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Activities
    const totalActivities = await Activity.countDocuments({ createdBy: userId });
    const totalLikesReceived = await Activity.aggregate([
      { $match: { createdBy: user._id } },
      { $project: { totalLikes: { $size: '$likes' } } },
      { $group: { _id: null, likes: { $sum: '$totalLikes' } } },
    ]);
    const totalCommentsReceived = await Activity.aggregate([
      { $match: { createdBy: user._id } },
      { $project: { totalComments: { $size: '$comments' } } },
      { $group: { _id: null, comments: { $sum: '$totalComments' } } },
    ]);

    // Challenges
    const totalChallenges = await Challenge.countDocuments({ 'leaderboard.userId': userId });
    const totalSolvedChallenges = await Challenge.countDocuments({ successfulSubmissions: userId });

    // Projects
    const activeProjects = await ProjectFlow.find({ 'members.user': userId });
    let totalTasksAssigned = 0;
    let completedTasks = 0;
    activeProjects.forEach(project => {
      totalTasksAssigned += project.tasks.filter(
        (t: any) => t.assignedTo?.toString() === userId.toString()
      ).length;
      completedTasks += project.tasks.filter(
        (t: any) =>
          t.assignedTo?.toString() === userId.toString() && t.status === 'Completed'
      ).length;
    });

    // Discussions
    const totalDiscussionsJoined = await Discussion.countDocuments({ joinedMembers: userId });
    const totalPendingDiscussionRequests = await Discussion.countDocuments({ 'pendingRequests.username': userId });

    // Timeline data
    const activityTimeline = await Activity.aggregate([
      { $match: { createdBy: user._id } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const challengeTimeline = await Challenge.aggregate([
      { $match: { 'leaderboard.userId': userId } },
      { $unwind: '$leaderboard' },
      { $match: { 'leaderboard.userId': userId } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$leaderboard.submittedAt' } },
          score: { $sum: '$leaderboard.score' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return NextResponse.json({
      userInfo: {
        username: user.username,
        email: user.email,
        totalPoints: user.totalPoints,
        connections: user.connectedUsers.length,
      },
      analytics: {
        activities: {
          total: totalActivities,
          likes: totalLikesReceived[0]?.likes || 0,
          comments: totalCommentsReceived[0]?.comments || 0,
          timeline: activityTimeline,
        },
        challenges: {
          totalParticipated: totalChallenges,
          solved: totalSolvedChallenges,
          timeline: challengeTimeline,
          totalPointsScored: user.totalPoints,
        },
        projects: {
          total: activeProjects.length,
          tasksAssigned: totalTasksAssigned,
          tasksCompleted: completedTasks,
        },
        discussions: {
          joined: totalDiscussionsJoined,
          pendingRequests: totalPendingDiscussionRequests,
        },
      },
      message: 'User analytics fetched successfully',
    });
  } catch (error) {
    console.error('Error in getUserAnalytics:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}