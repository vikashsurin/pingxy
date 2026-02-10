import { DOMAIN_EVENTS, type User } from "@pingxy/shared";
import { chatStore } from "../../store.svelte";
import { createClientReq } from "../factory";
import { validateSocket } from "$lib/store/helpers";

export const setOnlineUsers = (users: User[]) => {
  chatStore.onlineUsers = users;
};

export const addOnlineUser = (user: User) => {
  chatStore.onlineUsers.push(user);
};

export const removeOnlineUser = (user: User) => {
  chatStore.onlineUsers = chatStore.onlineUsers.filter(
    (u) => u.id !== user.id,
  );
};

export const handleLogin = () => {
  // const message = createClientReq(DOMAIN_EVENTS.USERS.LOGIN, {
  //   user: chatStore.currentUser!,
  // });

  // const socket = validateSocket();
  // if (!socket) return
  // socket.send(JSON.stringify(message));
}

export const handleLogout = () => {
  const message = createClientReq(DOMAIN_EVENTS.USERS.LOGOUT, {
    user: chatStore.currentUser!,
  });

  const socket = validateSocket();
  if (!socket) return
  socket.send(JSON.stringify(message));
  // socket.close()

  chatStore.reset();
}