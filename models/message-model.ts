import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    communityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Discussion",
      required: true,
      index: true,
    },

    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    text: {
      type: String,
      trim: true,
      default: "",
    },
    file : {
      type : String,
      default : null
    },
    type: {
      type: String,
      enum: ["text", "media", "file"],
      default: "text",
    },

    fileMeta: {
      url: String,
      mimeType: String, 
      name: String,
      size: Number,
    },

    isDelivered: {
      type: Boolean,
      default: false,
    },

    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Next.js safe model
const Message = mongoose.models.Message || mongoose.model("Message", messageSchema);

export default Message;