import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISubmission extends Document {
  user: mongoose.Types.ObjectId;
  question: mongoose.Types.ObjectId;
  selectedOption: string; // "A", "B", "C", "D"
  isCorrect: boolean;
  pointsEarned: number;
  submittedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SubmissionSchema = new Schema<ISubmission>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    question: {
      type: Schema.Types.ObjectId,
      ref: "Question",
      required: true,
      index: true,
    },
    selectedOption: {
      type: String,
      enum: ["A", "B", "C", "D"],
      required: true,
    },
    isCorrect: {
      type: Boolean,
      required: true,
    },
    pointsEarned: {
      type: Number,
      required: true,
      default: 0,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Composite index to ensure one submission per user per question
SubmissionSchema.index({ user: 1, question: 1 }, { unique: true });

const Submission =
  mongoose.models.Submission ||
  mongoose.model<ISubmission>("Submission", SubmissionSchema);

export default Submission;