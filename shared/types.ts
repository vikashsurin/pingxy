export type Message = {
  type: "message" | "join";
  text: string;
  senderId?: string;
  recipientId?: string;
  senderName?: string;
  timestamp: number;
};

export type User = {
  uid: string | null;
  username: string | null;
};
