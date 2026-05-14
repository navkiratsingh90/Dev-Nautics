

export interface User {
  _id: string;
  username: string;
  avatar?: string;
}

export interface Comment {
  _id: string;
  content: string;
  createdBy: User;
  createdAt: string;
}

export interface Activity {
  _id: string;
  description: string;
  file?: string;
  likes: string[];
  comments: Comment[];
  createdBy: User;
  createdAt: string;
}

// export interface PaginatedResponse<T> {
//   data: T[];
//   totalPages: number;
//   currentPage: number;
//   totalItems: number;
// }