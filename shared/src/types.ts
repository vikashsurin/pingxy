export type Message = {
  type: "message";
  kind: "chat" | "system";
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

export type Connection = {
  type: "connection";
  status: "join" | "leave" | "reconnect";
  uid: string;
  username: string;
  text?: string;
};
