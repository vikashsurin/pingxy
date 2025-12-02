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

export type Join = {
  type: "join";
  uid: string;
  username: string;
  reconnecting: boolean;
};

export type Connection = {
  status: "join" | "leave" | "reconnect";
  uid: string;
  username: string;
};
