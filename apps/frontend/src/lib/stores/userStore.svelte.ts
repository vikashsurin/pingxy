import { createUserApi } from "$lib/api/user.api";
import type { User } from "@pingxy/shared";
import { SvelteMap, SvelteSet } from "svelte/reactivity";

class UserStore {
  blockedUserIds = new SvelteSet<number>();
  blockedUsers = new SvelteMap<number, User>();

  #cache = new SvelteMap<number, User>();
  #pending = new SvelteSet();


  // 1. #Users#
  get(id: number) {
    return this.#cache.get(id);
  }

  getOnlineUsers() {
    return Array.from(this.#cache.values()).filter((u) => u.isOnline);
  }

  getUsers() {
    return Array.from(this.#cache.values());
  }

  getOfflineUsers() {
    return Array.from(this.#cache.values()).filter((u) => !u.isOnline);
  }

  upsert(user: User) {
    this.#cache.set(user.id, user);
  }

  setOnline(id: number) {
    const user = this.#cache.get(id);
    if (user) this.#cache.set(id, { ...user, isOnline: true });
  }

  setOffline(id: number) {
    const user = this.#cache.get(id);
    if (user) this.#cache.set(id, { ...user, isOnline: false });
  }

  // filter blocked users
  seedFromOnlineUsers(users: any[]) {
    for (const user of users) {
      this.#cache.set(user.id, { ...user, isOnline: true });
    }
  }

  async fetchIfMissing(id: number) {
    if (this.#cache.has(id) || this.#pending.has(id)) return;

    this.#pending.add(id);
    const userApi = createUserApi();
    const user = await userApi.fetchUserDetails({ id });

    this.#cache.set(id, { ...user, isOnline: false });
    this.#pending.delete(id);
  }


  // 2. #BLOCK#
  blockUser(id: number) {
    this.blockedUserIds.add(id);
  }

  unblockUser(id: number) {
    this.blockedUserIds.delete(id);
  }

  isBlocked(id: number) {
    return this.blockedUserIds.has(id);
  }

  getBlockedUserIds() {
    return Array.from(this.blockedUserIds);
  }
  // change blocked user type
  //  handle load blocked users with data.
  seedFromBlockedUsers(blockedUserIds: any[]) {
    for (const block of blockedUserIds) {
      this.blockedUserIds.add(block.blockedId);

      // const existing = this.blockedUsers.get(block.id);
      // if (!existing) {
      //   this.blockedUsers.set(block.id, b);
      // }
    }
  }
}

export const userStore = new UserStore();
