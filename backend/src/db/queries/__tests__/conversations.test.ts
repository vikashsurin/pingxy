import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { db } from "../../client";
import { conversations } from "../../schema";

import { getConversationByAuthorId, getConversationById, insertConversation } from "../conversations";


describe('Conversations Table Schema', () => {
    beforeAll(async () => {
        // Clear table before tests if needed

        // await db.delete(conversations);
    })

    test('should insert a new conversation', async () => {
        const newConversation = {
            conversation_type: 'direct' as const,
            name: 'Test Conversation',
            created_by: 'user-2',
            created_at: Math.floor(Date.now() / 1000),
            updated_at: Math.floor(Date.now() / 1000),
        }
        const result = await insertConversation(newConversation)
        console.log({ result })
        expect(result).toHaveLength(1)
    })

    test('should get a conversation by id', async () => {
        const result = await getConversationById(7)
        console.log({ result })
        expect(result).toHaveLength(1)
    })

    test('should get a conversation by author id', async () => {
        const result = await getConversationByAuthorId('user-2')
        console.log({ result })
        expect(result).toHaveLength(1)
    })
})
