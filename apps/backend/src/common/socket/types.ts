import { PublicUser } from "@pingxy/shared/types";

export type WebSocketData = {
    user: PublicUser;
    activeConversations: Set<string>
};