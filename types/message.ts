
export interface IMessage {
  _id: string;                     // using string as you requested
  communityId: string;            // ref: 'Discussion' – can be string or ObjectId
  senderId: string;                // ref: 'User'
  text: string;                    // default: ''
  file: string | null;          // default: null
  fileMeta: string | undefined;
  isRead : boolean,        // default: false
  isDelivered: boolean;            // default: false
  createdAt: Date;
  updatedAt: Date;
}
