import { SvelteMap, SvelteSet } from "svelte/reactivity";
import type { Message, User } from "../../../shared/src/index";
import { get } from "svelte/store";
import { set } from "zod";

export let users = new SvelteMap<string, User>();

export let unread = new SvelteSet<string>();

export let messages = new SvelteMap<string, Message[]>();

export let activeSocket = $state<User>({
  uid: "global",
  username: "global",
  age: 18,
  gender: "0",
  country: "0",
});

// export let as = {
//   get() {
//     return activeSocket;
//   },
//   set(value: User) {
//     activeSocket = value;
//   },
// };
let _recentChats = $derived(() => {
  return Array.from(messages.keys());
});

export let getRecentChats = () => _recentChats();
