import { describe, it, expect, beforeAll, afterAll } from "bun:test";
import { Database } from "bun:sqlite";
import { mock } from "bun:test";

// Create in-memory DB for testing
const testDb = new Database(":memory:");

// Mock the client module to return our test database
// We use a relative path matching how rooms.ts imports it
mock.module("../../client", () => {
    return {
        db: testDb,
    };
});

// Import the function AFTER mocking
// Note: We need to ensure we import the module that uses the mock
import { deleteRoomById, fetchAllRooms, fetchRoomById, insertRoom, updateRoomSettings } from "../rooms";

describe("rooms queries", () => {
    beforeAll(() => {
        // Setup schema matches what is expected by insertRoom
        testDb.run(`
        CREATE TABLE IF NOT EXISTS rooms (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        max_users INTEGER DEFAULT 5,
        type TEXT CHECK (type IN ('private', 'public')) DEFAULT 'public',
        password TEXT,
        created_by TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      )
    `);
    });

    afterAll(() => {
        testDb.close();
    });

    it("should insert a room correctly", () => {
        const room = {
            id: "room-111",
            name: "Test Room",
            description: 'Room description',
            maxUsers: 5,
            type: 'private',
            password: "password",
            createdBy: "user-456",
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };

        insertRoom(
            room.id,
            room.name,
            room.description,
            room.maxUsers,
            room.type,
            room.password,
            room.createdBy,
            room.createdAt,
            room.updatedAt
        );

        const result = testDb
            .query("SELECT * FROM rooms WHERE id = $id")
            .get({ $id: room.id }) as any;

        expect(result).not.toBeNull();
        expect(result.id).toBe(room.id);
        expect(result.name).toBe(room.name);
        expect(result.type).toBe(room.type);
        expect(result.created_by).toBe(room.createdBy);
        expect(result.created_at).toBe(room.createdAt);
        expect(result.updated_at).toBe(room.updatedAt);
    });

    it("should fetch a room correctly", () => {
        const room = {
            id: "room-112",
            name: "Test Room",
            description: "Test Room Description",
            maxUsers: 5,
            type: 'private',
            password: "password",
            createdBy: "user-456",
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };

        insertRoom(
            room.id,
            room.name,
            room.description,
            room.maxUsers,
            room.type,
            room.password,
            room.createdBy,
            room.createdAt,
            room.updatedAt
        );

        const result = fetchRoomById(room.id) as any

        expect(result).not.toBeNull();
        expect(result.id).toBe(room.id);
        expect(result.name).toBe(room.name);
        expect(result.type).toBe(room.type);
        expect(result.created_by).toBe(room.createdBy);
        expect(result.created_at).toBe(room.createdAt);
        expect(result.updated_at).toBe(room.updatedAt);
    });

    it("should fetch all rooms correctly", () => {
        const room = {
            id: "room-113",
            name: "Test Room",
            description: "Test Room Description",
            maxUsers: 5,
            type: "private",
            password: "password",
            createdBy: "user-456",
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };

        insertRoom(
            room.id,
            room.name,
            room.description,
            room.maxUsers,
            room.type,
            room.password,
            room.createdBy,
            room.createdAt,
            room.updatedAt
        );

        const result = fetchAllRooms() as any

        expect(result).not.toBeNull();
        expect(result.length).toBe(3);
    });

    it("should update room type correctly", () => {
        const room = {
            id: "room-114",
            name: "Test Room",
            description: "Test Room Description",
            maxUsers: 5,
            type: "private",
            password: "password",
            createdBy: "user-456",
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };

        insertRoom(
            room.id,
            room.name,
            room.description,
            room.maxUsers,
            room.type,
            room.password,
            room.createdBy,
            room.createdAt,
            room.updatedAt
        );

        updateRoomSettings(room.id, { type: "public" });

        const result = fetchRoomById(room.id) as any

        expect(result).not.toBeNull();
        expect(result.type).toBe("public");
    });

    it("should delete room correctly", () => {
        const room = {
            id: "room-115",
            name: "Test Room",
            description: "Test Room Description",
            maxUsers: 5,
            type: "private",
            password: 'password',
            createdBy: "user-456",
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };

        insertRoom(
            room.id,
            room.name,
            room.description,
            room.maxUsers,
            room.type,
            room.password,
            room.createdBy,
            room.createdAt,
            room.updatedAt
        );

        deleteRoomById(room.id);

        const result = fetchRoomById(room.id) as any

        expect(result).toBeNull();
    });

    it("should update room settings correctly", () => {
        const room = {
            id: "room-116",
            name: "Test Room",
            description: "Test Room Description",
            maxUsers: 5,
            type: "private",
            password: "password",
            createdBy: "user-456",
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };

        insertRoom(
            room.id,
            room.name,
            room.description,
            room.maxUsers,
            room.type,
            room.password,
            room.createdBy,
            room.createdAt,
            room.updatedAt
        );

        updateRoomSettings(room.id, {
            name: "Test Room 2",
            description: "Test Room Description 2",
            max_users: 10,
            type: "public",
            password: "password2",
        });

        const result = fetchRoomById(room.id) as any

        expect(result).not.toBeNull();
        expect(result.name).toBe("Test Room 2");
        expect(result.description).toBe("Test Room Description 2");
        expect(result.max_users).toBe(10);
        expect(result.type).toBe("public");
        expect(result.password).toBeUndefined();
        expect(result.created_by).toBe("user-456");

    });

    it('should update room password correctly', () => {
        const room = {
            id: "room-117",
            name: "Test Room",
            description: "Test Room Description",
            maxUsers: 5,
            type: "private",
            password: "password",
            createdBy: "user-456",
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };

        insertRoom(
            room.id,
            room.name,
            room.description,
            room.maxUsers,
            room.type,
            room.password,
            room.createdBy,
            room.createdAt,
            room.updatedAt
        );

        updateRoomSettings(room.id, { password: "password2" });

        const result = fetchRoomById(room.id) as any

        expect(result).not.toBeNull();
        expect(result.password).toBeUndefined();
    });
});
