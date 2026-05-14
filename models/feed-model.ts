import mongoose from "mongoose";

const feedSchema = new mongoose.Schema({
	description : {
		type : String,
		required : true,
	},
	file : {
		type : String,
	},
	tags: {
		type: [String],
		default: []
	},	
	createdBy: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		required: true
	},	
	likes : {
		type : Number,
		default : 0
	},
	comments: [
    {
      createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      content: {
        type: String,
        required: true,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    }
  ]
},{timestamps : true})

const feed = mongoose.models.Feed ||  mongoose.model("Feed", feedSchema);

export default feed