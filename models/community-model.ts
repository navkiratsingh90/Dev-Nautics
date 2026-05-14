import mongoose from "mongoose";

const communitySchema = new mongoose.Schema(
    {
        communityName: {
            type: String,
            required: true,
        },
        slug: {
            type: String,
            required: true,
        },
        totalMembers: {
            type: Number,
            default: 0,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        joinedMembers: [
					{ 
						type: mongoose.Schema.Types.ObjectId, 
						ref: "User" 
					}
				],
        admins: [
					{ 
						type: mongoose.Schema.Types.ObjectId,
						 ref: "User" 
					}
				],
        pendingRequests: [
            { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        ],
        file: {
            type: String,
        },
        about: {
            type: String,
        },
        onlineMembers: {
            type: Number,
            default: 0,
        },
        topics: {
            type: [String],
            default: [],
        },
    },
    { timestamps: true }
);

const Community =
    mongoose.models.Community || mongoose.model("Community", communitySchema);

export default Community;
