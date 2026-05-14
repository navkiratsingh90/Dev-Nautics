import mongoose from 'mongoose'

const educationSchema = new mongoose.Schema({
  schoolName: { type: String, required: true },
  degree: { type: String, required: true },
  duration: { type: String, required: true },
  description: { type: String }
});
const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  file : {type : String},
  techStack: [String],
  role: { type: String },
  duration: { type: String },
  githubLink: { type: String },
  liveLink: { type: String },
});


const workExperienceSchema = new mongoose.Schema({
  companyName: { type: String, required: true },
  duration: { type: String, required: true },
  role: { type: String },
  description: { type: String },
  location: { type: String }
});

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    about: { type: String, default: "" },

    verificationCode: String,
    verificationExpiry: Date,

    education: [educationSchema],
    workExperience: [workExperienceSchema],

    skills: {
      frontend: [String],
      backend: [String],
      tools: [String],
      frameworks: [String],
      libraries: [String],
      languages: [String],
    },
    projects: [projectSchema],
    totalPendingRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    connectedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    totalPoints: { type: Number, default: 0 },
    googleAccessToken: {
      type: String,
    },
    googleRefreshToken: {
      type: String,
    },
    googleTokenExpiry: {
      type : Date
    },
    isVerified : {
      type : boolean,
      default : false;
    }
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;