import { NewSession } from '../../../../packages/shared/src/lib/utils/temp'
import * as queries from "./queries/sessions.query"


const secret = 'temp_secret';

const hashSessionToken = (token: string) => {
    const hasher = new Bun.CryptoHasher('sha256', secret)
    const hashed_token = hasher.update(token).digest('hex')
    return hashed_token
}

export const createSession = async (
    token: string,
    user_id: number,
    ip_address: string,
    user_agent: string | null | undefined,
) => {
    try {
        const hashed_token = hashSessionToken(token)
        const refresh_token = crypto.randomUUID();
        const expires_at = Math.floor(Date.now() / 1000) + (30 * 60);

        const newSession: NewSession = {
            hashed_token: hashed_token,
            user_id: user_id,
            ip_address: ip_address,
            user_agent: user_agent,
            refresh_token: refresh_token,
            is_active: true,
            last_activity: Math.floor(Date.now() / 1000),
            created_at: Math.floor(Date.now() / 1000),
            updated_at: Math.floor(Date.now() / 1000),
            expires_at: expires_at,
        }
        const [session] = await queries.insertSession(newSession);
        return session;
    } catch (error) {
        console.error("Error creating session:", error);
        throw new Error("Error creating session");
    }
}

export const getSession = async (token: string) => {
    try {
        const [session] = await queries.selectSessionByToken(token)
        if (!session) {
            throw new Error("Session not found");
        }
        return session;
    } catch (error) {
        console.error("Error getting session:", error);
        throw new Error("Error getting session");
    }
}

export const changeSessionActivity = async (token: string) => {
    try {
        await queries.updateSessionActivityByToken(token);
    } catch (error) {
        console.error("Error updating session activity:", error);
    }
}

export const removeSession = async (token: string) => {
    try {
        await queries.deleteSessionByToken(token);
    } catch (error) {
        console.error("Error deleting session:", error);
    }
}
