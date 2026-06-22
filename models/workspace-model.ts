import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
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
      default: null,
    },

    status: {
      type: String,
      enum: ["Pending", "In Progress", "Completed"],
      default: "Pending",
    },

    dueDate: {
      type: Date,
    },
  },
  { timestamps: true }
);

const memberRoleSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    role: {
      type: String,
      required: true,
      trim: true,
    },

    totalTasksCompleted: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

const workspaceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
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
        _id: false,

        name: {
          type: String,
          required: true,
        },

        completed: {
          type: Boolean,
          default: false,
        },

        completedAt: Date,
      },
    ],

    githubLink: {
      type: String,
      trim: true,
    },

    commits: [
      {
        _id: false,

        message: String,

        author: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },

        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    status: {
      type: String,
      enum: ["Not Started", "Active", "On Hold", "Completed"],
      default: "Not Started",
    },

    calendarEvents: [
      {
        title: {
          type: String,
          required: true,
        },

        description: String,

        startDate: {
          type: Date,
          required: true,
        },

        endDate: {
          type: Date,
          required: true,
        },

        meetLink: String,
      },
    ],

    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const Workspace =
  mongoose.models.Workspace ||
  mongoose.model("Workspace", workspaceSchema);

export default Workspace;