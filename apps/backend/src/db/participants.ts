import { NewParticipant } from "./schema/_schema";
import * as queries from "./queries/participants.query"

export const createParticipant = async (participant: NewParticipant) => {
    try {
        return await queries.insertParticipant(participant);
    }
    catch (error) {
        console.error("Error creating participant:", error);
        throw new Error("Error creating participant");
    }
}

export const getParticipantById = async (participant_id: number) => {
    try {
        return await queries.selectParticipantById(participant_id);
    }
    catch (error) {
        console.error("Error getting participant by id:", error);
        throw new Error("Error getting participant by id");
    }
}

export const getParticipantsByConversationId = async (conversation_id: number) => {
    try {
        return await queries.selectParticipantsByConversationId(conversation_id);
    }
    catch (error) {
        console.error("Error getting participants by conversation id:", error);
        throw new Error("Error getting participants by conversation id");
    }
}

export const changeParticipantRole = async (conversationId: number, userId: string, role: 'admin' | 'moderator' | 'member') => {
    try {
        return await queries.updateParticipantRole(conversationId, userId, role);
    }
    catch (error) {
        console.error("Error updating participant role:", error);
        throw new Error("Error updating participant role");
    }
}

export const removeParticipant = async (conversationId: number, participantId: string) => {
    try {
        return await queries.deleteParticipant(conversationId, participantId);
    }
    catch (error) {
        console.error("Error removing participant:", error);
        throw new Error("Error removing participant");
    }
}