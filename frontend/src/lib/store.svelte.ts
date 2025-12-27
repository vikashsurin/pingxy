import { SvelteMap, SvelteSet } from "svelte/reactivity";
import type { Message, User } from "../../../shared/src/index";

export let users = new SvelteMap<string, User>();

export let unread = new SvelteSet<string>();

export let messages = new SvelteMap<string, Message[]>();

export let searchQuery = $state({
  value: "",
});



export let _activeChat = $state<User>({
  uid: "global",
  username: "global",
  age: 18,
  gender: "0",
  country: "0",
});

export let activeChat = {
  get value() {
    return _activeChat;
  },
  set value(user: User) {
    Object.assign(_activeChat, user);
  },
};

let _recentChats = $derived.by(() => {
  return Array.from(messages.keys());
});

export let recentChats = {
  get ids() {
    return _recentChats;
  },
  get value() {
    const recentUsers: User[] = [];

    for (const uid of _recentChats) {
      const user = users.get(uid);

      // dont push global to recent chats
      if (user?.uid === "global") continue;
      if (user) recentUsers.push(user);
    }

    return recentUsers;
  },
};
