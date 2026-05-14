export interface ICommunity {
  _id: string;

  groupName: string;
  totalMembers: number;

  createdBy: string;

  joinedMembers: string[];
  admins: string[];
  pendingRequests: string[];

  file?: string;
  about?: string;

  onlineMembers: number;
  topics: string[];

  createdAt: Date;
  updatedAt: Date;
}