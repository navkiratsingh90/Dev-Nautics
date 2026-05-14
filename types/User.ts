// // import { Types } from "mongoose";

// /* ================= EDUCATION ================= */
// export interface IEducation {
//   schoolName: string;
//   degree: string;
//   duration: string;
//   description?: string;
// }

// /* ================= PROJECT ================= */
// export interface IProject {
//   title: string;
//   description?: string;
//   file?: string;
//   techStack: string[];
//   role?: string;
//   duration?: string;
//   githubLink?: string;
//   liveLink?: string;
// }

// /* ================= WORK EXPERIENCE ================= */
// export interface IWorkExperience {
//   companyName: string;
//   duration: string;
//   role?: string;
//   description?: string;
//   location?: string;
// }

// /* ================= SKILLS ================= */
// export interface ISkills {
//   frontend?: string[];
//   backend?: string[];
//   tools?: string[];
//   frameworks?: string[];
//   libraries?: string[];
//   languages?: string[];
// }

// /* ================= USER ================= */
// export interface IUser {
//   _id: string;

//   username: string;
//   email: string;
//   password: string;

//   about?: string;

//   verificationCode?: string;
//   verificationExpiry?: Date;

//   education: IEducation[];
//   workExperience: IWorkExperience[];

//   skills: ISkills;
//   projects: IProject[];

//   totalPendingRequests: string[];
//   connectedUsers: string[];

//   totalPoints: number;

//   googleAccessToken?: string;
//   googleRefreshToken?: string;
//   googleTokenExpiry?: Date;

//   createdAt?: Date;
//   updatedAt?: Date;
// }

// ─── Types ────────────────────────────────────────────────────────────────────
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
    frontend?: string[];
    backend?: string[];
    tools?: string[];
    frameworks?: string[];
    libraries?: string[];
    languages?: string[];
}
export interface IUser {
    _id: string;
    username: string;
    email: string;
    password: string;
    about?: string;
    verificationCode?: string | null;
    verificationExpiry?: Date | null;
    education: IEducation[];
    isVerified : boolean,
    workExperience: IWorkExperience[];
    skills: ISkills;
    projects: IProject[];
    challengesAttended: string[];
    totalPoints: number;
    googleAccessToken?: string;
    googleRefreshToken?: string;
    googleTokenExpiry?: Date;
    createdAt: Date;
    updatedAt: Date;
    // UI extended fields (populated from user profile/API)
    title?: string;
    portfolio?: string;
    connectedUsers?: Array<{ _id: string }>;
    totalPendingRequests?: string[];
    socialLinks?: string[];
}
