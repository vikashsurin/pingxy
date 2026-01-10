import { PublicUser } from "@chat/shared/src/lib/utils/validation";

export type WebSocketData = {
    user: PublicUser;
    activeConversations: Set<string>
};