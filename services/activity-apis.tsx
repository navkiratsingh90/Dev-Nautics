import axios from "axios";
import { toast } from "sonner";

// Type definitions
interface Activity {
  _id: string;
  description: string;
  file?: string;
  likes: string[];
  comments: Comment[];
  createdBy: {
    _id: string;
    username: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface Comment {
  _id: string;
  content: string;
  createdBy: {
    _id: string;
    username: string;
  };
  createdAt: string;
}

interface PaginatedResponse<T> {
  data: T[];
  totalPages: number;
  currentPage: number;
  totalItems: number;
}

// Configure axios instance
const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000/api/activity",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

/* ================= CREATE ACTIVITY ================= */
export const createActivity = async (data: FormData): Promise<Activity> => {
  try {
    const res = await API.post("/create", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    toast.success("Activity created successfully 🚀");
    return res.data;
  } catch (error: any) {
    toast.error(error.response?.data?.message || "Failed to create activity");
    throw error;
  }
};

/* ================= GET ALL ACTIVITIES ================= */
export const getActivities = async (params: {
  page?: number;
  limit?: number;
} = {}): Promise<PaginatedResponse<Activity>> => {
  try {
    const res = await API.get("/get-activities", { params });
    return res.data;
  } catch (error: any) {
    toast.error("Failed to load activities");
    throw error;
  }
};

/* ================= GET ACTIVITY BY ID ================= */
export const getActivityById = async (id: string): Promise<Activity> => {
  try {
    const res = await API.get(`/${id}`);
    return res.data;
  } catch (error: any) {
    toast.error("Activity not found");
    throw error;
  }
};

/* ================= DELETE ACTIVITY ================= */
export const deleteActivity = async (id: string): Promise<{ message: string }> => {
  try {
    const res = await API.delete(`/${id}`);
    toast.success("Activity deleted ✅");
    return res.data;
  } catch (error: any) {
    toast.error("Failed to delete activity");
    throw error;
  }
};

/* ================= LIKE / UNLIKE ACTIVITY ================= */
export const likeActivity = async (id: string): Promise<{ liked: boolean }> => {
  try {
    const res = await API.post(`/${id}/like`);
    toast.success(res.data.liked ? "Liked ❤️" : "Unliked 💔");
    return res.data;
  } catch (error: any) {
    toast.error("Failed to like activity");
    throw error;
  }
};

/* ================= ADD COMMENT ================= */
export const addComment = async (
  activityId: string,
  content: string
): Promise<Comment> => {
  try {
    const res = await API.post(`/${activityId}/comments`, { content });
    toast.success("Comment added 💬");
    return res.data;
  } catch (error: any) {
    toast.error("Failed to add comment");
    throw error;
  }
};

/* ================= DELETE COMMENT ================= */
export const deleteComment = async (
  activityId: string,
  commentId: string
): Promise<{ message: string }> => {
  try {
    const res = await API.delete(`/${activityId}/comments/${commentId}`);
    toast.success("Comment deleted 🗑️");
    return res.data;
  } catch (error: any) {
    toast.error("Failed to delete comment");
    throw error;
  }
};

/* ================= USER FEED ================= */
export const getUserFeed = async (params: {
  page?: number;
  limit?: number;
} = {}): Promise<PaginatedResponse<Activity>> => {
  try {
    const res = await API.get("/feed", { params });
    return res.data;
  } catch (error: any) {
    toast.error("Failed to load feed");
    throw error;
  }
};

/* ================= TRENDING ACTIVITIES ================= */
export const getTrendingActivities = async (): Promise<Activity[]> => {
  try {
    const res = await API.get("/trending");
    return res.data;
  } catch (error: any) {
    toast.error("Failed to load trending activities");
    throw error;
  }
};

/* ================= GET ACTIVITIES BY TAG (commented in original) ================= */
// export const getActivitiesByTag = async (tag: string, params: { page?: number; limit?: number } = {}): Promise<PaginatedResponse<Activity>> => {
//   try {
//     const res = await API.get(`/tag/${tag}`, { params });
//     return res.data;
//   } catch (error: any) {
//     toast.error("Failed to load tag activities");
//     throw error;
//   }
// };