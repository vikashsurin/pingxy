import type { User } from "@pingxy/shared";
import { chatStore } from "../../store.svelte";

export const setOnlineUsers = (users: User[]) => {
  chatStore.onlineUsers = users;
};
