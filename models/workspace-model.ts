import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
    trim: true,
  },

  priority: {
    type: String,
    enum: ["Low", "Medium", "High"],
    default: "Low",
  },

  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  status: {
    type: String,
    enum: ["Pending", "In Progress", "Completed"],
    default: "Pending",
  },

  dueDate: {
    type: Date,
  },
}, { timestamps: true });

const memberRoleSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  role: {
    type: String,
    required: true,
  },

  totalTasksCompleted: {
    type: Number,
    default: 0,
  },
});

const workspaceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
    },

    leader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    members: {
      type: [memberRoleSchema],
      default: [],
    },

    tasks: {
      type: [taskSchema],
      default: [],
    },

    timeline: [
      {
        name: String,
        completed: { type: Boolean, default: false },
      },
    ],

    githubLink: {
      type: String,
    },

    commits: [
      {
        message: String,
        date: { type: Date, default: Date.now },
      },
    ],

    status: {
      type: String,
      enum: ["Active", "On Hold", "Completed", "Not Started"],
      default: "Not Started",
    },

    calendarEvents: [
      {
        googleEventId: String,
        title: String,
        description: String,
        startDate: Date,
        endDate: Date,
        meetLink: String,
      },
    ],
    tags: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

const Workspace = mongoose.models.Workspace || mongoose.model("Workspace", workspaceSchema);

export default Workspace;