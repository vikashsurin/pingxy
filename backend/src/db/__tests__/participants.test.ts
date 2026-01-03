import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { db } from "../client";
import { NewParticipant, participants } from "../schema";

import * as queries from "../queries/participants.query";

describe('Participants Table Schema', () => {
    beforeAll(async () => {
        await db.delete(participants);
    })

    afterAll(async () => {
        await db.delete(participants);
    })

    test('should insert a new participant', async () => {
        const newParticipant: NewParticipant = {
            conversation_id: 7,
            user_id: 'user-2',
            role: 'member' as const,
            joined_at: Math.floor(Date.now() / 1000),
            left_at: Math.floor(Date.now() / 1000),
            is_active: true,
        }
        const result = await queries.insertParticipant(newParticipant)
        expect(result).toHaveLength(1)
    })
})
