import { beforeAll, describe, expect, it } from "bun:test";
import { BlockedRepository } from "./blocked.repository";

describe("BlockedRepository", () => {

    beforeAll(async () => {

    })

    it('should block a user', async () => {
        const blockedUser = await BlockedRepository.insert({ blockerId: 2, blockedId: 5 })
        console.log({ blockedUser })
        expect(blockedUser).toBeDefined()
    })


    const blockId = 5;
    it('should unblock a user', async () => {
        const blockedUser = await BlockedRepository.deleteById({ blockId })
        console.log({ blockedUser })
        expect(blockedUser).toBeDefined()
    })

    it('should select blocked user', async () => {
        const blockedUser = await BlockedRepository.selectById({ blockId })
        console.log({ blockedUser })
        expect(blockedUser).toBeDefined()
    })


    const blockerId = 2;

    it('should select all blocked users', async () => {
        const blockedUsers = await BlockedRepository.selectAllBlocked({ blockerId })
        console.log({ blockedUsers })
        expect(blockedUsers).toBeArray()
    })

    const blockedId = 5;

    it('should select blocked user', async () => {
        const blockedUsers = await BlockedRepository.selectUnique({ blockerId, blockedId })
        console.log({ blockedUsers })
        expect(blockedUsers).toBeDefined()
    })
});