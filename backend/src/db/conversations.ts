import { NewConversation } from "./schema";
import * as queries from "./queries/conversations.query"
export const createConversation = async (conversation: NewConversation) => {
    try {
        return await queries.insertConversation(conversation);
    }
    catch (error) {
        console.error("Error creating conversation:", error);
        throw new Error("Error creating conversation");
    }
}

export const getConversationById = async (conversation_id: number) => {
    try {
        return await queries.selectConversationById(conversation_id);
    }
    catch (error) {
        console.error("Error getting conversation by id:", error);
        throw new Error("Error getting conversation by id");
    }
}


export const removeConversation = async (conversation_id: number) => {
    try {
        return await queries.deleteConversation(conversation_id);
    }
    catch (error) {
        console.error("Error removing conversation:", error);
        throw new Error("Error removing conversation");
    }
}