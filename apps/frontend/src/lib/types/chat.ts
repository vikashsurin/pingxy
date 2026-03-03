import type { Participant } from "@pingxy/shared";

interface HydratedParticipant {
  participantId: number;
  conversationId: number;
  userId: number;
  role: "member" | "admin" | "moderator";
  joinedAt: string;
  leftAt: null;
  isActive: true;
  username: string;
  userType: "user" | "guest";
  data: {
    gender: string;
    age: number;
    country: string;
    roles: string[];
  };
}
export interface UIConversation extends Participant {
  type: "direct" | "group";
  displayName: string;
  lastMessageId: number;
  unreadCount: number;
  updatedAt: string;
  partner: {
    id: number;
    username: string;
    gender: string;
    age: number;
    country: string;
  };

  participants: HydratedParticipant[];
}
