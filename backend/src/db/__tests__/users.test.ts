import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { db } from "../client";
import { NewUser, users } from "../schema";
import * as queries from "../queries/users.query";

describe('Users Table Schema', async () => {
    beforeAll(async () => {
        // Clear table before tests if needed
        // await db.delete(users);
    })


    test('should insert a user', async () => {
        const newUser: NewUser = {
            id: 'user-1',
            user_type: 'user' as const,
            username: 'Test User',
            passhash: 'password',
            data: { role: 'admin' },
            last_seen_at: null,
            created_at: null,
            updated_at: null,
        }
        const result = await queries.insertUser(newUser)
        expect(result).toHaveLength(1)
    })

    // test('should insert another user', async () => {
    //     const newUser: NewUser = {
    //         id: 'user-2',
    //         user_type: 'user' as const,
    //         username: 'Test User 2',
    //         passhash: 'password',
    //         data: { role: 'admin' },
    //         last_seen_at: null,
    //         created_at: null,
    //         updated_at: null,
    //     }
    //     const result = await insertUser(newUser)
    //     expect(result).toHaveLength(1)
    // })


    test('should select a user by id', async () => {
        const result = await queries.selectUserById('user-1')
        expect(result).toHaveLength(1)
    })

    test('should select a user by username', async () => {
        const result = await queries.selectUserByUsername('Test User')
        expect(result).toHaveLength(1)
    })

    test('should update a user', async () => {
        const result = await queries.updateUser('user-1', { username: 'Test User 2' })
        expect(result).toHaveLength(1)
        expect(result[0].username).toBe('Test User 2')
    })

    test('should select all users', async () => {
        const result = await queries.selectAllUsers()
        expect(result).toBeArray()
    })


    test('should select a user with auth', async () => {
        const result = await queries.selectUserWithAuth('TestUser2')
        expect(result).toHaveLength(1)
        expect(result[0].username).toBe('TestUser2')
    })

    test('should delete a user', async () => {
        const result = await queries.deleteUser('user-1')
        expect(result).toHaveLength(1)
    })
})