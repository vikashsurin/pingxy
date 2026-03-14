import { userStore } from "$lib/stores/userStore.svelte";
import { DOMAIN_EVENTS, type User } from "@pingxy/shared";
import { chatStore } from "../../stores/store.svelte";
import { createClientReq } from "../factory";

const createUserManager = () => ({
  setOnlineUsers: (users: User[]) => {
    chatStore.onlineUsers = users;
    userStore.seedFromOnlineUsers(users);
  },

  addOnlineUser: (user: User) => {
    chatStore.onlineUsers.push(user);
    userStore.upsert(user);
  },

  removeOnlineUser: (user: User) => {
    chatStore.onlineUsers = chatStore.onlineUsers.filter(
      (u) => u.id !== user.id,
    );
    userStore.setOffline(user.id);
  },

  handlogleLogout: () => {
    const success = createClientReq(DOMAIN_EVENTS.USERS.LOGOUT, {
      user: chatStore.currentUser!,
    });
    userStore.setOffline(chatStore.currentUser!.id);
  },
});

export const userManager = createUserManager();
