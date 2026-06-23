// models/UserProgress.ts
import mongoose, { Schema, Document, Model } from "mongoose";

// ─── Interfaces ──────────────────────────────────────────────────────────

interface IDailyAttempt {
  question: mongoose.Schema.Types.ObjectId; // ref: "Question"
  date: string; // "2026-06-24"
  type?: "coding" | "mcq" | "cs_fundamental" | "puzzle";
  correct: boolean;
  pointsEarned: number;
  streakOnDay: number;
  submittedAt: Date;
}

interface IStats {
  answered: number;
  correct: number;
}

interface IStatsPerType {
  coding: IStats;
  mcq: IStats;
  cs_fundamental: IStats;
  puzzle: IStats;
}

export interface IUserProgress extends Document {
  user: mongoose.Schema.Types.ObjectId; // ref: "User"
  totalPoints: number;
  currentStreak: number;
  longestStreak: number;
  lastAnsweredDate: string | null;
  totalAnswered: number;
  totalCorrect: number;
  totalWrong: number;
  stats: IStatsPerType;
  attempts: IDailyAttempt[];
  createdAt?: Date;
  updatedAt?: Date;
}

// ─── Sub‑schemas ────────────────────────────────────────────────────────

const dailyAttemptSchema = new Schema<IDailyAttempt>(
  {
    question:     { type: Schema.Types.ObjectId, ref: "Question", required: true },
    date:         { type: String, required: true },
    type:         { type: String, enum: ["coding", "mcq", "cs_fundamental", "puzzle"] },
    correct:      { type: Boolean, required: true },
    pointsEarned: { type: Number, default: 0 },
    streakOnDay:  { type: Number, default: 1 },
    submittedAt:  { type: Date, default: Date.now },
  },
  { _id: false }
);

// ─── Main Schema ────────────────────────────────────────────────────────

const userProgressSchema = new Schema<IUserProgress>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    totalPoints: { type: Number, default: 0 },

    currentStreak:  { type: Number, default: 0 },
    longestStreak:  { type: Number, default: 0 },
    lastAnsweredDate: { type: String, default: null },

    totalAnswered: { type: Number, default: 0 },
    totalCorrect:  { type: Number, default: 0 },
    totalWrong:    { type: Number, default: 0 },

    stats: {
      coding: {
        answered: { type: Number, default: 0 },
        correct:  { type: Number, default: 0 },
      },
      mcq: {
        answered: { type: Number, default: 0 },
        correct:  { type: Number, default: 0 },
      },
      cs_fundamental: {
        answered: { type: Number, default: 0 },
        correct:  { type: Number, default: 0 },
      },
      puzzle: {
        answered: { type: Number, default: 0 },
        correct:  { type: Number, default: 0 },
      },
    },

    attempts: [dailyAttemptSchema],
  },
  { timestamps: true }
);

// ─── Model registration ────────────────────────────────────────────────

const UserProgress = mongoose.models.UserProgress as Model<IUserProgress>
  || mongoose.model<IUserProgress>("UserProgress", userProgressSchema);

export default UserProgress;