// models/Question.ts
import mongoose, { Schema, Document, Model } from "mongoose";

// ─── Interfaces ──────────────────────────────────────────────────────────

interface IOption {
  label: string; // "A", "B", "C", "D"
  text: string;
}

interface ITestCase {
  input: string;
  expectedOutput: string;
}

export interface IQuestion extends Document {
  title: string;
  description: string;
  type: "coding" | "mcq" | "cs_fundamental" | "puzzle";
  difficulty: "easy" | "medium" | "hard";
  basePoints: number;
  penaltyPoints: number;
  options?: IOption[];
  correctOption?: string; // "A", "B", "C", "D"
  testCases?: ITestCase[];
  starterCode?: Record<string, string>; // { python: "...", javascript: "..." }
  supportedLangs?: string[];
  correctAnswer?: string;
  explanation?: string;
  scheduledDate?: string; // "2026-06-24"
  isActive: boolean;
  tags: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

// ─── Sub‑schemas ────────────────────────────────────────────────────────

const optionSchema = new Schema<IOption>(
  {
    label: { type: String, required: true },
    text:  { type: String, required: true },
  },
  { _id: false }
);

const testCaseSchema = new Schema<ITestCase>(
  {
    input:          { type: String, default: "" },
    expectedOutput: { type: String, required: true },
  },
  { _id: false }
);

// ─── Main Schema ────────────────────────────────────────────────────────

const questionSchema = new Schema<IQuestion>(
  {
    title:       { type: String, required: true },
    description: { type: String, required: true },

    type: {
      type: String,
      enum: ["coding", "mcq", "cs_fundamental", "puzzle"],
      required: true,
    },

    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      required: true,
    },

    basePoints:    { type: Number, required: true },
    penaltyPoints: { type: Number, required: true },

    // ── MCQ / CS fundamental / Puzzle fields ─────────────────────
    options:       { type: [optionSchema], default: undefined },
    correctOption: { type: String, select: false },

    // ── Coding fields ─────────────────────────────────────────────
    testCases:      { type: [testCaseSchema], select: false },
    starterCode:    { type: Schema.Types.Mixed }, // object
    supportedLangs: { type: [String], default: ["python", "javascript", "cpp", "java"] },

    // ── Puzzle / theory fields ────────────────────────────────────
    correctAnswer: { type: String, select: false },
    explanation:   { type: String },

    scheduledDate: { type: String },
    isActive:      { type: Boolean, default: true },
    tags:          { type: [String], default: [] },
  },
  { timestamps: true }
);

// Index for fast daily lookup
questionSchema.index({ scheduledDate: 1, isActive: 1 });

// ─── Model registration ────────────────────────────────────────────────

// Prevent overwriting the model if already compiled (for Next.js hot reloading)
const Question = mongoose.models.Question as Model<IQuestion>
  || mongoose.model<IQuestion>("Question", questionSchema);

export default Question;