import { BlockedRepository } from "./blocked.repository"

export const BlockedUserService = {
    block: async ({ blockerId, blockedId }: { blockerId: number, blockedId: number }) => {
        try {
            const blocked = await BlockedRepository.insert({ blockerId, blockedId })
            return blocked
        } catch (error) {
            throw new Error('error blocking user')
        }
    },

    unblock: async ({ blockId }: { blockId: number }) => {
        try {
            const unblocked = await BlockedRepository.deleteById({ blockId })
            return unblocked
        } catch (error) {
            throw new Error('error unblocking user')
        }
    },

    findById: async ({ blockId }: { blockId: number }) => {
        try {
            const blocked = await BlockedRepository.selectById({ blockId })
            return blocked
        } catch (error) {
            throw new Error('error getting blocked user')
        }
    },

    listBlocked: async ({ blockerId }: { blockerId: number }) => {
        try {
            const blockedUsers = await BlockedRepository.selectAllBlocked({ blockerId })
            return blockedUsers
        } catch (error) {
            throw new Error('error getting blocked users')
        }
    },

    listBlockers: async ({ blockedId }: { blockedId: number }) => {
        try {
            const blockedUsers = await BlockedRepository.selectBlockers({ blockedId })
            return blockedUsers
        } catch (error) {
            throw new Error('error getting blockers')
        }
    },

    find: async ({ blockerId, blockedId }: { blockerId: number, blockedId: number }) => {
        try {
            const blockedUser = await BlockedRepository.selectUnique({ blockerId, blockedId })
            return blockedUser
        } catch (error) {
            throw new Error('error finding blocked user')
        }
    },
    countBlocked: async ({ blockerId }: { blockerId: number }) => {
        try {
            const count = await BlockedRepository.countBlocked({ blockerId })
            return count
        } catch (error) {
            throw new Error('error counting blocked users')
        }
    },

}