class VirtualStore {
  absoluteLatestMessageId = $state<number>()
  isNotAtBottom = $state<boolean>()
  unreadCount = $state<number>()
}


export const virtualStore = new VirtualStore();
