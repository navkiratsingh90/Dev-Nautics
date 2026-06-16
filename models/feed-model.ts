import mongoose, { Document, Schema, Types } from "mongoose";

export interface IComment {
  _id?: Types.ObjectId;
  createdBy: Types.ObjectId;
  content: string;
  createdAt?: Date;
}

export interface IFeed extends Document {
  description: string;
  file?: string;
  tags: string[];

  createdBy: Types.ObjectId;

  likes: Types.ObjectId[];
  bookmarks: Types.ObjectId[];

  comments: IComment[];

  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<IComment>(
  {
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: false,
    },
  }
);

const feedSchema = new Schema<IFeed>(
  {
    description: {
      type: String,
      required: true,
      trim: true,
    },

    file: {
      type: String,
    },

    tags: {
      type: [String],
      default: [],
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Store users who liked
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // Store users who bookmarked
    bookmarks: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    comments: [commentSchema],
  },
  {
    timestamps: true,
  }
);

const Feed =
  mongoose.models.Feed ||
  mongoose.model<IFeed>("Feed", feedSchema);

export default Feed;