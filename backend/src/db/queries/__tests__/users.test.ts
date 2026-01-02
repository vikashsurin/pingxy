import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { db } from "../../client";
import { NewUser, users } from "../../schema";
import { deleteUser, getAllUsers, getUserById, getUserByUsername, insertUser, updateUser } from "../users";


describe('Users Table Schema', async () => {
    beforeAll(async () => {
        // Clear table before tests if needed
        // await db.delete(users);
    })


    test('should insert a user', async () => {
        const newUser: NewUser = {
            id: 'user-2',
            user_type: 'user' as const,
            username: 'Test User',
            passhash: 'password',
            data: { role: 'admin' },
            last_seen_at: null,
            created_at: null,
            updated_at: null,
        }
        const result = await insertUser(newUser)
        expect(result).toHaveLength(1)
    })


    test('should get a user by id', async () => {
        const result = await getUserById('user-1')
        expect(result).toHaveLength(1)
    })

    test('should get a user by username', async () => {
        const result = await getUserByUsername('Test User')
        expect(result).toHaveLength(1)
    })

    test('should update a user', async () => {
        const result = await updateUser('user-1', { username: 'Test User 2' })
        expect(result).toHaveLength(1)
        expect(result[0].username).toBe('Test User 2')
    })

    test('should get all users', async () => {
        const result = await getAllUsers()
        expect(result).toHaveLength(1)
    })

    test('should delete a user', async () => {
        const result = await deleteUser('user-1')
        expect(result).toHaveLength(1)
    })
})