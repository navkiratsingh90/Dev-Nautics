// lib/workers/submissionWorker.ts
import connectDb from "@/lib/db";
import UserProgress from "@/models/userProgress-model";
import Question from "@/models/question-model";
import Submission from "@/models/Submission";
import { calculatePoints, updateStreak } from "@/lib/points-helper";

/**
 * BullMQ worker processor for daily coding submissions.
 * Called when a submission job is processed.
 */
export async function processSubmission(job: any) {
  const { submissionId, questionId, userId, streak } = job.data;

  // 1. Connect to DB (outside the worker process, you may already have a connection)
  await connectDb();

  // 2. Fetch the submission record to get the results (already saved by worker)
  const submission = await Submission.findById(submissionId);
  if (!submission) throw new Error(`Submission ${submissionId} not found`);

  // 3. Fetch the question to get difficulty, points, etc.
  const question = await Question.findById(questionId);
  if (!question) throw new Error(`Question ${questionId} not found`);

  // 4. Determine if all test cases passed
  const allPassed = submission.status === "passed" || submission.testResults?.every((r: any) => r.passed);
  const passCount = submission.testResults?.filter((r: any) => r.passed).length || 0;
  const total = submission.testResults?.length || 0;

  // 5. Update user progress (only for daily coding questions)
  let progress = await UserProgress.findOne({ user: userId });
  if (!progress) {
    progress = await UserProgress.create({ user: userId });
  }

  const todayDate = new Date().toISOString().split("T")[0];
  updateStreak(progress, todayDate);

  const { points, multiplier, breakdown } = calculatePoints({
    difficulty: question.difficulty,
    correct: allPassed,
    currentStreak: progress.currentStreak,
  });

  progress.totalPoints = Math.max(0, progress.totalPoints + points);
  progress.totalAnswered += 1;
  if (allPassed) progress.totalCorrect += 1;
  else progress.totalWrong += 1;

  progress.stats.coding.answered += 1;
  if (allPassed) progress.stats.coding.correct += 1;

  progress.attempts.push({
    question: questionId,
    date: todayDate,
    type: "coding",
    correct: allPassed,
    pointsEarned: points,
    streakOnDay: progress.currentStreak,
  });

  await progress.save();

  // 6. Return result to be stored in job's return value
  return {
    allPassed,
    passCount,
    total,
    points,
    breakdown,
    totalPoints: progress.totalPoints,
  };
}