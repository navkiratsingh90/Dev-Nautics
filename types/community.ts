
export type MemberRef = {
	_id?: string;
	username?: string;
  };
  
  export type Member = MemberRef | string;
  
  export interface Community {
	_id: string;
	communityName: string;
	slug: string;
	totalMembers: number;
	onlineMembers: number;
  
	createdBy: Member;
	joinedMembers: Member[];
	admins: Member[];
	pendingRequests: Member[];
  
	file?: string;
	about?: string;
	topics: string[];
  
	createdAt: string;
	updatedAt: string;
  }
  
  export function normalizeId(
	value: Member | undefined | null
  ): string {
	if (!value) return "";
  
	if (typeof value === "string") {
	  return value;
	}
  
	return value._id || "";
  }
  