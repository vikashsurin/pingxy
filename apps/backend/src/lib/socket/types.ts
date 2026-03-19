import { User } from "@pingxy/shared/types";

export type WebSocketData = {
  user: User;
  activeConversations: Set<string>;
};
