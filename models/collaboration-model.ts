import mongoose from "mongoose";

const CollaborationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },

    file: {
      type: String, 
			required : true
    },

    description: {
      type: String,
      required: true,
      maxlength: 1000,
    },

    status: {
      type: String,
      enum: ["Open", "In Progress", "On Hold", "Completed", "Closed"],
      default: "Open",
      index: true,
    },

    problemStatement: {
      type: String,
    },

    category: {
      type: String,
      required: true,
      index: true,
    },

    futureScope: {
      type: String,
    },

    rolesLookingFor: {
      type: [String],
      required: true,
    },

    techStackUsed: {
      type: [String],
      required: true,
      index: true,
    },

    totalTeamSize: {
      type: Number,
      required: true,
    },

    currentTeamMembers: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        roleAssigned: {
          type: String,
          required: true,
        },
      },
    ],

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    pendingRequests: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    tags: {
      type: [String],
      default: [],
    },

    deadline: {
      type: Date,
    },
  },
  { timestamps: true }
);


const Collaboration =
mongoose.models.Collaboration || mongoose.model("Collaboration", CollaborationSchema);

export default Collaboration;