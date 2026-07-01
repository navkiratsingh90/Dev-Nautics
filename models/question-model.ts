import mongoose, { Schema, Document, Model } from "mongoose";

export interface IQuestion extends Document {
  category: "aptitude" | "cs_fundamental" | "puzzle" | "dsa" | "pseudo";
  question: string;
  image?: string;
  options: string[];
  correctOption: string; // "A", "B", "C", "D"
  explanation?: string;
  difficulty?: "easy" | "medium" | "hard";
  tags?: string[];
  isActive: boolean;
  scheduledDate?: string;
  createdAt: Date;
  updatedAt: Date;
}

const QuestionSchema = new Schema<IQuestion>(
  {
    category: {
      type: String,
      enum: ["aptitude", "cs_fundamental", "puzzle", "dsa", "pseudo"],
      required: true,
      // index: true, // removed to avoid duplicate index warning
    },
    question: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      trim: true,
    },
    options: {
      type: [String],
      required: true,
      validate: {
        validator: (v: string[]) => v.length === 4,
        message: "Options must have exactly 4 items",
      },
    },
    correctOption: {
      type: String,
      required: true,
      enum: ["A", "B", "C", "D"],
    },
    explanation: {
      type: String,
      trim: true,
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },
    tags: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    scheduledDate: {
      type: String,
    },
  },
  { timestamps: true }
);

// ─── Indexes ─────────────────────────────────────────────────────────────
QuestionSchema.index({ category: 1 });
QuestionSchema.index({ scheduledDate: 1, isActive: 1 });
QuestionSchema.index({ tags: 1 });

// ─── Model ──────────────────────────────────────────────────────────────
const Question: Model<IQuestion> =
  mongoose.models.Question || mongoose.model<IQuestion>("Question", QuestionSchema);

export default Question;