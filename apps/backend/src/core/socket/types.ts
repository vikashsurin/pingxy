import { PublicUser } from "@chat/shared/types";

export type WebSocketData = {
    user: PublicUser;
    activeConversations: Set<string>
};