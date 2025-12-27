import { SvelteMap, SvelteSet } from "svelte/reactivity";
import type { Message, User } from "../../../shared/src/index";

class ChatStore {
  users = new SvelteMap<string, User>();
  unread = new SvelteSet<string>();
  messages = new SvelteMap<string, Message[]>();

  searchQuery = $state({
    value: "",
  });

  activeChat = $state<User>({
    uid: "global",
    username: "global",
    age: 18,
    gender: "0",
    country: "0",
  });

  recentChatIds = $derived(new Set(this.messages.keys()));

  recentChats = $derived.by(() => {
    const recentUsers: User[] = [];

    for (const uid of this.recentChatIds) {
      const user = this.users.get(uid);

      // dont push global to recent chats
      if (user && user.uid !== "global") {
        recentUsers.push(user);
      }
    }

    return recentUsers;
  });
}

export const chatStore = new ChatStore();
