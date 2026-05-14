// projectCollab.types.d.ts
export type ProjectStatus = 'Open' | 'In Progress' | 'On Hold' | 'Completed' | 'Closed';

export interface ICurrentTeamMember {
  user: string;       // ref: 'User'
  roleAssigned: string;
}

export interface IProjectCollab {
  _id: string;
  title: string;
  file: string;
  description: string;
  status: ProjectStatus;
  problemStatement?: string;
  Category: string;           // note the capital C
  futureScope?: string;
  rolesLookingFor: string[];
  techStackUsed: string[];
  totalTeamSize: number;
  currentTeamMembers: ICurrentTeamMember[];
  createdBy?: string; // ref: 'User'
  pendingRequests:string[]; // ref: 'User'
  createdAt: Date;
  updatedAt: Date;
}
