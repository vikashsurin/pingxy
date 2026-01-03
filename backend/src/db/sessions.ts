import { NewSession } from "./schema";
import * as queries from "./queries/sessions.query"

export const createSession = async (session: NewSession) => {
    try {
        await queries.insertSession(session);
    } catch (error) {
        console.error("Error creating session:", error);
    }
}

export const getSession = async (session_id: string) => {
    try {
        const session = await queries.selectSession(session_id)
        if (!session) {
            throw new Error("Session not found");
        }
        return session;
    } catch (error) {
        console.error("Error getting session:", error);
        throw new Error("Error getting session");
    }
}

export const changeSessionActivity = async (session_id: string) => {
    try {
        await queries.updateSessionActivity(session_id);
    } catch (error) {
        console.error("Error updating session activity:", error);
    }
}

export const removeSession = async (session_id: string) => {
    try {
        await queries.deleteSession(session_id);
    } catch (error) {
        console.error("Error deleting session:", error);
    }
}
