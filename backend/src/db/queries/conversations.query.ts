
import db from "../client";
import { conversations } from "../schema";
import { eq } from "drizzle-orm";
import { NewConversation } from "../schema";

export const insertConversation = async (conversation: NewConversation) => {
    return await db
        .insert(conversations)
        .values(conversation)
        .returning();
}

export const selectConversationById = async (id: number) => {
    return await db
        .select()
        .from(conversations)
        .where(eq(conversations.conversation_id, id))
        .limit(1);
}

export const selectConversationByAuthorId = async (authorId: string) => {
    return await db
        .select()
        .from(conversations)
        .where(eq(conversations.created_by, authorId))
        .limit(1);
}

export const deleteConversation = async (id: number) => {
    return await db
        .delete(conversations)
        .where(eq(conversations.conversation_id, id))
        .returning();
}