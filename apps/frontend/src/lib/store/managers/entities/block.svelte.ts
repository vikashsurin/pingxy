import { blockUserRequest, fetchBlockedUsersRequest, unblockUserRequest } from "$lib/store/services/api/block"
import { chatStore } from "../../store.svelte"

export const blockUser = async (targetId: number) => {
    const blockerId = chatStore.currentUser?.id
    const blockedId = targetId
    if (!blockerId || !blockedId) return

    const blockedUser = await blockUserRequest({ blockerId, blockedId })
    if (blockedUser) {
        chatStore.blockedUserIds.add(blockedId)
    }
    return
}


export const unblockUser = async (blockId: number) => {
    if (!blockId) return

    const unblockedUser = await unblockUserRequest({ blockId })
    if (unblockedUser) {
        chatStore.blockedUserIds.delete(blockId)
    }
    return
}

export const fetchBlockedUsers = async () => {
    const blockerId = chatStore.currentUser?.id
    if (!blockerId) return

    const blockedUsers = await fetchBlockedUsersRequest({ blockerId })
    if (blockedUsers) {
        chatStore.blockedUserIds = new Set(blockedUsers.map((user: User) => user.id))
    }
    return
}
