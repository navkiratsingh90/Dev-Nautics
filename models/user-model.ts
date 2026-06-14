import mongoose, { Document, Schema, Types } from "mongoose";

/* =========================
   Interfaces
========================= */

export interface IEducation {
  schoolName: string;
  degree: string;
  duration: string;
  description?: string;
}

export interface IProject {
  title: string;
  description?: string;
  file?: string;
  techStack: string[];
  role?: string;
  duration?: string;
  githubLink?: string;
  liveLink?: string;
}

export interface IWorkExperience {
  companyName: string;
  duration: string;
  role?: string;
  description?: string;
  location?: string;
}

export interface ISkills {
  frontend: string[];
  backend: string[];
  tools: string[];
  frameworks: string[];
  libraries: string[];
  languages: string[];
}

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;

  about: string;

  verificationCode?: string;
  verificationExpiry?: Date;

  education: IEducation[];
  workExperience: IWorkExperience[];

  skills: ISkills;

  projects: IProject[];

  totalPendingRequests: Types.ObjectId[];
  connectedUsers: Types.ObjectId[];

  totalPoints: number;

  isVerified: boolean;

  createdAt: Date;
  updatedAt: Date;
}

/* =========================
   Schemas
========================= */

const educationSchema = new Schema<IEducation>({
  schoolName: { type: String, required: true },
  degree: { type: String, required: true },
  duration: { type: String, required: true },
  description: { type: String },
});

const projectSchema = new Schema<IProject>({
  title: { type: String, required: true },
  description: { type: String },
  file: { type: String },
  techStack: [{ type: String }],
  role: { type: String },
  duration: { type: String },
  githubLink: { type: String },
  liveLink: { type: String },
});

const workExperienceSchema = new Schema<IWorkExperience>({
  companyName: { type: String, required: true },
  duration: { type: String, required: true },
  role: { type: String },
  description: { type: String },
  location: { type: String },
});

const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    about: {
      type: String,
      default: "",
    },

    verificationCode: {
      type: String,
    },

    verificationExpiry: {
      type: Date,
    },

    education: [educationSchema],

    workExperience: [workExperienceSchema],

    skills: {
      frontend: [{ type: String }],
      backend: [{ type: String }],
      tools: [{ type: String }],
      frameworks: [{ type: String }],
      libraries: [{ type: String }],
      languages: [{ type: String }],
    },

    projects: [projectSchema],

    totalPendingRequests: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    connectedUsers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    totalPoints: {
      type: Number,
      default: 0,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const User =
  mongoose.models.User ||
  mongoose.model<IUser>("User", userSchema);

export default User;