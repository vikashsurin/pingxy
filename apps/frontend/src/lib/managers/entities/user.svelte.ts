import { DOMAIN_EVENTS, type User } from "@pingxy/shared";
import { chatStore } from "../../stores/store.svelte";
import { createClientReq } from "../factory";

const createUserManager = () => ({
  setOnlineUsers: (users: User[]) => {
    chatStore.onlineUsers = users;
  },

  addOnlineUser: (user: User) => {
    chatStore.onlineUsers.push(user);
  },

  removeOnlineUser: (user: User) => {
    chatStore.onlineUsers = chatStore.onlineUsers.filter(
      (u) => u.id !== user.id,
    );
  },

  handlogleLogout: () => {
    const success = createClientReq(DOMAIN_EVENTS.USERS.LOGOUT, {
      user: chatStore.currentUser!,
    });
  },
});
export const userManager = createUserManager();
