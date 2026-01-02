import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { db } from "../../client";
import { messages, NewMessage } from "../../schema";

import { deleteMessage, getMessageById, getMessagesByConversationId, getMessagesBySenderId, insertMessage, updateMessage } from "../messages";


describe('Messages Table Schema', () => {
    beforeAll(async () => {
        // await db.delete(messages);
    })

    test('should insert a new message', async () => {
        const newMessage: NewMessage = {
            conversation_id: 7,
            sender_id: 'user-2',
            content: 'Hello',
        }
        const result = await insertMessage(newMessage)
        expect(result).toHaveLength(1)
    })

    test('should update a message', async () => {
        const result = await updateMessage(6, { content: 'Hello World' })
        expect(result).toHaveLength(1)
    })

    // test('should delete a message', async () => {
    //     const result = await deleteMessage(9)
    //     expect(result).toHaveLength(1)
    // })

    test('should get a message by id', async () => {
        const result = await getMessageById(6)
        expect(result).toHaveLength(1)
    })

    test('should get messages by conversation id', async () => {
        const result = await getMessagesByConversationId(7)
        console.log({ result })
        expect(result).toBeArray()
    })

    test('should get messages by sender id', async () => {
        const result = await getMessagesBySenderId('user-2')
        console.log({ result })
        expect(result).toBeArray()
    })
})
